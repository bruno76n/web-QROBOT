import { z } from 'zod';
import { learnTopicIds } from '@/config/learn';

/**
 * Schemas of the files in `content/aprende/` and small pure helpers (docs/21 §8, docs/22 §8).
 */

export const learnKinds = ['home', 'section', 'sheet', 'article', 'problem', 'glossary'] as const;
export type LearnKind = (typeof learnKinds)[number];
export const learnAudiences = ['all', 'shops', 'clients'] as const;
export const learnCtas = ['whatsapp', 'system', 'none'] as const;

const slugPart = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug inválido');
const pageSlug = z.union([
  z.literal(''),
  z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/, 'slug inválido'),
]);

const topicField = z.union([z.literal(''), z.enum(learnTopicIds)]);

const faq = z.object({ q: z.string().min(1), a: z.string().min(1) });
const chip = z.object({ id: slugPart, label: z.string().min(1) });
const link = z.object({ label: z.string().min(1), href: z.string().startsWith('/aprende') });
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
  filters: z.array(z.string()),
  tags: z.array(z.string()),
  related: z.array(pageSlug),
  sources: z.array(z.string()),
  audience: z.enum(learnAudiences),
  published: z.boolean(),
  order: z.number().int(),
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

const pctText = z.string();
/** A value the sources do not give is `null` (the table shows a dash). */
export const filamentRow = z.object({
  material: z.string(),
  slug: pageSlug,
  uses: z.string(),
  nozzleC: pctText,
  bedC: pctText,
  hdtC: z.number().nullable(),
  impactKjM2: z.number().nullable(),
  stiffnessMpa: z.number().nullable(),
  waterPct: z.number().nullable(),
  drying: z.string(),
  maxSpeedMmS: z.number().nullable(),
  printer: z.enum(['any', 'enclosed']),
  hardenedNozzle: z.enum(['yes', 'no']),
  /** `dry`: only with a dry spool (PVA / BVOH). */
  ams: z.enum(['yes', 'no', 'dry']),
  filters: z.array(z.string()),
});

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

export const printerRow = z.object({
  brand: z.string(),
  model: z.string(),
  widthMm: z.number().positive(),
  depthMm: z.number().positive(),
  heightMm: z.number().positive(),
  liters: z.number(),
  enclosed: z.boolean(),
  motion: z.string(),
  size: z.string(),
  note: z.string(),
  sources: z.array(z.string()),
});

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

export const maintenanceData = z.object({
  key: z.literal('mantenimiento'),
  chips: z.array(chip),
  rows: z.array(z.object({ when: z.string(), filter: z.string(), tasks: z.array(z.string()) })),
  sources: z.array(z.string()),
});

export const funFactsData = z.object({
  key: z.literal('datos-curiosos'),
  rows: z.array(z.object({ text: z.string(), topic: z.string(), sources: z.array(z.string()) })),
});

export const sourcesFile = z.array(
  z.object({ id: slugPart, name: z.string().min(1), url: z.url().nullable().optional() }),
);

export const searchConfig = z.object({
  synonyms: z.record(z.string(), z.array(z.string())),
  stopWords: z.array(z.string()),
});
export type SearchConfig = z.infer<typeof searchConfig>;

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
