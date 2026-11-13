/** Browser-side flows that turn a chosen file, or a new crop, into uploaded photo versions. */

import { centerCrop, usageAspect, type CropRect, type PhotoUsage } from '@/lib/crop';
import {
  fetchOriginal,
  generateVersions,
  prepareOriginal,
  uploadPhoto,
  type UploadResult,
} from './pipeline';

/** Result of processing a new file: the upload result plus what the editor keeps for later re-crops and previews. */
export interface IngestedPhoto extends UploadResult {
  crop: CropRect;
  original: { width: number; height: number };
  /** The prepared original, kept in memory so "Centrar" needs no download. */
  blob: Blob;
  previewUrl: string;
}

/** The URL of the smallest generated width (the `og` image is ignored): enough for a thumbnail. */
export function smallestUrl(urls: Record<string, string>): string {
  const widths = Object.keys(urls)
    .filter((k) => k !== 'og')
    .map(Number)
    .sort((a, b) => a - b);
  return urls[String(widths[0])] ?? '';
}

/**
 * A new file, end to end: prepare the original, center it automatically, cut the versions and
 * upload them (docs/12 §3). `onStage` reports what is happening for the thumbnail.
 */
export async function ingestFile(
  file: File,
  usage: PhotoUsage,
  onStage: (stage: 'preparing' | 'uploading', fraction?: number) => void,
): Promise<IngestedPhoto> {
  onStage('preparing');
  const original = await prepareOriginal(file);
  const crop = centerCrop(original.width, original.height, usageAspect[usage]);
  const versions = await generateVersions(original.blob, crop, usage);
  onStage('uploading', 0);
  const uploaded = await uploadPhoto(
    {
      usage,
      crop,
      original: { blob: original.blob, width: original.width, height: original.height },
      versions,
    },
    (fraction) => onStage('uploading', fraction),
  );
  return {
    ...uploaded,
    crop,
    original: { width: original.width, height: original.height },
    blob: original.blob,
    previewUrl: smallestUrl(uploaded.urls),
  };
}

/**
 * "Centrar": new versions from the original with the chosen crop (docs/12 §3). Uses the original
 * in memory when there is one, otherwise downloads it from storage.
 */
export async function recropPhoto(
  args: {
    photoId: string;
    usage: PhotoUsage;
    crop: CropRect;
    original: { width: number; height: number };
    blob: Blob | null;
  },
  onProgress: (fraction: number) => void,
): Promise<{ upload: UploadResult; blob: Blob; previewUrl: string }> {
  const blob = args.blob ?? (await fetchOriginal(args.photoId));
  const versions = await generateVersions(blob, args.crop, args.usage);
  const upload = await uploadPhoto(
    {
      usage: args.usage,
      photoId: args.photoId,
      crop: args.crop,
      original: { width: args.original.width, height: args.original.height },
      versions,
    },
    onProgress,
  );
  return { upload, blob, previewUrl: smallestUrl(upload.urls) };
}
