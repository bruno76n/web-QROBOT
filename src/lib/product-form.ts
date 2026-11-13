/** Form values, validation and conversions of the product form in the panel. Pure. */

import { z } from 'zod';
import type { CategoryId } from '@/config/categories';
import { colorIds, type ColorId } from '@/config/colors';
import { es } from '@/i18n/es';
import type { ProductDetail } from './admin-types';
import { centsToInput, parsePesos } from './money';
import { limits, slugPattern } from './publish';
import type { PhotoRef, ProductInput } from './schemas';

/** What the product form edits (photos live beside it). Price is text, in pesos. */
export interface ProductFormValues {
  name: string;
  slug: string;
  short: string;
  priceText: string;
  priceNote: string;
  categories: CategoryId[];
  description: string;
  size: string;
  material: string;
  leadTime: string;
  customSize: string;
  colors: ColorId[];
  unitSingular: string;
  unitPlural: string;
  personalizable: boolean;
  personalHint: string;
  featured: boolean;
  published: boolean;
}

/** Panel texts. */
const t = es.admin;
/** A trimmed string of at most `max` characters, with the panel's own message. */
const bounded = (max: number) => z.string().trim().max(max, t.tooLong(max));

/** Same limits as the server schema (`productInputSchema`), with the panel's own messages. */
export const productFormSchema = z.object({
  name: z.string().trim().min(1, t.required).max(limits.nameMax, t.tooLong(limits.nameMax)),
  slug: z.union([z.literal(''), z.string().max(80).regex(slugPattern, t.badSlug)]),
  short: bounded(limits.shortMax),
  priceText: z.string().refine((v) => v.trim() === '' || parsePesos(v) !== null, t.badPrice),
  priceNote: bounded(120),
  categories: z.array(z.string().regex(slugPattern)),
  description: bounded(limits.descriptionMax),
  size: bounded(80),
  material: bounded(40),
  leadTime: bounded(60),
  customSize: bounded(120),
  colors: z.array(z.enum(colorIds)).max(limits.maxColors),
  unitSingular: bounded(60),
  unitPlural: bounded(60),
  personalizable: z.boolean(),
  personalHint: bounded(limits.personalHintMax),
  featured: z.boolean(),
  published: z.boolean(),
});

/** Values of a new product form. */
export function emptyValues(): ProductFormValues {
  return {
    name: '',
    slug: '',
    short: '',
    priceText: '',
    priceNote: 'Baja si pides varias.',
    categories: [],
    description: '',
    size: '',
    material: 'PLA',
    leadTime: '',
    customSize: '',
    colors: [],
    unitSingular: '',
    unitPlural: '',
    personalizable: false,
    personalHint: '',
    featured: false,
    published: false,
  };
}

/** Form values of an existing product (price becomes text in pesos). */
export function valuesFromDetail(d: ProductDetail): ProductFormValues {
  return {
    name: d.name,
    slug: d.slug,
    short: d.short,
    priceText: centsToInput(d.priceFromCents),
    priceNote: d.priceNote,
    categories: d.categories,
    description: d.description,
    size: d.size,
    material: d.material,
    leadTime: d.leadTime,
    customSize: d.customSize,
    colors: d.colors,
    unitSingular: d.unitSingular,
    unitPlural: d.unitPlural,
    personalizable: d.personalizable,
    personalHint: d.personalHint,
    featured: d.featured,
    published: d.published,
  };
}

/**
 * Form + photos → what `admin.saveProduct` expects. Text is trimmed, the price becomes cents and
 * the personalization hint is dropped when the product is not personalizable.
 */
export function toProductInput(
  v: ProductFormValues,
  photos: PhotoRef[],
  id?: string,
): ProductInput {
  return {
    ...(id ? { id } : {}),
    name: v.name.trim(),
    slug: v.slug.trim(),
    unitSingular: v.unitSingular.trim(),
    unitPlural: v.unitPlural.trim(),
    short: v.short.trim(),
    description: v.description.trim(),
    priceFromCents: parsePesos(v.priceText),
    priceNote: v.priceNote.trim(),
    size: v.size.trim(),
    material: v.material.trim(),
    leadTime: v.leadTime.trim(),
    customSize: v.customSize.trim(),
    personalizable: v.personalizable,
    personalHint: v.personalizable ? v.personalHint.trim() : '',
    featured: v.featured,
    published: v.published,
    categories: v.categories,
    colors: v.colors,
    photos,
  };
}
