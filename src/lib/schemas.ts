import { z } from 'zod';
import { colorIds } from '@/config/colors';
import { limits, slugPattern } from './publish';

/** Shared Zod schemas: the panel forms and the server actions use the same ones (docs/06). */
export const cropSchema = z.object({
  // Negative `x`/`y` and sizes past the original only happen with padded product crops; the
  // services check the real limits against the original (`isValidCrop`).
  x: z.number().int().min(-40_000).max(40_000),
  y: z.number().int().min(-40_000).max(40_000),
  width: z.number().int().min(1).max(40_000),
  height: z.number().int().min(1).max(40_000),
});

/** A photo attached to a product or slide, in the order shown. */
export const photoRefSchema = z.object({
  id: z.string().min(1).max(64),
  crop: cropSchema,
  version: z.string().regex(/^[0-9a-f]{8}$/),
  widths: z.array(z.number().int().min(1).max(4000)).min(1).max(6),
  alt: z.string().trim().max(200).default(''),
});
export type PhotoRef = z.infer<typeof photoRefSchema>;

const isUnique = (items: readonly string[]) => new Set(items).size === items.length;

const text = (max: number) => z.string().trim().max(max);

export const categoryIdSchema = z.string().max(40).regex(slugPattern);
export const categoryLabelSchema = z.string().trim().min(1).max(limits.categoryLabelMax);

export const categoryCreateSchema = z.object({ label: categoryLabelSchema });
export const categoryRenameSchema = z.object({ id: categoryIdSchema, label: categoryLabelSchema });
export const categoryDeleteSchema = z.object({ id: categoryIdSchema });
export const categoryReorderSchema = z.object({
  ids: z.array(categoryIdSchema).max(limits.maxCategories).refine(isUnique, 'duplicates'),
});

export const productInputSchema = z.object({
  /** Missing for a new product. */
  id: z.string().min(1).max(64).optional(),
  name: text(limits.nameMax).min(1),
  /** Typed by hand; empty means "generate it from the name". */
  slug: z.union([z.literal(''), z.string().max(80).regex(slugPattern)]).default(''),
  unitSingular: text(60).default(''),
  unitPlural: text(60).default(''),
  short: text(limits.shortMax).default(''),
  description: text(limits.descriptionMax).default(''),
  priceFromCents: z.number().int().min(0).max(100_000_000).nullable().default(null),
  priceNote: text(120).default('Baja si pides varias.'),
  size: text(80).default(''),
  material: text(40).default('PLA'),
  leadTime: text(60).default(''),
  personalizable: z.boolean().default(false),
  personalHint: text(limits.personalHintMax).default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  /** Ids are checked against the `categories` table by the service (UNKNOWN_CATEGORY). */
  categories: z.array(categoryIdSchema).max(limits.maxCategories).refine(isUnique, 'duplicates'),
  colors: z.array(z.enum(colorIds)).max(limits.maxColors).refine(isUnique, 'duplicates'),
  // Loose here on purpose: the 10-photo limit is a business rule that answers TOO_MANY_PHOTOS.
  photos: z.array(photoRefSchema).max(100),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const heroSlideInputSchema = z.object({
  desktop: photoRefSchema,
  mobile: photoRefSchema.nullable().default(null),
});

export const heroIntervals = [4, 6, 8, 12] as const;

export const heroInputSchema = z.object({
  // Loose here on purpose: the 6-slide limit answers TOO_MANY_SLIDES.
  slides: z.array(heroSlideInputSchema).max(50),
  intervalSeconds: z.union([z.literal(4), z.literal(6), z.literal(8), z.literal(12)]).default(6),
});
export type HeroInput = z.infer<typeof heroInputSchema>;

export const idSchema = z.object({ id: z.string().min(1).max(64) });
export const setPublishedSchema = z.object({
  id: z.string().min(1).max(64),
  published: z.boolean(),
});
export const reorderSchema = z.object({ ids: z.array(z.string().min(1).max(64)).max(1000) });

/** Text fields of `POST /api/admin/upload` (docs/10 §4); the files travel next to them. */
export const uploadFieldsSchema = z.object({
  kind: z.enum(['product', 'hero_desktop', 'hero_mobile']),
  /** Present only when re-centering an existing photo. */
  photoId: z.string().min(1).max(64).optional(),
  aspect: z.enum(['1:1', '16:9', '3:4']),
  // Negative origin or sizes past the original only for padded product crops (`isValidCrop`).
  cropX: z.coerce.number().int().min(-40_000).max(40_000),
  cropY: z.coerce.number().int().min(-40_000).max(40_000),
  cropWidth: z.coerce.number().int().min(1).max(40_000),
  cropHeight: z.coerce.number().int().min(1).max(40_000),
  originalWidth: z.coerce.number().int().min(1).max(20000),
  originalHeight: z.coerce.number().int().min(1).max(20000),
  /** JSON array with the widths of the files sent, e.g. "[400,800]". */
  widths: z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        ctx.addIssue({ code: 'custom', message: 'widths must be JSON' });
        return z.NEVER;
      }
    })
    .pipe(z.array(z.number().int().min(1).max(4000)).min(1).max(6)),
});
export type UploadFields = z.infer<typeof uploadFieldsSchema>;

/** Where a tap on a WhatsApp button came from (docs/18 §2). */
export const clickSources = ['product', 'order', 'q404', 'customizer'] as const;
export type ClickSource = (typeof clickSources)[number];

/** Body of `POST /api/click`: a product id only makes sense for `product`. */
export const clickInputSchema = z
  .object({
    source: z.enum(clickSources),
    productId: z.string().min(1).max(64).optional(),
  })
  .refine((v) => (v.source === 'product') === (v.productId !== undefined));

export const clickStatsInputSchema = z.object({
  days: z.number().int().min(1).max(365).default(30),
});
