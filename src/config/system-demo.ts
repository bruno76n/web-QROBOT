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

/** Change of the net profit against the previous period, in % (floating notice of the hero). */
export const demoNetChange = 17.6;

/** The day of the «Inicio» screen (`demoBusiness.today`), as its header writes it. */
export const demoTodayLabel = 'Viernes 13 de noviembre';

/** Counters of the system menu: open orders and suggested purchases (one per item to buy). */
export const demoMenuCounts: Partial<Record<'orders' | 'purchases', number>> = {
  orders: 6,
  purchases: demoPurchases.reduce((n, s) => n + s.items.length, 0),
};

/**
 * The 5 alerts of «Inicio», most urgent first (texts in `es.system.ui.home.alerts[kind]`); the
 * phone version shows the first 3.
 */
export type DemoAlert =
  | { kind: 'filament'; order: number; customer: string; filament: string; missingGrams: number }
  | { kind: 'due'; order: number; customer: string; due: string }
  | { kind: 'stock'; filament: string; grams: number }
  | { kind: 'balance'; date: string; customer: string; amount: number }
  | { kind: 'maintenance'; printer: string; part: string; hours: number };
export const demoAlerts: readonly DemoAlert[] = [
  {
    kind: 'filament',
    order: 5,
    customer: 'Tacos El Güero',
    filament: demoPiece.filament,
    missingGrams: 125,
  },
  { kind: 'due', order: 2, customer: 'Mariana R.', due: '14 nov' },
  { kind: 'stock', filament: 'PLA Silk Morado', grams: 85 },
  { kind: 'balance', date: '31 oct', customer: 'Mariana R.', amount: 500 },
  { kind: 'maintenance', printer: demoPiece.printer, part: 'boquilla', hours: 14 },
];

/** Printers of the workshop and the jobs printing now (both for order #3). */
export const demoPrinting = {
  printers: 3,
  jobs: [
    {
      printer: demoPiece.printer,
      qty: 3,
      piece: 'Letrero de taquería',
      order: demoOrder3.number,
      progress: 62,
      left: { h: 6, min: 50 },
    },
    {
      printer: 'Ender 3 V3 SE',
      qty: 10,
      piece: demoPiece.name,
      order: demoOrder3.number,
      progress: 30,
      left: { h: 17, min: 30 },
    },
  ],
} as const;

/** Next deliveries by date: the order, its customer and its state. */
export const demoDeliveries: readonly {
  date: string;
  customer: string;
  order: number;
  state: 'ready' | 'inProduction' | 'accepted';
}[] = [
  { date: '14 nov', customer: 'Mariana R.', order: 2, state: 'ready' },
  {
    date: demoOrder3.due,
    customer: demoOrder3.customer,
    order: demoOrder3.number,
    state: 'inProduction',
  },
  { date: '19 nov', customer: 'Tacos El Güero', order: 7, state: 'accepted' },
];

// ── inicio: end ──

// ── costo-pedidos: start (agent «costo-pedidos»: UiPiece, UiOrder) ──

// ── costo-pedidos: end ──

// ── taller: start (agent «taller»: UiPrinters, UiFilaments, UiPurchases, UiStock) ──

// ── taller: end ──

// ── docs-reportes: start (agent «docs-reportes»: UiQuote, UiReports) ──

// ── docs-reportes: end ──
