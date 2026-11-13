/** State and actions of the photo list of one product: add files, reorder, alt text, re-center, remove. */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { arrayMove } from '@dnd-kit/sortable';
import { isSmallCrop, type CropRect, type PhotoUsage } from '@/lib/crop';
import type { PhotoView } from '@/lib/admin-types';
import type { PhotoRef } from '@/lib/schemas';
import { es } from '@/i18n/es';
import { errorText } from '../lib/error-text';
import { ingestFile, recropPhoto, smallestUrl } from './ingest';
import { PhotoError } from './pipeline';

const t = es.admin;

/** One thumbnail of the product editor, from "preparing" to "saved". */
export interface PhotoItem {
  /** Local key, stable while the photo is being uploaded. */
  key: string;
  /** Server photo id; null until the upload answers. */
  id: string | null;
  alt: string;
  crop: CropRect | null;
  version: string | null;
  widths: number[];
  previewUrl: string;
  original: { width: number; height: number } | null;
  blob: Blob | null;
  status: 'ready' | 'preparing' | 'uploading' | 'error';
  progress: number;
  error: string | null;
  small: boolean;
  /** Re-runs the upload of a file that failed. */
  retry: (() => void) | null;
}

/** Builds a ready thumbnail from a saved photo. */
export const itemFromView = (v: PhotoView, usage: PhotoUsage): PhotoItem => ({
  key: v.id,
  id: v.id,
  alt: v.alt,
  crop: v.crop,
  version: v.version,
  widths: v.widths,
  previewUrl: smallestUrl(v.urls),
  original: v.original,
  blob: null,
  status: 'ready',
  progress: 1,
  error: null,
  small: isSmallCrop(v.crop.width, usage),
  retry: null,
});

/** The photos that can be saved (ready, with id, crop and version), in order, as references for the save action. */
export const refsOf = (items: PhotoItem[]): PhotoRef[] =>
  items.flatMap((p) =>
    p.status === 'ready' && p.id && p.crop && p.version
      ? [{ id: p.id, crop: p.crop, version: p.version, widths: p.widths, alt: p.alt }]
      : [],
  );

/** The slice of a photo that, when it changes, means "unsaved changes". */
export const fingerprint = (items: PhotoItem[]) =>
  JSON.stringify(items.map((p) => [p.id, p.version, p.alt]));

/** Source of unique local keys for photos that have no server id yet. */
let counter = 0;
const newKey = () => `local-${Date.now()}-${++counter}`;

/** Spanish text for a failed photo step; unknown errors become the generic one. */
const messageFor = (error: unknown) =>
  error instanceof PhotoError ? errorText({ ok: false, code: error.code }) : t.errors.INTERNAL('—');

/**
 * State and actions of a list of photos of one kind (product photos), starting from `initial`.
 * `max` caps how many can be added. `busy` is true while any photo is still being prepared or
 * uploaded, so the form can wait before saving.
 */
export function usePhotos(initial: PhotoItem[], usage: PhotoUsage, max: number) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initial);
  /** Always the latest list, for async callbacks that must not read a stale one. */
  const photosRef = useRef(photos);
  photosRef.current = photos;

  /** Updates one photo by its local key. */
  const patch = useCallback((key: string, changes: Partial<PhotoItem>) => {
    setPhotos((list) => list.map((p) => (p.key === key ? { ...p, ...changes } : p)));
  }, []);

  /** Prepares, centers and uploads a file for the photo with this key; on failure the thumbnail shows the error with a retry. */
  const start = useCallback(
    async (key: string, file: File) => {
      try {
        const done = await ingestFile(file, usage, (stage, fraction = 0) =>
          patch(key, {
            status: stage === 'preparing' ? 'preparing' : 'uploading',
            progress: fraction,
          }),
        );
        patch(key, {
          id: done.photoId,
          version: done.version,
          widths: done.widths,
          crop: done.crop,
          original: done.original,
          blob: done.blob,
          previewUrl: done.previewUrl,
          status: 'ready',
          progress: 1,
          error: null,
          small: isSmallCrop(done.crop.width, usage),
          retry: null,
        });
      } catch (error) {
        patch(key, {
          status: 'error',
          error: messageFor(error),
          retry: () => void start(key, file),
        });
      }
    },
    [patch, usage],
  );

  /** Adds dropped files as new thumbnails up to the limit (extra files are ignored with a message) and starts their upload. */
  const addFiles = useCallback(
    (files: File[]) => {
      const room = max - photosRef.current.length;
      if (room <= 0) return void toast.error(t.photo.tooMany);
      if (files.length > room) toast.error(t.photo.tooMany);
      const accepted = files.slice(0, room);
      const items: PhotoItem[] = accepted.map(() => ({
        key: newKey(),
        id: null,
        alt: '',
        crop: null,
        version: null,
        widths: [],
        previewUrl: '',
        original: null,
        blob: null,
        status: 'preparing',
        progress: 0,
        error: null,
        small: false,
        retry: null,
      }));
      setPhotos((list) => [...list, ...items]);
      items.forEach((item, i) => void start(item.key, accepted[i] as File));
    },
    [max, start],
  );

  const remove = useCallback(
    (key: string) => setPhotos((list) => list.filter((p) => p.key !== key)),
    [],
  );
  const setAlt = useCallback((key: string, alt: string) => patch(key, { alt }), [patch]);
  /** Moves a photo to a new position; the first one is the cover. */
  const move = useCallback(
    (from: number, to: number) => setPhotos((list) => arrayMove(list, from, to)),
    [],
  );

  /** "Centrar" accepted: cut and upload the new versions, then show them. */
  const recenter = useCallback(
    async (key: string, crop: CropRect) => {
      const item = photosRef.current.find((p) => p.key === key);
      if (!item?.id || !item.original) return;
      patch(key, { status: 'uploading', progress: 0, error: null });
      try {
        const done = await recropPhoto(
          { photoId: item.id, usage, crop, original: item.original, blob: item.blob },
          (fraction) => patch(key, { progress: fraction }),
        );
        patch(key, {
          version: done.upload.version,
          widths: done.upload.widths,
          crop,
          blob: done.blob,
          previewUrl: done.previewUrl,
          status: 'ready',
          progress: 1,
          small: isSmallCrop(crop.width, usage),
        });
      } catch (error) {
        // The old version is still valid: go back to it and say what happened.
        patch(key, { status: 'ready', progress: 1 });
        toast.error(messageFor(error));
      }
    },
    [patch, usage],
  );

  const busy = photos.some((p) => p.status === 'preparing' || p.status === 'uploading');
  return { photos, setPhotos, addFiles, remove, setAlt, move, recenter, busy };
}
