/**
 * Sample data of the system screens drawn in HTML (docs/25 §4, §6.3): the workshop «Eje Z» on
 * 13 November 2026, one source for every screen so the numbers agree between them (a test checks
 * it, `tests/system-demo.test.ts`). Names of channels, customers and products are sample data, not
 * texts of the site. Money in pesos.
 */

/** The sample workshop and the day the screens show. */
export const demoBusiness = {
  name: 'Eje Z',
  kind: 'Impresión 3D',
  initials: 'EZ',
  today: '2026-11-13',
} as const;

/** Sales of the last 30 days and what is left of them (docs/25 §4). */
export const demoSales = {
  days: 30,
  count: 13,
  total: 6270,
  /** Change against the previous period, in %. */
  change: 14.6,
  gross: 5077,
  grossChange: 17.6,
  expenses: 2707,
  net: 2370,
  receivable: 8110,
} as const;

/** Sales and gross profit by week (5 weeks), oldest first. */
export const demoWeeks: readonly { label: string; sales: number; gross: number }[] = [
  { label: '13 oct', sales: 50, gross: 40 },
  { label: '20 oct', sales: 1550, gross: 1255 },
  { label: '27 oct', sales: 1690, gross: 1370 },
  { label: '3 nov', sales: 1630, gross: 1320 },
  { label: '10 nov', sales: 1350, gross: 1092 },
];
/** Top of the weekly chart. */
export const demoWeeksCap = 2000;

/** «De cada $100 vendidos», largest first; the net profit last. Keys of `es.system.ui.per100`. */
export const demoPer100: readonly {
  id: 'expenses' | 'material' | 'machine' | 'extras' | 'fees' | 'failures' | 'power' | 'net';
  amount: number;
}[] = [
  { id: 'expenses', amount: 43 },
  { id: 'material', amount: 8.7 },
  { id: 'machine', amount: 5.4 },
  { id: 'extras', amount: 2 },
  { id: 'fees', amount: 1.4 },
  { id: 'failures', amount: 0.9 },
  { id: 'power', amount: 0.7 },
  { id: 'net', amount: 37.9 },
];

/** Sales by channel in the 30 days: count, amount, fee and gross profit. */
export const demoChannels: readonly {
  name: string;
  count: number;
  total: number;
  fee: number;
  gross: number;
  /** Fee of the channel on each sale, in %. */
  feePct: number;
}[] = [
  { name: 'WhatsApp', count: 8, total: 4620, fee: 0, gross: 3804, feePct: 0 },
  { name: 'Facebook Marketplace', count: 3, total: 1150, fee: 0, gross: 947, feePct: 0 },
  { name: 'Mercado Libre', count: 2, total: 500, fee: 85, gross: 326, feePct: 17 },
];

/**
 * The napkin holder with logo (docs/25 §4): the inputs of the cost formula of Aprende
 * (docs/21 §6.4, `computeCost`) and what the screen shows.
 */
export const demoPiece = {
  name: 'Servilletero con logo',
  filament: 'PLA Negro',
  printer: 'Bambu Lab P1S',
  grams: 45,
  /** Cost per gram of the filament (average of its rolls). */
  perGram: 0.36,
  purgePct: 5,
  hours: 2.5,
  kw: 0.12,
  kwhPrice: 3,
  /** Machine cost per hour: wear plus maintenance. */
  machinePerHour: 3,
  extras: 0,
  failPct: 5,
  material: 17.01,
  machine: 7.5,
  power: 0.9,
  cost: 26.75,
  price: 120,
  profit: 93.25,
  marginPct: 77.7,
  times: 4.5,
  /** Lowest price for the minimum margin of the settings. */
  minPrice: 39,
  minMarginPct: 30,
} as const;

/** Order #3 of the order screen. */
export const demoOrder3 = {
  number: 3,
  customer: 'Taquería Los Compadres',
  total: 2350,
  paid: 1000,
  balance: 1350,
  due: '15 nov',
} as const;

/** Finished pieces in stock. */
export const demoStock = { pieces: 25, reserved: 10, available: 15 } as const;

