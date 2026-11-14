/** Which download button fits the visitor's device, from the `User-Agent` (docs/25 §7.3). Pure. */

export type Platform = 'mac' | 'windows' | 'mobile' | 'other';

/**
 * iPhone, iPod and Android are `mobile`; Windows is `windows`; Mac is `mac` (an iPad that presents
 * itself as a Mac counts as Mac: every option is listed below the button); anything else, `other`.
 */
export function detectPlatform(userAgent: string | null | undefined): Platform {
  const ua = userAgent ?? '';
  if (/iPhone|iPod|Android/i.test(ua)) return 'mobile';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
  return 'other';
}
