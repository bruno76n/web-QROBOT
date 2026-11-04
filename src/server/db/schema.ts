import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

/** Timestamps are unix milliseconds. */
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

/** Key–value pairs editable from the panel (docs/09 › settings). */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    unitSingular: text('unit_singular').notNull().default(''),
    unitPlural: text('unit_plural').notNull().default(''),
    short: text('short').notNull().default(''),
    description: text('description').notNull().default(''),
    priceFromCents: integer('price_from_cents'),
    priceNote: text('price_note').notNull().default('Baja si pides varias.'),
    size: text('size').notNull().default(''),
    material: text('material').notNull().default('PLA'),
    leadTime: text('lead_time').notNull().default(''),
    personalizable: integer('personalizable', { mode: 'boolean' }).notNull().default(false),
    personalHint: text('personal_hint').notNull().default(''),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    published: integer('published', { mode: 'boolean' }).notNull().default(false),
    /** True once the product has been published at least once: its slug stops following the name. */
    everPublished: integer('ever_published', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('products_slug_unique').on(t.slug),
    index('products_published_sort_idx').on(t.published, t.sortOrder),
  ],
);

export const productCategories = sqliteTable(
  'product_categories',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.category] }),
    index('product_categories_category_idx').on(t.category, t.productId),
  ],
);

export const productColors = sqliteTable(
  'product_colors',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    color: text('color').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.color] })],
);

export const photoOwnerTypes = ['product', 'hero_desktop', 'hero_mobile'] as const;
export const photoStatuses = ['pending', 'attached'] as const;
export const photoAspects = ['1:1', '16:9', '3:4'] as const;

/** One row per photo: its original and the crop chosen (docs/09 › photos). */
export const photos = sqliteTable(
  'photos',
  {
    id: text('id').primaryKey(),
    ownerType: text('owner_type', { enum: photoOwnerTypes }).notNull(),
    /** Product or hero slide id; null while the photo is `pending`. */
    ownerId: text('owner_id'),
    status: text('status', { enum: photoStatuses }).notNull().default('pending'),
    sortOrder: integer('sort_order').notNull().default(0),
    originalKey: text('original_key').notNull(),
    originalWidth: integer('original_width').notNull(),
    originalHeight: integer('original_height').notNull(),
    cropX: integer('crop_x').notNull(),
    cropY: integer('crop_y').notNull(),
    cropWidth: integer('crop_width').notNull(),
    cropHeight: integer('crop_height').notNull(),
    aspect: text('aspect', { enum: photoAspects }).notNull(),
    /** Short hash; changes every time the photo is re-centered. Part of the variants' key. */
    version: text('version').notNull(),
    /** JSON array with the widths that were really generated, e.g. `[400,800]`. */
    widths: text('widths').notNull().default('[]'),
    alt: text('alt').notNull().default(''),
    ...timestamps,
  },
  (t) => [
    index('photos_owner_idx').on(t.ownerType, t.ownerId, t.sortOrder),
    index('photos_status_created_idx').on(t.status, t.createdAt),
  ],
);

export const heroSlides = sqliteTable('hero_slides', {
  id: text('id').primaryKey(),
  sortOrder: integer('sort_order').notNull().default(0),
  desktopPhotoId: text('desktop_photo_id')
    .notNull()
    .references(() => photos.id),
  mobilePhotoId: text('mobile_photo_id').references(() => photos.id),
});

export type Setting = typeof settings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type HeroSlide = typeof heroSlides.$inferSelect;
