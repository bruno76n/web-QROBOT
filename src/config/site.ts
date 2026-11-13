/**
 * Business data (docs/10 §6). The ONLY place for phone numbers, social links, domain and dates.
 * Values marked "provisional" come from docs/01 › Pendientes del dueño.
 */
export const site = {
  name: 'Quick Robot',
  /** Provisional: the real domain is still pending. */
  domain: 'https://quickrobot.centerdiv.mx',
  /** Public photo host (R2 custom domain); must match `PUBLIC_IMG_BASE` in wrangler.jsonc and the CSP. */
  imgBase: 'https://fotos-quickrobot.centerdiv.mx',
  /** Country code + number, no "+" or spaces. */
  whatsapp: '523481308678',
  /** Shown in the footer. */
  whatsappLabel: '+52 348 130 8678',
  /** `url: null` renders plain text; the label is what the footer shows. */
  facebook: {
    label: 'Quick Robot',
    url: 'https://www.facebook.com/profile.php?id=61596536243175' as string | null,
  },
  instagram: {
    label: '@quick_robot3d',
    url: 'https://www.instagram.com/quick_robot3d/' as string | null,
  },
  /** Responsible party of the privacy notice (docs/19 §2). Address and e-mail are provisional. */
  owner: { name: 'Bruno Ortiz', address: '[domicilio]', email: '[correo]' },
  /** Date shown on the privacy notice (`YYYY-MM-DD`); change it every time the text changes. */
  privacyUpdated: '2026-11-04',
  /** Dates without year (MM-DD); the year comes from today in Guadalajara. */
  christmas: { orderDeadline: '12-12', eve: '12-24', seasonStart: '10-01' },
  timeZone: 'America/Mexico_City',
  /** `src` is `null` when there is no video. `speed` is the playback rate (0.5 = half speed). */
  video: { src: '/media/timelapse.mp4' as string | null, speed: 0.5 },
  /** Quick Cerebro (the system) is not out yet: its calls in Aprende stay hidden (docs/21 §4.6). */
  system: { enabled: false },
} as const;

/** Type of the business data. */
export type Site = typeof site;
