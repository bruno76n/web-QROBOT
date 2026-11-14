/**
 * Structure of the page for workshops (docs/25 §4): whether it can be seen, the rows of the plan
 * comparison, the screenshots of the tour, the «De cada $100» example, who sees what by role and the
 * download platforms. Not business data (that is `site.system`) nor texts (that is `es.system`).
 */
import { site } from '@/config/site';
import type { es } from '@/i18n/es';
import { isSystemVisible } from '@/lib/system/visibility';
import type { PlanId } from '@/lib/system/plans';
import type { Platform } from '@/lib/system/platform';

/** The page answers and is linked only with the switch on, or in `pnpm dev` (docs/25 §2). */
export const systemVisible = isSystemVisible({
  enabled: site.system.enabled,
  dev: import.meta.env.DEV,
});

/** Screenshots of `public/brand/talleres/` (built from `assets/talleres/`) and their widths. */
export const systemShots = [
  'inicio',
  'pieza',
  'pedidos',
  'produccion',
  'existencias',
  'reportes',
] as const;
export type SystemShot = (typeof systemShots)[number];
export const systemShotWidths = [720, 1440, 2160] as const;
/** Size of the screenshots in `assets/talleres/` (16:10). */
export const systemShotSize = { width: 2880, height: 1800 } as const;

/** Topics of the tour, in order, with the screenshot each one shows (the first opens). */
export const tour: { id: keyof typeof es.system.home.tour.items; shot: SystemShot }[] = [
  { id: 'costos', shot: 'pieza' },
  { id: 'pedidos', shot: 'pedidos' },
  { id: 'produccion', shot: 'produccion' },
  { id: 'existencias', shot: 'existencias' },
  { id: 'reportes', shot: 'reportes' },
];

/** «De cada $100 vendidos»: a sample workshop, in pesos; the 8 parts add up to 100.00. */
export const moneyExample: { id: keyof typeof es.system.home.money.parts; amount: number }[] = [
  { id: 'mat', amount: 8.7 },
  { id: 'maq', amount: 5.4 },
  { id: 'fail', amount: 0.9 },
  { id: 'luz', amount: 0.7 },
  { id: 'ext', amount: 2 },
  { id: 'com', amount: 1.4 },
  { id: 'gas', amount: 43 },
  { id: 'gan', amount: 37.9 },
];
/** Parts whose amount is also written on the bar (the wide ones). */
export const moneyOnBar: readonly string[] = ['gas', 'gan'];

/** Who sees what (columns: roles; rows: areas of the system). */
export type RoleId = keyof typeof es.system.home.team.roles;
export const roles = {
  columns: ['owner', 'admin', 'sales', 'shop'] as RoleId[],
  rows: [
    { id: 'sales', sees: ['owner', 'admin', 'sales'] },
    { id: 'production', sees: ['owner', 'admin', 'shop'] },
    { id: 'costs', sees: ['owner', 'admin'] },
    { id: 'expenses', sees: ['owner', 'admin'] },
    { id: 'account', sees: ['owner'] },
  ] as { id: keyof typeof es.system.home.team.rows; sees: RoleId[] }[],
};

/** A cell of the comparison: included or not, or a text (`yes`, `priority`). */
export type CompareCell = boolean | keyof typeof es.system.pricing.compare.values;
/** Limits of a plan that the comparison can show (they come from `site.system.plans`). */
export type PlanLimit = 'people' | 'printers' | 'orders' | 'workshops';
type CompareRowId = keyof typeof es.system.pricing.compare.rows;
export type CompareRow =
  { id: CompareRowId; limit: PlanLimit } | { id: CompareRowId; cells: Record<PlanId, CompareCell> };

const all: Record<PlanId, CompareCell> = { free: true, shop: true, business: true };
const paid: Record<PlanId, CompareCell> = { free: false, shop: true, business: true };
const business: Record<PlanId, CompareCell> = { free: false, shop: false, business: true };

/** Groups and rows of «Qué trae cada plan». */
export const compareGroups: {
  id: keyof typeof es.system.pricing.compare.groups;
  rows: CompareRow[];
}[] = [
  {
    id: 'limits',
    rows: [
      { id: 'people', limit: 'people' },
      { id: 'printers', limit: 'printers' },
      { id: 'orders', limit: 'orders' },
      { id: 'workshops', limit: 'workshops' },
    ],
  },
  {
    id: 'shop',
    rows: [
      { id: 'cost', cells: all },
      { id: 'slicer', cells: all },
      { id: 'advances', cells: all },
      { id: 'stock', cells: all },
      { id: 'production', cells: all },
      { id: 'reports', cells: all },
      { id: 'logo', cells: paid },
      { id: 'excel', cells: all },
    ],
  },
  {
    id: 'team',
    rows: [
      { id: 'roles', cells: business },
      { id: 'hidden', cells: business },
      { id: 'log', cells: business },
    ],
  },
  {
    id: 'where',
    rows: [
      { id: 'apps', cells: all },
      { id: 'export', cells: all },
      { id: 'help', cells: { free: false, shop: 'yes', business: 'priority' } },
    ],
  },
];

/** Rows of the download page, in order, with their installer in `site.system.downloads`. */
export const platforms: { id: Platform; download: 'mac' | 'windows' | null }[] = [
  { id: 'mac', download: 'mac' },
  { id: 'windows', download: 'windows' },
  { id: 'other', download: null },
  { id: 'mobile', download: null },
];
