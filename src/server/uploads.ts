import { eq } from 'drizzle-orm';
import {
  aspectRatio,
  cropVersion,
  isValidCrop,
  r2Keys,
  usageAspect,
  wantedWidths,
  widthsToGenerate,
} from '@/lib/crop';
import { z } from 'zod';
import { fail, type Failure } from '@/lib/result';
import { uploadFieldsSchema } from '@/lib/schemas';
import { getDb, schema, type Db } from './db/client';
import {
  extensionFor,
  maxOriginalBytes,
  maxVersionBytes,
  sniffImageType,
  type SniffedType,
} from './files';
import { getEnv } from './env';
import { deleteByPrefix, photoUrl, putObject } from './storage';

const IMMUTABLE = 'public, max-age=31536000, immutable';

export interface UploadDeps {
  db: Db;
  bucket: R2Bucket;
  /** Base of public photo URLs (`/img` or `https://img.[domain]`). */
  imgBase: string;
  /** Moment and randomness, injected so tests are exact. */
  now: () => number;
  randomId: () => string;
}

export interface UploadSuccess {
  ok: true;
  data: { photoId: string; version: string; widths: number[]; urls: Record<string, string> };
}

export interface UploadResponse {
  status: number;
  body: UploadSuccess | Failure;
}

const failure = (
  status: number,
  code: Parameters<typeof fail>[0],
  details?: Record<string, unknown>,
) => ({
  status,
  body: fail(code, details),
});

/** A file field of the form that really is a File with bytes. */
function asFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

async function readChecked(
  file: File,
  maxBytes: number,
  allowed: readonly SniffedType[],
): Promise<{ bytes: Uint8Array; type: SniffedType } | UploadResponse> {
  if (file.size > maxBytes) return failure(413, 'FILE_TOO_LARGE');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  // The bytes decide, and the declared Content-Type must agree with them.
  if (!type || !allowed.includes(type) || (file.type && file.type !== type))
    return failure(415, 'FILE_TYPE');
  return { bytes, type };
}

const isResponse = (v: unknown): v is UploadResponse =>
  typeof v === 'object' && v !== null && 'status' in v;

/**
 * `POST /api/admin/upload` without the HTTP plumbing (docs/10 §4). One photo per call:
 * validates everything first, uploads, and on any failure deletes what it already uploaded.
 * Session checks happen before this function (middleware and route).
 */
