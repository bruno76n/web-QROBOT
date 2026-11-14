import { z } from 'zod';
import { learnTopicIds } from '@/config/learn';

/**
 * Schemas of the files in `content/aprende/` and small pure helpers (docs/21 §8, docs/22 §8).
 */

/** Page types of the learning section. */
export const learnKinds = ['home', 'section', 'sheet', 'article', 'problem', 'glossary'] as const;
export type LearnKind = (typeof learnKinds)[number];
/** Who a page is written for. */
export const learnAudiences = ['all', 'shops', 'clients'] as const;
/** Closing call to action of a page: WhatsApp button, link to the system, or none. */
export const learnCtas = ['whatsapp', 'system', 'none'] as const;

/** One kebab-case slug segment. */
const slugPart = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug inválido');
/** Slug of a page: empty (section home) or segments separated by `/`. */
const pageSlug = z.union([
  z.literal(''),
  z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/, 'slug inválido'),
]);

/** Topic id from `@/config/learn`, or empty for none. */
const topicField = z.union([z.literal(''), z.enum(learnTopicIds)]);

/** Question and answer of a page. */
export const faq = z.object({ q: z.string().min(1), a: z.string().min(1) });
/** Filter chip: `id` is the filter key, `label` the visible text. */
const chip = z.object({ id: slugPart, label: z.string().min(1) });
/** Internal link inside the learning section. */
const link = z.object({ label: z.string().min(1), href: z.string().startsWith('/aprende') });
/** Glossary entry; `en` is the English term and `href` an optional page that explains it. */
const term = z.object({
  term: z.string().min(1),
  en: z.string().nullable(),
  definition: z.string().min(1),
  href: z.string().startsWith('/aprende').optional(),
});

/** The frontmatter of a page file (formato en `content/aprende/README.md`). */
export const pageFrontmatter = z.object({
  slug: pageSlug,
  kind: z.enum(learnKinds),
  topic: topicField,
  title: z.string().min(1).max(120),
  subtitle: z.string().max(300),
  summary: z.string().max(500),
  /** Filter chip ids the page answers to. */
  filters: z.array(z.string()),
  tags: z.array(z.string()),
  /** Slugs of related pages. */
  related: z.array(pageSlug),
  /** Ids of entries in the sources file. */
  sources: z.array(z.string()),
  audience: z.enum(learnAudiences),
  /** Unpublished pages are not shown. */
  published: z.boolean(),
  /** Position among sibling pages. */
  order: z.number().int(),
  /** Month of the last review, `YYYY-MM`. */
  reviewed: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'usa AAAA-MM'),
  cta: z.enum(learnCtas),
  ctaText: z.string().optional(),
  chips: z.array(chip).optional(),
  faqs: z.array(faq).optional(),
  featured: z.array(link).optional(),
  suggestions: z.array(z.string()).optional(),
  terms: z.array(term).optional(),
});
export type PageFrontmatter = z.infer<typeof pageFrontmatter>;

/** Range or value shown as typed (for example `190-230`). */
const pctText = z.string();
/** One row of the filament table. A value the sources do not give is `null` (the table shows a dash). */
export const filamentRow = z.object({
  material: z.string(),
  slug: pageSlug,
  uses: z.string(),
  /** Nozzle and bed temperatures, in °C, as text ranges. */
  nozzleC: pctText,
  bedC: pctText,
  /** Heat deflection temperature in °C (see `heatLevel`). */
  hdtC: z.number().nullable(),
  impactKjM2: z.number().nullable(),
  stiffnessMpa: z.number().nullable(),
  /** Water the material absorbs, as a percentage. */
  waterPct: z.number().nullable(),
  drying: z.string(),
  maxSpeedMmS: z.number().nullable(),
  /**
   * Printer it needs: `any` (open or enclosed), `enclosed-better` (prints in an open one, enclosed
   * gives better results) or `enclosed` (not recommended in an open printer).
   */
  printer: z.enum(['any', 'enclosed-better', 'enclosed']),
  hardenedNozzle: z.enum(['yes', 'no']),
  /** `dry`: only with a dry spool (PVA / BVOH). */
  ams: z.enum(['yes', 'no', 'dry']),
  filters: z.array(z.string()),
});

/** `datos/filamentos.json`: filament table plus its filter chips, toggles and heat levels. */
export const filamentsData = z.object({
  key: z.literal('filamentos'),
  chips: z.array(chip),
  toggles: z.array(
    z.object({ id: z.string(), label: z.string(), hideWhen: z.record(z.string(), z.string()) }),
  ),
  heatLevels: z.array(z.object({ id: z.string(), label: z.string(), maxC: z.number().nullable() })),
  rows: z.array(filamentRow),
  notes: z.array(z.string()),
  sources: z.array(z.string()),
});

/** One printer with its build volume in millimetres. */
export const printerRow = z.object({
  brand: z.string(),
  model: z.string(),
  widthMm: z.number().positive(),
  depthMm: z.number().positive(),
  heightMm: z.number().positive(),
  /** Build volume in litres. */
  liters: z.number(),
  enclosed: z.boolean(),
  motion: z.string(),
  size: z.string(),
  note: z.string(),
  sources: z.array(z.string()),
});

