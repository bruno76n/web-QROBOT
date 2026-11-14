/**
 * Structure of the page for workshops (docs/25 §4): whether it can be seen, the modules of the
 * system in the order of its menu, and the parts of each page (cost formula, alerts, roles, plan
 * comparison, download platforms). Not business data (that is `site.system`), not texts (that is
 * `es.system`) and not the sample data of the system screens (that is `system-demo.ts`).
 */
import { site } from '@/config/site';
import { isSystemVisible } from '@/lib/system/visibility';

/** The page answers and is linked only with the switch on, or in `pnpm dev` (docs/25 §2). */
export const systemVisible = isSystemVisible({
  enabled: site.system.enabled,
  dev: import.meta.env.DEV,
});

/** Icons of the system menu and of the page sections (`ModuleIcon.astro` draws them with lucide). */
export type IconKey =
  | 'home'
  | 'products'
  | 'sales'
  | 'orders'
  | 'filaments'
  | 'supplies'
  | 'printers'
  | 'production'
  | 'stock'
  | 'purchases'
  | 'customers'
  | 'expenses'
  | 'reports'
  | 'settings'
  | 'cost'
  | 'documents'
  | 'alerts'
  | 'team'
  | 'data';

/** Groups of the system menu, in order. */
export type ModuleGroup = 'sell' | 'shop' | 'business';
export const moduleGroups: readonly ModuleGroup[] = ['sell', 'shop', 'business'];

/** The 13 modules of the system, in the order of its menu (texts in `es.system.modules`). */
export type ModuleId = Exclude<IconKey, 'home' | 'cost' | 'documents' | 'alerts' | 'team' | 'data'>;
export const modules: readonly { id: ModuleId; group: ModuleGroup }[] = [
  { id: 'products', group: 'sell' },
  { id: 'sales', group: 'sell' },
  { id: 'orders', group: 'sell' },
  { id: 'filaments', group: 'shop' },
  { id: 'supplies', group: 'shop' },
  { id: 'printers', group: 'shop' },
  { id: 'production', group: 'shop' },
  { id: 'stock', group: 'shop' },
  { id: 'purchases', group: 'shop' },
  { id: 'customers', group: 'business' },
  { id: 'expenses', group: 'business' },
  { id: 'reports', group: 'business' },
  { id: 'settings', group: 'business' },
];

// ── principal: start (agent «principal»: cost formula, alerts, roles; docs/25 §4, §7.1) ──

// ── principal: end ──

// ── precios: start (agent «precios»: rows of the plan comparison; docs/25 §4, §7.2) ──

/** A limit of the plans that the comparison shows as a number or as its «no limit» word. */
export type CompareLimit = 'users' | 'printers' | 'orders';

/** Id of a plan, from the plans of `site.system`. */
type ComparePlanId = (typeof site.system.plans)[number]['id'];

/**
 * One row of the plan comparison (texts in `es.system.pricing.compare.rows`):
 * - `limit`: the plan's limit (the row id) from `site.system.plans`, with «Ilimitadas» (`f`) or
 *   «Ilimitados» (`m`) when it has none;
 * - `check`: included in every plan (`all`) or only in the plans with roles (`roles`);
 * - `support`: WhatsApp support by plan (none, yes or priority).
 */
export type CompareRow =
  | { id: CompareLimit; kind: 'limit'; unlimited: 'f' | 'm' }
  | {
      id:
        | 'cost'
        | 'deposits'
        | 'production'
        | 'materials'
        | 'stock'
        | 'documents'
        | 'reports'
        | 'roles'
        | 'salesView'
        | 'platforms'
        | 'backups'
        | 'excel';
      kind: 'check';
      in: 'all' | 'roles';
    }
  | { id: 'support'; kind: 'support'; plans: Record<ComparePlanId, 'yes' | 'priority' | null> };

/** Groups of rows of the plan comparison, in order (texts in `es.system.pricing.compare.groups`). */
export const compareGroups: readonly {
  id: 'limits' | 'modules' | 'team' | 'platforms' | 'support';
  rows: readonly CompareRow[];
}[] = [
  {
    id: 'limits',
    rows: [
      { id: 'users', kind: 'limit', unlimited: 'm' },
      { id: 'printers', kind: 'limit', unlimited: 'f' },
      { id: 'orders', kind: 'limit', unlimited: 'm' },
    ],
  },
  {
    id: 'modules',
    rows: [
      { id: 'cost', kind: 'check', in: 'all' },
      { id: 'deposits', kind: 'check', in: 'all' },
      { id: 'production', kind: 'check', in: 'all' },
      { id: 'materials', kind: 'check', in: 'all' },
      { id: 'stock', kind: 'check', in: 'all' },
      { id: 'documents', kind: 'check', in: 'all' },
      { id: 'reports', kind: 'check', in: 'all' },
    ],
  },
  {
    id: 'team',
    rows: [
      { id: 'roles', kind: 'check', in: 'roles' },
      { id: 'salesView', kind: 'check', in: 'roles' },
    ],
  },
  {
    id: 'platforms',
    rows: [
      { id: 'platforms', kind: 'check', in: 'all' },
      { id: 'backups', kind: 'check', in: 'all' },
      { id: 'excel', kind: 'check', in: 'all' },
    ],
  },
  {
    id: 'support',
    rows: [
      { id: 'support', kind: 'support', plans: { free: null, shop: 'yes', business: 'priority' } },
    ],
  },
];

// ── precios: end ──

// ── descargar: start (agent «descargar»: download platforms; docs/25 §4, §7.3) ──

/**
 * Rows of the download page (`PlatformList`), in order. `id` is the platform `detectPlatform` gives
 * (`other` is the browser row) and the anchor of the row; `download` is the installer of
 * `site.system.downloads` it offers, or `null` when it opens the system in the browser. Texts in
 * `es.system.download.platforms`.
 */
export type DownloadKey = keyof typeof site.system.downloads;
export const platforms: readonly {
  id: 'mac' | 'windows' | 'other' | 'mobile';
  download: DownloadKey | null;
}[] = [
  { id: 'mac', download: 'mac' },
  { id: 'windows', download: 'windows' },
  { id: 'other', download: null },
  { id: 'mobile', download: null },
];

// ── descargar: end ──
