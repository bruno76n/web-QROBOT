import slugify from '@sindresorhus/slugify';

/** Limits of docs/09 §3 and docs/15 §6. */
export const limits = {
  maxPhotos: 10,
  maxSlides: 6,
  maxColors: 12,
  nameMax: 80,
  shortMax: 120,
  descriptionMax: 2000,
  personalHintMax: 60,
  maxCategories: 30,
  categoryLabelMax: 40,
} as const;

export type Missing = 'photo' | 'category' | 'price' | 'name';

export interface PublishInput {
  name: string;
  slug: string;
  photoCount: number;
  categoryCount: number;
  priceFromCents: number | null;
}

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slugPattern.test(slug) && slug.length <= 80;
}

/** What is still missing to publish (docs/09 §3). Empty list = can be published. */
export function missingToPublish(input: PublishInput): Missing[] {
  const missing: Missing[] = [];
  if (input.photoCount < 1) missing.push('photo');
  if (input.categoryCount < 1) missing.push('category');
  if (input.priceFromCents === null || input.priceFromCents < 0) missing.push('price');
  if (input.name.trim() === '' || !isValidSlug(input.slug)) missing.push('name');
  return missing;
}

/** "Llaveros con nombre" → "llaveros-con-nombre"; accents and ñ are folded. */
export function slugFromName(name: string): string {
  return slugify(name, { separator: '-', lowercase: true }).slice(0, 80).replace(/-+$/g, '');
}

/** First free slug: `base`, then `base-2`, `base-3`… (docs/09 › slug). */
export function uniqueSlug(base: string, taken: ReadonlySet<string> | readonly string[]): string {
  const used = taken instanceof Set ? taken : new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}

/**
 * The slug does not follow the name once the product has been published, so shared links keep
 * working (docs/09 §3). A slug typed by hand always wins.
 */
export function slugForSave(args: {
  name: string;
  typedSlug: string | undefined;
  currentSlug: string | undefined;
  wasPublished: boolean;
}): string {
  const typed = args.typedSlug?.trim();
  if (typed) return typed;
  if (args.currentSlug && args.wasPublished) return args.currentSlug;
  return slugFromName(args.name);
}
