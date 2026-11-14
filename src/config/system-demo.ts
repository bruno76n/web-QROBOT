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

/** States of an order, in order (keys of `es.system.ui.order.steps`). */
type DemoOrderStep = 'quoted' | 'accepted' | 'production' | 'ready' | 'delivered';

/**
 * Order #3 in detail (`UiOrder`): its states with their dates, the items with where they come
 * from (finished stock or to print) and the printer that makes them, the estimated end and the
 * payments. The items add up to `demoOrder3.total` and the payments to `demoOrder3.paid`
 * (`tests/system-demo-costo-pedidos.test.ts`). Dates as the screen shows them.
 */
export const demoOrder3Detail: {
  steps: readonly { id: DemoOrderStep; date: string | null }[];
  /** The state the order is in. */
  current: DemoOrderStep;
  items: readonly {
    qty: number;
    name: string;
    amount: number;
    fromStock: number;
    toPrint: number;
    printer: string;
    /** Progress of the printer, in %. */
    progress: number;
    /** Time left of the printer, in minutes. */
    minutesLeft: number;
  }[];
  /** Estimated end of the production. */
  end: string;
  payments: readonly { kind: 'deposit' | 'partial'; date: string; amount: number }[];
} = {
  steps: [
    { id: 'quoted', date: '2 nov' },
    { id: 'accepted', date: '3 nov' },
    { id: 'production', date: '12 nov' },
    { id: 'ready', date: null },
    { id: 'delivered', date: null },
  ],
  current: 'production',
  items: [
    {
      qty: 3,
      name: 'Letrero de taquería',
      amount: 1350,
      fromStock: 0,
      toPrint: 3,
      printer: 'Bambu Lab P1S',
      progress: 62,
      minutesLeft: 410,
    },
    {
      qty: 10,
      name: demoPiece.name,
      amount: 1000,
      fromStock: 4,
      toPrint: 6,
      printer: 'Ender 3 V3 SE',
      progress: 30,
      minutesLeft: 1050,
    },
  ],
  end: 'sábado 14 nov, 1:20 p. m.',
  payments: [{ kind: 'deposit', date: '3 nov', amount: 1000 }],
};

// ── costo-pedidos: end ──

// ── taller: start (agent «taller»: UiPrinters, UiFilaments, UiPurchases, UiStock) ──

// ── taller: end ──

// ── docs-reportes: start (agent «docs-reportes»: UiQuote, UiReports) ──

// ── docs-reportes: end ──
