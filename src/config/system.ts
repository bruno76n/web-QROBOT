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

/** Terms of the cost of a piece, in the order of the formula (`CostFormula`); the total follows. */
export type CostTerm = 'material' | 'power' | 'machine' | 'extras';
export const costTerms: readonly CostTerm[] = ['material', 'power', 'machine', 'extras'];

/** The 7 alerts of the system's home screen, in its order (`AlertsTable`). */
export type AlertId =
  | 'filamentShort'
  | 'criticalStock'
  | 'dueSoon'
  | 'balanceDue'
  | 'priceBelowMin'
  | 'maintenance'
  | 'lowSupply';
export const alerts: readonly AlertId[] = [
  'filamentShort',
  'criticalStock',
  'dueSoon',
  'balanceDue',
  'priceBelowMin',
  'maintenance',
  'lowSupply',
];

/** Roles of the Negocio plan, in the order of the table (`RolesTable`). */
export type Role = 'owner' | 'admin' | 'sales' | 'shop';
export const roles: readonly Role[] = ['owner', 'admin', 'sales', 'shop'];

/** Areas of the system and the roles that see each one (`RolesTable`). */
export type RoleArea = 'selling' | 'workshop' | 'money' | 'expenses' | 'account';
export const roleMatrix: readonly { area: RoleArea; roles: readonly Role[] }[] = [
  { area: 'selling', roles: ['owner', 'admin', 'sales'] },
  { area: 'workshop', roles: ['owner', 'admin', 'shop'] },
  { area: 'money', roles: ['owner', 'admin'] },
  { area: 'expenses', roles: ['owner', 'admin'] },
  { area: 'account', roles: ['owner'] },
];

// ── principal: end ──

// ── precios: start (agent «precios»: rows of the plan comparison; docs/25 §4, §7.2) ──

// ── precios: end ──

// ── descargar: start (agent «descargar»: download platforms; docs/25 §4, §7.3) ──

// ── descargar: end ──
