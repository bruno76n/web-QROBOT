import { z } from 'zod';
import { categoryIds } from '@/config/categories';
import { colorIds } from '@/config/colors';
import { limits, slugPattern } from './publish';

/** Shared Zod schemas: the panel forms and the server actions use the same ones (docs/06). */
export const cropSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
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

const text = (max: number) => z.string().trim().max(max);

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
  categories: z.array(z.enum(categoryIds)).max(categoryIds.length),
  colors: z.array(z.enum(colorIds)).max(limits.maxColors),
  photos: z.array(photoRefSchema).max(limits.maxPhotos),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const heroSlideInputSchema = z.object({
  desktop: photoRefSchema,
  mobile: photoRefSchema.nullable().default(null),
});

export const heroIntervals = [4, 6, 8, 12] as const;

export const heroInputSchema = z.object({
  slides: z.array(heroSlideInputSchema).max(limits.maxSlides),
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
  cropX: z.coerce.number().int().min(0),
  cropY: z.coerce.number().int().min(0),
  cropWidth: z.coerce.number().int().min(1),
  cropHeight: z.coerce.number().int().min(1),
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
