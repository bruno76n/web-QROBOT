import type { Plan } from '@/lib/system/plans';

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
  privacyUpdated: '2026-11-14',
  /** Dates without year (MM-DD); the year comes from today in Guadalajara. */
  christmas: { orderDeadline: '12-12', eve: '12-24', seasonStart: '10-01' },
  timeZone: 'America/Mexico_City',
  /** `src` is `null` when there is no video. `speed` is the playback rate (0.5 = half speed). */
  video: { src: '/media/timelapse.mp4' as string | null, speed: 0.5 },
  /**
   * The system for workshops (docs/25 §4). While `enabled` is false its pages answer 404 and nothing
   * links to them outside `pnpm dev` (docs/25 §2). Provisional values until the beta
   * (docs/01 › Pendientes del dueño); turning it on is docs/25 §13.
   */
  system: {
    enabled: false as boolean,
    name: 'Quick Cerebro',
    /** Address of the system: «Probar gratis» and «Entrar» lead there. */
    appUrl: 'https://sistema.quickrobot.example',
    signUpPath: '/crear-cuenta',
    signInPath: '/entrar',
    /** Installers; an empty `url` points to its row of the download page. */
    downloads: {
      mac: { url: '', minOs: 'macOS 12 o más nuevo' },
      windows: { url: '', minOs: 'Windows 10 u 11 de 64 bits' },
    },
    /** Free trial of the Negocio plan, without a card. */
    trialDays: 14,
    /** Workshops that keep the founder price. */
    founderSeats: 50,
    /**
     * Plans, cheapest first. Whole pesos with VAT; yearly = 10 months. `null` = no limit. They must
     * match the plans of the system (checked when turning it on).
     */
    plans: [
      { id: 'free', monthly: 0, yearly: 0, people: 1, printers: 2, orders: 15, workshops: 1 },
      {
        id: 'shop',
        monthly: 149,
        yearly: 1490,
        people: 2,
        printers: null,
        orders: null,
        workshops: 1,
        recommended: true,
      },
      {
        id: 'business',
        monthly: 299,
        yearly: 2990,
        people: 8,
        printers: null,
        orders: null,
        workshops: 3,
      },
    ] satisfies Plan[] as Plan[],
  },
} as const;

/** Type of the business data. */
export type Site = typeof site;