/** Suggested purchases by supplier: 4 items. */
export const demoPurchases: readonly {
  supplier: string;
  contact: string;
  items: { name: string; amount: number }[];
}[] = [
  {
    supplier: 'Sunlu Oficial',
    contact: 'Mercado Libre',
    items: [
      { name: 'PLA Silk Morado', amount: 470 },
      { name: 'TPU 95A Azul', amount: 430 },
    ],
  },
  { supplier: 'eSUN México', contact: '33 5555 0101', items: [{ name: 'PLA Negro', amount: 360 }] },
  {
    supplier: 'Empaques Guadalajara',
    contact: '33 5555 0123',
    items: [{ name: 'Caja de regalo', amount: 32 }],
  },
];
export const demoPurchasesTotal = 1292;

// ── inicio: start (agent «inicio»: UiSidebar, UiHome, UiFloats) ──

// ── inicio: end ──

// ── costo-pedidos: start (agent «costo-pedidos»: UiPiece, UiOrder) ──

// ── costo-pedidos: end ──

// ── taller: start (agent «taller»: UiPrinters, UiFilaments, UiPurchases, UiStock) ──
/** States of the screens of the workshop, as keys of `es.system.ui.common.states`. */
type DemoState =
  'available' | 'lowStock' | 'critical' | 'printing' | 'upToDate' | 'reserved' | 'normal';

/** A print job: how many of which piece, for which order. */
interface DemoJob {
  qty: number;
  piece: string;
  order: number;
}

/**
 * The printers of «Eje Z» (screen «Impresoras»): the current job with its progress and time left,
 * the next one in the queue, hours of use, maintenance (the part due and in how many hours, or
 * `null` when it is up to date) and how much of its price the net profit has paid back. The P1S
 * prints the signs of order #3 (`demoOrder3`).
 */
export const demoPrinters: readonly {
  name: string;
  current: (DemoJob & { progress: number; left: { h: number; min: number } }) | null;
  next: DemoJob | null;
  hours: number;
  maintenance: { part: 'nozzle'; inHours: number } | null;
  recoveredPct: number;
}[] = [
  {
    name: 'Bambu Lab P1S',
    current: {
      qty: 3,
      piece: 'Letrero de taquería',
      order: 3,
      progress: 62,
      left: { h: 6, min: 50 },
    },
    next: { qty: 50, piece: 'Llavero con nombre', order: 4 },
    hours: 286,
    maintenance: { part: 'nozzle', inHours: 14 },
    recoveredPct: 48,
  },
  {
    name: 'Ender 3 V3 SE',
    current: {
      qty: 10,
      piece: 'Servilletero con logo',
      order: 3,
      progress: 30,
      left: { h: 17, min: 30 },
    },
    next: null,
    hours: 104,
    maintenance: null,
    recoveredPct: 31,
  },
  {
    name: 'Bambu Lab A1 mini',
    current: null,
    next: null,
    hours: 52,
    maintenance: null,
    recoveredPct: 9,
  },
];
/** Hours between nozzle changes (the default of the system). */
export const demoNozzleEvery = 300;

/** Prints of the last 30 days: total, good, failed and filament used in grams. */
export const demoProduction = { prints: 11, good: 9, failed: 2, grams: 570 } as const;

/**
 * Filaments in stock (screen «Filamentos»): rolls, brand, cost per gram, grams available, the
 * grams of a full roll (the bar is available against the rolls when full), the state (Stock bajo at
 * 300 g or less, Crítico at 150 g or less) and the color of the swatch.
 */
