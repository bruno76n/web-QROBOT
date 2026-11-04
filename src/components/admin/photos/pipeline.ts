/**
 * The browser side of photos (docs/12 §3): prepare the original, cut the versions with a canvas
 * and upload them. Browser only. The maths (widths, og layout) comes from `src/lib/crop.ts`.
 */
import imageCompression from 'browser-image-compression';
import {
  aspectRatio,
  ogLayout,
  usageAspect,
  variantHeight,
  widthsToGenerate,
  wantedWidths,
  type CropRect,
  type PhotoUsage,
} from '@/lib/crop';
import type { ErrorCode } from '@/lib/result';
import { isHeic, isSupportedPhoto } from '@/lib/photo-files';
import { maxOriginalBytes } from '@/lib/photo-limits';

export class PhotoError extends Error {
  constructor(public code: ErrorCode) {
    super(code);
  }
}

export interface PreparedOriginal {
  blob: Blob;
  width: number;
  height: number;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))),
      type,
      quality,
    ),
  );
}

/**
 * Steps 2–3 of docs/12 §3: HEIC → JPG (loaded only then), resize to at most 4000 px on the long
 * side, and a final re-encode on a canvas, which applies the EXIF orientation and drops every
 * metadata block, GPS included (docs/13 §5).
 */
export async function prepareOriginal(file: File): Promise<PreparedOriginal> {
  if (file.size > maxOriginalBytes) throw new PhotoError('FILE_TOO_LARGE');
  if (!isSupportedPhoto(file)) throw new PhotoError('FILE_TYPE');

  let source: Blob = file;
  if (isHeic(file)) {
    try {
      const { default: heic2any } = await import('heic2any');
      const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      source = Array.isArray(out) ? (out[0] as Blob) : out;
    } catch {
      throw new PhotoError('FILE_TYPE');
    }
  }
  const asFile = new File([source], 'photo', { type: source.type || 'image/jpeg' });
  const resized = await imageCompression(asFile, {
    maxWidthOrHeight: 4000,
    initialQuality: 0.9,
    // The default loads its worker from a CDN, which breaks the CSP (docs/13 §5).
    useWebWorker: false,
    preserveExif: false,
  });

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(resized, { imageOrientation: 'from-image' });
  } catch {
    throw new PhotoError('FILE_TYPE');
  }
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  const blob = await canvasToBlob(canvas, 'image/webp', 0.92);
  const result = { blob, width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return result;
}

export interface Versions {
  widths: number[];
  files: Record<number, Blob>;
  og: Blob | null;
}

/** Step 5 of docs/12 §3: cuts the crop into every width that fits, and `og.jpg` for products. */
export async function generateVersions(
  original: Blob,
  crop: CropRect,
  usage: PhotoUsage,
): Promise<Versions> {
  const aspect = usageAspect[usage];
  const widths = widthsToGenerate(crop.width, wantedWidths[usage]);
  const bitmap = await createImageBitmap(original);
  try {
    const files: Record<number, Blob> = {};
    for (const width of widths) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = variantHeight(width, aspect);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d context');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        bitmap,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      files[width] = await canvasToBlob(canvas, 'image/webp', 0.82);
    }
    let og: Blob | null = null;
    if (usage === 'product') {
      const layout = ogLayout(crop.width);
      const canvas = document.createElement('canvas');
      canvas.width = layout.canvas.width;
      canvas.height = layout.canvas.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d context');
      ctx.fillStyle = '#f6f6f8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        bitmap,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        layout.x,
        layout.y,
        layout.size,
        layout.size,
      );
      og = await canvasToBlob(canvas, 'image/jpeg', 0.86);
    }
    return { widths, files, og };
  } finally {
    bitmap.close();
  }
}

export interface UploadParams {
  usage: PhotoUsage;
  /** Present when re-centering a photo that already exists. */
  photoId?: string;
  crop: CropRect;
  original: { blob?: Blob | undefined; width: number; height: number };
  versions: Versions;
}

export interface UploadResult {
  photoId: string;
  version: string;
  widths: number[];
  urls: Record<string, string>;
}

/** `POST /api/admin/upload` with progress (fetch cannot report upload progress). */
export function uploadPhoto(
  params: UploadParams,
  onProgress: (fraction: number) => void,
): Promise<UploadResult> {
  const form = new FormData();
  form.set('kind', params.usage);
  form.set('aspect', usageAspect[params.usage]);
  form.set('cropX', String(params.crop.x));
  form.set('cropY', String(params.crop.y));
  form.set('cropWidth', String(params.crop.width));
  form.set('cropHeight', String(params.crop.height));
  form.set('originalWidth', String(params.original.width));
  form.set('originalHeight', String(params.original.height));
  form.set('widths', JSON.stringify(params.versions.widths));
  if (params.photoId) form.set('photoId', params.photoId);
  if (params.original.blob) form.set('original', params.original.blob, 'original.webp');
  for (const [w, blob] of Object.entries(params.versions.files))
    form.set(`w${w}`, blob, `${w}.webp`);
  if (params.versions.og) form.set('og', params.versions.og, 'og.jpg');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () =>
      reject(new PhotoError(navigator.onLine ? 'UNAUTHORIZED' : ('OFFLINE' as ErrorCode)));
    xhr.onload = () => {
      let body: { ok?: boolean; data?: UploadResult; code?: ErrorCode } = {};
      try {
        body = JSON.parse(xhr.responseText) as typeof body;
      } catch {
        /* not JSON: handled below */
      }
      if (xhr.status === 200 && body.ok && body.data) return resolve(body.data);
      reject(new PhotoError(body.code ?? 'INTERNAL'));
    };
    xhr.send(form);
  });
}

/** The original of a saved photo, fetched from the admin-only route (same origin). */
export async function fetchOriginal(photoId: string): Promise<Blob> {
  const res = await fetch(`/api/admin/photo/${encodeURIComponent(photoId)}`);
  if (!res.ok) throw new PhotoError(res.status === 401 ? 'UNAUTHORIZED' : 'PHOTO_NOT_FOUND');
  return res.blob();
}

export { aspectRatio };
