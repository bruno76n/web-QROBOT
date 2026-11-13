/** Upload limits shared by the browser and the server (docs/15 §6). */

/** Bytes in a megabyte. */
export const MB = 1024 * 1024;
/** Largest original file accepted. */
export const maxOriginalBytes = 25 * MB;
/** Largest generated version (one width) accepted. */
export const maxVersionBytes = 2 * MB;
