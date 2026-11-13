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
    /** "Tamaño a medida": what to tell the customer about other sizes, quoted on WhatsApp. */
    customSize: text('custom_size').notNull().default(''),
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

/** Catalog categories, editable from the panel. `id` is also the URL segment (`/catalogo/<id>`). */
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    label: text('label').notNull(),
    /** Display order; the first category of a product in this order is its main one. */
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('categories_position_idx').on(t.position)],
);

/**
 * Addresses a product used to have. They keep working: the page redirects (301) to the current
 * one, and no other product can take them (docs/09 › product_slugs).
 */
export const productSlugs = sqliteTable(
  'product_slugs',
  {
    slug: text('slug').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index('product_slugs_product_idx').on(t.productId)],
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

/** Daily taps on the WhatsApp buttons (docs/09, docs/18). `product_id` is '' when not a product. */
export const whatsappClicks = sqliteTable(
  'whatsapp_clicks',
  {
    day: text('day').notNull(),
    source: text('source').notNull(),
    productId: text('product_id').notNull().default(''),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.source, t.productId] })],
);

export const learnKindValues = [
  'home',
  'section',
  'sheet',
  'article',
  'problem',
  'glossary',
] as const;
export const learnAudienceValues = ['all', 'shops', 'clients'] as const;
export const learnCtaValues = ['whatsapp', 'system', 'none'] as const;

/** One row per page of Aprende (docs/21 §7). `slug` is '' for the home page. */
export const learnPages = sqliteTable(
  'learn_pages',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    kind: text('kind', { enum: learnKindValues }).notNull(),
    topic: text('topic').notNull().default(''),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull().default(''),
    summary: text('summary').notNull().default(''),
    bodyMd: text('body_md').notNull().default(''),
    /** JSON `LearnNode[]` made when saving (docs/21 §5). */
    bodyAst: text('body_ast').notNull().default('[]'),
    /** JSON `{ id, text }[]` with the `h2` of the body. */
    toc: text('toc').notNull().default('[]'),
    /** Normalized text of title, subtitle, summary, tags and questions: what the D1 search reads. */
    searchText: text('search_text').notNull().default(''),
    /** JSON arrays of strings (`chips`: `{ id, label }[]`). */
    filters: text('filters').notNull().default('[]'),
    chips: text('chips').notNull().default('[]'),
    tags: text('tags').notNull().default('[]'),
    related: text('related').notNull().default('[]'),
    sources: text('sources').notNull().default('[]'),
    /** JSON with what only some pages have: `featured`, `suggestions`, `terms`. */
    extra: text('extra').notNull().default('{}'),
    audience: text('audience', { enum: learnAudienceValues }).notNull().default('all'),
    cta: text('cta', { enum: learnCtaValues }).notNull().default('whatsapp'),
    ctaText: text('cta_text').notNull().default(''),
    published: integer('published', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    /** `YYYY-MM`. */
    reviewed: text('reviewed').notNull().default(''),
    /** True once the page was saved from the panel: the importer does not touch it (docs/21 §8). */
    editedInPanel: integer('edited_in_panel', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('learn_pages_slug_unique').on(t.slug),
    index('learn_pages_topic_idx').on(t.topic, t.published, t.sortOrder),
  ],
);

export const learnFaqs = sqliteTable(
  'learn_faqs',
  {
    id: text('id').primaryKey(),
    pageId: text('page_id')
      .notNull()
      .references(() => learnPages.id, { onDelete: 'cascade' }),
    /** Starts at 1: the number of `#pregunta-N`. */
    position: integer('position').notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
  },
  (t) => [index('learn_faqs_page_idx').on(t.pageId, t.position)],
);

/** Tables of data (`filamentos`, `impresoras`, `mantenimiento`, `datos-curiosos`, `buscador`). */
export const learnDatasets = sqliteTable('learn_datasets', {
  key: text('key').primaryKey(),
  data: text('data').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const learnSources = sqliteTable('learn_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url'),
});

/** Searches with no result, per day, without anything that identifies the person (docs/22 §11). */
export const learnSearchMisses = sqliteTable(
  'learn_search_misses',
  {
    day: text('day').notNull(),
    query: text('query').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.day, t.query] }),
    index('learn_search_misses_day_idx').on(t.day),
  ],
);

export type Setting = typeof settings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type LearnPage = typeof learnPages.$inferSelect;
export type NewLearnPage = typeof learnPages.$inferInsert;
export type LearnFaq = typeof learnFaqs.$inferSelect;