export async function handleUpload(form: FormData, deps: UploadDeps): Promise<UploadResponse> {
  const fieldsRaw = Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
  const parsed = uploadFieldsSchema.safeParse(fieldsRaw);
  if (!parsed.success) {
    return failure(400, 'VALIDATION', { fields: z.flattenError(parsed.error).fieldErrors });
  }
  const f = parsed.data;
  if (usageAspect[f.kind] !== f.aspect)
    return failure(400, 'VALIDATION', { fields: { aspect: ['wrong shape'] } });

  const isRecenter = f.photoId !== undefined;
  let original = { width: f.originalWidth, height: f.originalHeight };
  if (isRecenter) {
    const [row] = await deps.db
      .select()
      .from(schema.photos)
      .where(eq(schema.photos.id, f.photoId as string));
    if (!row || row.ownerType !== f.kind) return failure(422, 'PHOTO_NOT_FOUND');
    // The stored original is the truth; the client's numbers are ignored when re-centering.
    original = { width: row.originalWidth, height: row.originalHeight };
  }

  const crop = { x: f.cropX, y: f.cropY, width: f.cropWidth, height: f.cropHeight };
  if (!isValidCrop(crop, original.width, original.height)) {
    return failure(400, 'VALIDATION', { fields: { crop: ['outside the original'] } });
  }
  if (Math.abs(crop.width / crop.height - aspectRatio(f.aspect)) > 0.02) {
    return failure(400, 'VALIDATION', { fields: { crop: ['wrong shape'] } });
  }

  // The widths must be exactly the ones this crop allows (never enlarged, docs/12 §3).
  const expected = widthsToGenerate(crop.width, wantedWidths[f.kind]);
  const sent = [...f.widths].sort((a, b) => a - b);
  if (expected.length !== sent.length || expected.some((w, i) => w !== sent[i])) {
    return failure(400, 'VALIDATION', { fields: { widths: [`expected ${expected.join(',')}`] } });
  }

  // Read and check every file BEFORE touching R2 or D1.
  const originalFile = asFile(form.get('original'));
  if (!isRecenter && !originalFile)
    return failure(400, 'VALIDATION', { fields: { original: ['required'] } });

  const checkedOriginal = originalFile
    ? await readChecked(originalFile, maxOriginalBytes, ['image/jpeg', 'image/png', 'image/webp'])
    : null;
  if (isResponse(checkedOriginal)) return checkedOriginal;

  const variants: { width: number; bytes: Uint8Array }[] = [];
  for (const width of sent) {
    const file = asFile(form.get(`w${width}`));
    if (!file) return failure(400, 'VALIDATION', { fields: { [`w${width}`]: ['required'] } });
    const checked = await readChecked(file, maxVersionBytes, ['image/webp']);
    if (isResponse(checked)) return checked;
    variants.push({ width, bytes: checked.bytes });
  }

  let og: Uint8Array | null = null;
  if (f.kind === 'product') {
    const file = asFile(form.get('og'));
    if (!file) return failure(400, 'VALIDATION', { fields: { og: ['required'] } });
    const checked = await readChecked(file, maxVersionBytes, ['image/jpeg']);
    if (isResponse(checked)) return checked;
    og = checked.bytes;
  }

  const photoId = f.photoId ?? deps.randomId();
  const version = cropVersion(crop, `${deps.now()}-${deps.randomId()}`);
  const uploadedPrefixes = [r2Keys.versionPrefix(photoId, version)];
  if (!isRecenter) uploadedPrefixes.push(r2Keys.prefix(photoId));

  try {
    const urls: Record<string, string> = {};
    if (checkedOriginal) {
      const key = r2Keys.original(photoId, extensionFor[checkedOriginal.type]);
      await putObject(key, checkedOriginal.bytes, checkedOriginal.type, deps.bucket, IMMUTABLE);
    }
    for (const v of variants) {
      const key = r2Keys.variant(photoId, version, v.width);
      await putObject(key, v.bytes, 'image/webp', deps.bucket, IMMUTABLE);
      urls[String(v.width)] = photoUrl(key, deps.imgBase);
    }
    if (og) {
      const key = r2Keys.og(photoId, version);
      await putObject(key, og, 'image/jpeg', deps.bucket, IMMUTABLE);
      urls['og'] = photoUrl(key, deps.imgBase);
    }

    if (!isRecenter && checkedOriginal) {
      await deps.db.insert(schema.photos).values({
        id: photoId,
        ownerType: f.kind,
        ownerId: null,
        status: 'pending',
        originalKey: r2Keys.original(photoId, extensionFor[checkedOriginal.type]),
        originalWidth: original.width,
        originalHeight: original.height,
        cropX: crop.x,
        cropY: crop.y,
        cropWidth: crop.width,
        cropHeight: crop.height,
        aspect: f.aspect,
        version,
        widths: JSON.stringify(sent),
      });
    }
    // Re-centering does not touch the row: saveProduct / saveHero apply it on save (docs/10 §4).
    return { status: 200, body: { ok: true, data: { photoId, version, widths: sent, urls } } };
  } catch (error) {
    // Something failed halfway: remove everything this call managed to upload.
    for (const prefix of uploadedPrefixes) {
      await deleteByPrefix(prefix, deps.bucket).catch(() => undefined);
    }
    throw error;
  }
}

/** The real dependencies of the Worker: production code calls this one (docs/07 §6). */
export function runUpload(form: FormData): Promise<UploadResponse> {
  const env = getEnv();
  return handleUpload(form, {
    db: getDb(),
    bucket: env.BUCKET,
    imgBase: env.PUBLIC_IMG_BASE,
    now: () => Date.now(),
    randomId: () => crypto.randomUUID().replace(/-/g, '').slice(0, 20),
  });
}
