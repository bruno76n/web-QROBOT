/**
 * Rules for publishing a product and for building its URL slug: limits, what is missing to
 * publish, slug generation and uniqueness. Pure.
 */
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

/** A requirement that can still be missing on a product. */
export type Missing = 'photo' | 'category' | 'price' | 'name';

/** The facts about a product that decide whether it can be published. */
export interface PublishInput {
  name: string;
  slug: string;
  photoCount: number;
  categoryCount: number;
  priceFromCents: number | null;
}

/** Lowercase words and digits joined by single hyphens. */
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True for a slug that matches `slugPattern` and has at most 80 characters. */
export function isValidSlug(slug: string): boolean {
  return slugPattern.test(slug) && slug.length <= 80;
}

/**
 * What is still missing to publish (docs/09 §3): at least one photo, a price (0 or more) and a
 * name with a valid slug. Empty list = can be published.
 */
export function missingToPublish(input: PublishInput): Missing[] {
  const missing: Missing[] = [];
  if (input.photoCount < 1) missing.push('photo');
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
 * The address follows the name every time it is saved. The old one is kept as a redirect
 * (`product_slugs`), so shared links keep working. A slug typed by hand always wins.
 */
export function slugForSave(args: {
  name: string;
  typedSlug: string | undefined;
  currentSlug: string | undefined;
}): string {
  const typed = args.typedSlug?.trim();
  if (typed) return typed;
  // A name with nothing usable ("¡¡¡") keeps the address the product already has.
  return slugFromName(args.name) || args.currentSlug || '';
}
