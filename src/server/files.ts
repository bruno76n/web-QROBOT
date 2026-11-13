/** Detects the real type of an uploaded image from its first bytes (docs/13 §5). */

/** Image types accepted for photos. */
export type SniffedType = 'image/jpeg' | 'image/png' | 'image/webp';

/** Real type from the file signature, ignoring name and declared type. SVG and anything else → `null`. */
export function sniffImageType(bytes: Uint8Array): SniffedType | null {
  // True when `sig` appears at `offset`.
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  // RIFF....WEBP
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8))
    return 'image/webp';
  return null;
}

/** File extension used for each accepted type. */
export const extensionFor: Record<SniffedType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export { MB, maxOriginalBytes, maxVersionBytes } from '@/lib/photo-limits';
