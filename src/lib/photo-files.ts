/** Which files the panel accepts (docs/12 §3). Pure, so it is tested without a browser. */

/** True for HEIC/HEIF files, by MIME type or extension (the browser converts them). */
export const isHeic = (file: { type: string; name: string }) =>
  /^image\/(heic|heif)$/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

/** True for JPEG, PNG, WebP or HEIC/HEIF files, by MIME type or extension. */
export const isSupportedPhoto = (file: { type: string; name: string }) =>
  /^image\/(jpeg|png|webp)$/i.test(file.type) ||
  /\.(jpe?g|png|webp)$/i.test(file.name) ||
  isHeic(file);
