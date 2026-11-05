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
  /** Country code + number, no "+" or spaces. Provisional. */
  whatsapp: '52XXXXXXXXXX',
  /** Shown in the footer. Provisional until the real number exists. */
  whatsappLabel: '+52 [tu número]',
  /** `url: null` renders plain text until the real page exists. Provisional. */
  facebook: { label: '[tu página]', url: null as string | null },
  instagram: { label: '[@tu.usuario]', url: null as string | null },
  /** Responsible party of the privacy notice (docs/19 §2). Address and e-mail are provisional. */
  owner: { name: 'Bruno Ortiz', address: '[domicilio]', email: '[correo]' },
  /** Date shown on the privacy notice (`YYYY-MM-DD`); change it every time the text changes. */
  privacyUpdated: '2026-11-04',
  /** Dates without year (MM-DD); the year comes from today in Guadalajara. */
  christmas: { orderDeadline: '12-12', eve: '12-24', seasonStart: '10-01' },
  timeZone: 'America/Mexico_City',
  /** `src: '/media/timelapse.mp4'` once the video exists. */
  video: { src: null as string | null, durationLabel: '0:30', printTime: '[3 h 40 min]' },
} as const;

export type Site = typeof site;
