/** Which files the panel accepts (docs/12 §3 step 1). Pure, so it is tested without a browser. */
export const isHeic = (file: { type: string; name: string }) =>
  /^image\/(heic|heif)$/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

export const isSupportedPhoto = (file: { type: string; name: string }) =>
  /^image\/(jpeg|png|webp)$/i.test(file.type) ||
  /\.(jpe?g|png|webp)$/i.test(file.name) ||
  isHeic(file);
