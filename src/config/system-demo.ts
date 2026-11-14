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

/**
 * Quote C-0012 of the quote screen: the business data captured once in Ajustes, the customer, the
 * items (quantity × unit price, in pesos), its validity in days and the footer of the business.
 * The total is not written: it is the sum of the items (`demoQuoteTotal`).
 */
export const demoQuote = {
  city: 'Guadalajara, Jal.',
  phone: '33 1234 5678',
  email: 'hola@ejez.mx',
  folio: 'C-0012',
  date: demoBusiness.today,
  validDays: 15,
  customer: { name: 'Cafetería Alma', phone: '33 3456 7890' },
  items: [
    { qty: 30, name: 'Portavasos con logo', detail: 'PETG Negro, logo en relieve', price: 45 },
    { qty: 6, name: 'Servilletero con logo', detail: 'PETG Negro', price: 110 },
  ],
  footer: 'Precios en pesos mexicanos. Anticipo de 50 % para iniciar; saldo al entregar.',
} as const;

/** Amount of each item of the quote (quantity × unit price), rounded to cents. */
export const demoQuoteAmounts: readonly number[] = demoQuote.items.map(
  (i) => Math.round(i.qty * i.price * 100) / 100,
);
/** Total of the quote: the sum of its items. */
export const demoQuoteTotal = demoQuoteAmounts.reduce((s, a) => s + Math.round(a * 100), 0) / 100;

/** `iso` (YYYY-MM-DD) moved `days` days back, as YYYY-MM-DD (in UTC, so no time zone shifts). */
function isoDaysBefore(iso: string, days: number): string {
  return new Date(Date.parse(iso) - days * 86_400_000).toISOString().slice(0, 10);
}
/**
 * Period of the reports: the last `demoSales.days` days up to today, and the same number of days
 * before it, to compare with.
 */
export const demoReportPeriod = {
  from: isoDaysBefore(demoBusiness.today, demoSales.days - 1),
  to: demoBusiness.today,
  prevFrom: isoDaysBefore(demoBusiness.today, demoSales.days * 2 - 1),
  prevTo: isoDaysBefore(demoBusiness.today, demoSales.days),
} as const;

/** Period options of the reports, in days; `null` is the whole history. */
export const demoReportRanges: readonly (number | null)[] = [7, 30, 90, null];

/** Products with the most gross profit in the 30 days, largest first. */
export const demoTopProducts: readonly { name: string; sold: number; gross: number }[] = [
  { name: 'Dragón articulado', sold: 5, gross: 1013 },
  { name: 'Figura de escritorio', sold: 4, gross: 792 },
  { name: 'Maceta geométrica', sold: 4, gross: 751 },
  { name: 'Llavero con nombre', sold: 19, gross: 700 },
  { name: 'Servilletero con logo', sold: 8, gross: 666 },
];

// ── docs-reportes: end ──