export const demoFilaments: readonly {
  name: string;
  rolls: number;
  brand: string;
  perGram: number;
  grams: number;
  rollGrams: number;
  state: Extract<DemoState, 'normal' | 'lowStock' | 'critical'>;
  color: string;
}[] = [
  {
    name: 'PETG Negro',
    rolls: 2,
    brand: 'Sunlu',
    perGram: 0.42,
    grams: 1640,
    rollGrams: 1000,
    state: 'normal',
    color: '#1d1d20',
  },
  {
    name: 'PETG Blanco',
    rolls: 1,
    brand: 'Sunlu',
    perGram: 0.42,
    grams: 920,
    rollGrams: 1000,
    state: 'normal',
    color: '#f4f4f6',
  },
  {
    name: 'PLA Blanco',
    rolls: 2,
    brand: 'Bambu Lab',
    perGram: 0.38,
    grams: 1720,
    rollGrams: 1000,
    state: 'normal',
    color: '#f4f4f6',
  },
  {
    name: 'PLA Rojo',
    rolls: 1,
    brand: 'eSUN',
    perGram: 0.37,
    grams: 600,
    rollGrams: 1000,
    state: 'normal',
    color: '#c8302a',
  },
  {
    name: 'PLA Negro',
    rolls: 1,
    brand: 'eSUN',
    perGram: 0.36,
    grams: 410,
    rollGrams: 1000,
    state: 'normal',
    color: '#1d1d20',
  },
  {
    name: 'TPU 95A Azul',
    rolls: 1,
    brand: 'Sunlu',
    perGram: 0.86,
    grams: 300,
    rollGrams: 500,
    state: 'lowStock',
    color: '#2f6fd6',
  },
  {
    name: 'PLA Silk Morado',
    rolls: 1,
    brand: 'Sunlu',
    perGram: 0.47,
    grams: 85,
    rollGrams: 1000,
    state: 'critical',
    color: '#7a4fc9',
  },
];
/** Header of «Filamentos»: how many filaments and rolls, and kilos available (one decimal). */
export const demoFilamentTotals = { filaments: 7, rolls: 9, kg: 5.7 } as const;
/** Grams at which a filament is in Stock bajo and in Crítico. */
export const demoFilamentLimits = { low: 300, critical: 150 } as const;

/**
 * What the screen «Compras sugeridas» says of each item of `demoPurchases`, by name: how many to
 * buy (`rolls` or `pieces`), and why: a filament shows its grams available (from `demoFilaments`);
 * a supply its stock and minimum; `urgent` marks the filament an order needs more of than there is.
 */
export const demoPurchaseNotes: Readonly<
  Record<
    string,
    | { kind: 'filament'; rolls: number; urgent?: { order: number; needs: number } }
    | { kind: 'supply'; pieces: number; stock: number; min: number }
  >
> = {
  'PLA Silk Morado': { kind: 'filament', rolls: 1 },
  'TPU 95A Azul': { kind: 'filament', rolls: 1 },
  'PLA Negro': { kind: 'filament', rolls: 1, urgent: { order: 5, needs: 535 } },
  'Caja de regalo': { kind: 'supply', pieces: 7, stock: 3, min: 5 },
};

/**
 * Finished pieces in stock (screen «Existencias»): in stock and reserved for orders (available is
 * the difference) and the state; a piece with color variants carries them, and its numbers are
 * their sum. The rows add up to `demoStock`.
 */
export interface DemoStockRow {
  name: string;
  stock: number;
  reserved: number;
  state: Extract<DemoState, 'available' | 'lowStock' | 'reserved'>;
}
export const demoStockRows: readonly (DemoStockRow & { variants?: readonly DemoStockRow[] })[] = [
  { name: 'Llavero con nombre', stock: 11, reserved: 3, state: 'available' },
  {
    name: 'Dragón articulado',
    stock: 7,
    reserved: 3,
    state: 'available',
    variants: [
      { name: 'Blanco', stock: 3, reserved: 2, state: 'lowStock' },
      { name: 'Negro mate', stock: 3, reserved: 1, state: 'lowStock' },
      { name: 'Silk morado', stock: 1, reserved: 0, state: 'lowStock' },
    ],
  },
  { name: 'Maceta geométrica', stock: 3, reserved: 1, state: 'lowStock' },
  { name: 'Busto de escritorio', stock: 3, reserved: 2, state: 'lowStock' },
  { name: 'Figura de escritorio', stock: 1, reserved: 1, state: 'reserved' },
];
/** A set of pieces: how many it has, the piece that is missing and how many can be put together. */
export const demoSet = {
  name: 'Colección minimal blanca',
  pieces: 4,
  missing: 'Figura de escritorio',
  buildable: 0,
} as const;

// ── taller: end ──

// ── docs-reportes: start (agent «docs-reportes»: UiQuote, UiReports) ──

// ── docs-reportes: end ──
