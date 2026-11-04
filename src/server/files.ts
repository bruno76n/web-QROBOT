/** Real type of a file from its first bytes (docs/13 §5). SVG and everything else → null. */
export type SniffedType = 'image/jpeg' | 'image/png' | 'image/webp';

export function sniffImageType(bytes: Uint8Array): SniffedType | null {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  // RIFF....WEBP
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8))
    return 'image/webp';
  return null;
}

export const extensionFor: Record<SniffedType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const MB = 1024 * 1024;
export const maxOriginalBytes = 25 * MB;
export const maxVersionBytes = 2 * MB;