/** `datos/impresoras.json`: printer table; `fitMarginMm` is the bed margin the fit check leaves free. */
export const printersData = z.object({
  key: z.literal('impresoras'),
  chips: z.array(chip),
  brands: z.array(z.string()),
  toggles: z.array(
    z.object({ id: z.string(), label: z.string(), hideWhen: z.record(z.string(), z.boolean()) }),
  ),
  fitMarginMm: z.number().nonnegative(),
  rows: z.array(printerRow),
  notes: z.array(z.string()),
});

/** `datos/mantenimiento.json`: maintenance tasks grouped by when they are done. */
export const maintenanceData = z.object({
  key: z.literal('mantenimiento'),
  chips: z.array(chip),
  rows: z.array(z.object({ when: z.string(), filter: z.string(), tasks: z.array(z.string()) })),
  sources: z.array(z.string()),
});

/** `datos/datos-curiosos.json`: fun facts, each with its topic and sources. */
export const funFactsData = z.object({
  key: z.literal('datos-curiosos'),
  rows: z.array(z.object({ text: z.string(), topic: z.string(), sources: z.array(z.string()) })),
});

/** List of cited sources; `id` is what pages and rows reference. */
export const sourcesFile = z.array(
  z.object({ id: slugPart, name: z.string().min(1), url: z.url().nullable().optional() }),
);

/** Search tuning: synonym lists by word or phrase and words ignored in queries. */
export const searchConfig = z.object({
  synonyms: z.record(z.string(), z.array(z.string())),
  stopWords: z.array(z.string()),
});
export type SearchConfig = z.infer<typeof searchConfig>;

/** Schema of each dataset file, by its `key`. */
export const datasetSchemas = {
  filamentos: filamentsData,
  impresoras: printersData,
  mantenimiento: maintenanceData,
  'datos-curiosos': funFactsData,
} as const;
export type DatasetKey = keyof typeof datasetSchemas;
export type FilamentsData = z.infer<typeof filamentsData>;
export type PrintersData = z.infer<typeof printersData>;
export type MaintenanceData = z.infer<typeof maintenanceData>;
export type FunFactsData = z.infer<typeof funFactsData>;

/**
 * Input of the search endpoint (docs/22 §7.2): `q` of 1 to 80 characters once trimmed and
 * `tema` empty or a topic id.
 */
export const learnSearchInput = z.object({
  q: z.string().trim().min(1).max(80),
  tema: z.union([z.literal(''), z.enum(learnTopicIds)]),
});

/** `<title>` of an Aprende page: «PLA · Aprende · Quick Robot» (docs/21 §12). */
export function learnTitle(title: string): string {
  return `${title} · Aprende · Quick Robot`;
}

/**
 * «Revisado en noviembre de 2026» from `2026-11`; empty when the value is not `YYYY-MM`.
 * `months` and `template` come from es.ts.
 */
export function reviewedLabel(
  reviewed: string,
  months: readonly string[],
  template: (month: string, year: number) => string,
): string {
  const m = /^(\d{4})-(\d{2})$/.exec(reviewed);
  const month = m ? months[Number(m[2]) - 1] : undefined;
  return m && month ? template(month, Number(m[1])) : '';
}

/** `''` → `/aprende`; `filamentos/pla` → `/aprende/filamentos/pla`. */
export function learnUrl(slug: string): string {
  return slug === '' ? '/aprende' : `/aprende/${slug}`;
}

/** Lowercase, no accents, single spaces, at most 80 characters (docs/22 §7.6). */
export function normalizeQuery(query: string): string {
  return query
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .trim();
}

/**
 * The words to look for: the query without stop words, plus the synonyms of the whole phrase and of
 * each word (docs/22 §8). Everything is normalized; no duplicates.
 */
export function expandSynonyms(
  query: string,
  config: Pick<SearchConfig, 'synonyms' | 'stopWords'>,
): string[] {
  const norm = normalizeQuery(query);
  const stop = new Set(config.stopWords.map(normalizeQuery));
  const synonyms = new Map<string, string[]>();
  for (const [k, v] of Object.entries(config.synonyms)) synonyms.set(normalizeQuery(k), v);

  const words = norm.split(' ').filter((w) => w !== '' && !stop.has(w));
  const found = new Set<string>(words);
  const add = (list: string[] | undefined) => {
    for (const s of list ?? []) {
      const n = normalizeQuery(s);
      if (n) found.add(n);
    }
  };
  add(synonyms.get(norm));
  for (const w of words) add(synonyms.get(w));
  // Phrases of two and three words ("se despega" has "se" as a stop word but still counts).
  const all = norm.split(' ');
  for (let size = 2; size <= 3; size++)
    for (let i = 0; i + size <= all.length; i++)
      add(synonyms.get(all.slice(i, i + size).join(' ')));
  return [...found];
}
