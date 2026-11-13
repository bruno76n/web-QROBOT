# 09 · Modelo de datos

Base **D1 (SQLite)** con **Drizzle**. Esquema en `src/server/db/schema.ts`; migraciones en `migrations/` generadas con `drizzle-kit` y aplicadas con `wrangler d1 migrations apply`.

**Reglas generales**
- Ids: texto, generados con `crypto.randomUUID()`.
- Dinero: **centavos enteros** (`*_cents`). La web muestra pesos sin centavos (`$1,250`).
- Fechas: `integer` con modo `timestamp_ms` de Drizzle.
- Booleanos: `integer` con modo `boolean`.
- Lo que es fijo (colores, ideas, combinaciones de Q-404) **no** va en la base: vive en `src/config/`. La base guarda solo sus ids. **Las categorías sí viven en la base** (tabla `categories`, editable desde el panel); `src/config/categories.ts` solo conserva la semilla inicial.

## 1. Tablas

### `products`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | text PK | |
| `slug` | text, único | Minúsculas, números y guiones. Se genera del nombre; si choca, se agrega `-2`, `-3`… |
| `name` | text | 1–80 caracteres |
| `unit_singular` | text | "llavero" — para el mensaje de WhatsApp. Si falta, se usa el nombre |
| `unit_plural` | text | "llaveros" |
| `short` | text | Frase corta, hasta 120 |
| `description` | text | Hasta 2 000; párrafos separados por línea en blanco |
| `price_from_cents` | integer, nulo | Obligatorio para publicar |
| `price_note` | text | Por defecto "Baja si pides varias." |
| `size` | text | Libre: "9 cm de diámetro" |
| `material` | text | Por defecto "PLA" |
| `lead_time` | text | "3 a 5 días" |
| `custom_size` | text | "Tamaño a medida": qué decir de otros tamaños (se cotizan por WhatsApp); vacío = no se muestra. Migración `0005` |
| `personalizable` | boolean | |
| `personal_hint` | text | Pregunta al cliente, hasta 60 |
| `featured` | boolean | Etiqueta "Más pedido"; también decide qué sale en Navidad |
| `published` | boolean | Si es falso, nadie lo ve |
| `sort_order` | integer | Orden en el catálogo (0 = primero) |
| `created_at`, `updated_at` | timestamp | |

### `categories`

| Columna | Tipo |
|---|---|
| `id` | text, clave primaria; también el tramo de la URL (`/catalogo/<id>`). Se genera del nombre y no cambia al renombrar |
| `label` | text — nombre visible |
| `position` | integer — orden; la categoría principal de un producto es la primera en este orden |
| `created_at`, `updated_at` | unix ms |

La migración `0004` crea la tabla con `negocio`, `casa` y `navidad`. **`navidad` no se puede borrar** (la temporada depende de ella). Borrar una categoría la quita también de `product_categories` (en un solo `db.batch`) y se rechaza si un producto publicado se quedaría sin categorías (`CATEGORY_IN_USE`). Guardar un producto con una categoría que no existe da `UNKNOWN_CATEGORY`.

### `product_slugs`

| Columna | Tipo |
|---|---|
| `slug` | text, clave primaria — una dirección que el producto tuvo |
| `product_id` | text → `products.id`, se borra con el producto |
| `created_at`, `updated_at` | unix ms |

`/producto/<slug viejo>` responde `301` a la dirección actual mientras el producto esté publicado (migración `0006`).

### `product_categories`
| `product_id` | text FK → products (borrado en cascada) |
|---|---|
| `category` | text — id de `categories` (sin clave foránea: lo valida el servidor) |
| PK | (`product_id`, `category`) |

El orden de la lista no importa salvo la **categoría principal** (migas), que es la primera en el orden de `categories.ts`.

### `product_colors`
| `product_id` | text FK → products (cascada) |
|---|---|
| `color` | text — id de `src/config/colors.ts` |
| `sort_order` | integer |
| PK | (`product_id`, `color`) |

### `photos`
Una fila por foto, con su original y sus versiones.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text PK | |
| `owner_type` | text | `product` · `hero_desktop` · `hero_mobile` |
| `owner_id` | text, nulo | Id del producto o de la portada; nulo mientras está `pending` |
| `status` | text | `pending` · `attached` |
| `sort_order` | integer | Orden dentro del producto (0 = portada de la tarjeta) |
| `original_key` | text | Clave en R2 del original (para volver a centrar) |
| `original_width`, `original_height` | integer | |
| `crop_x`, `crop_y`, `crop_width`, `crop_height` | integer | Recorte en píxeles del original (lo que devuelve react-easy-crop como `croppedAreaPixels`) |
| `aspect` | text | `1:1` · `16:9` · `3:4` |
| `version` | text | Hash corto; cambia cada vez que se vuelve a centrar. Forma parte de la clave de las versiones |
| `widths` | text (JSON) | Anchos que sí se generaron, por ejemplo `[400,800]` o `[300]` (`12 §3` paso 5). `photoUrl` y `srcset` usan solo estos |
| `alt` | text | Texto alternativo; si falta, se usa el nombre del producto |
| `created_at`, `updated_at` | timestamp | |

**Claves en R2** (`12 §3` dice qué tamaños). Todo cuelga del id de la foto, así que subir antes de guardar el producto no obliga a mover archivos:
```
ph/<photoId>/original.<ext>
ph/<photoId>/<version>/<ancho>.webp     producto: 400, 800, 1200 · escritorio: 1200, 2400 · celular: 600, 1200
ph/<photoId>/<version>/og.jpg           1200 × 630 (fotos de producto)
```
Borrar una foto = borrar todo lo que empieza con `ph/<photoId>/`. Al volver a centrar, se suben las versiones con `version` nuevo y se borran las del anterior.

### `hero_slides`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | text PK | |
| `sort_order` | integer | |
| `desktop_photo_id` | text FK → photos | Obligatoria |
| `mobile_photo_id` | text FK → photos, nulo | Opcional |

Máximo 6 portadas.

### `settings`
Pares clave–valor editables desde el panel.

| `key` | Valor | Por defecto |
|---|---|---|
| `hero_interval_seconds` | `4` · `6` · `8` · `12` | `6` |

### `whatsapp_clicks` (fase 5, `18`)
| Columna | Tipo | Notas |
|---|---|---|
| `day` | text | `YYYY-MM-DD` hora de Guadalajara |
| `source` | text | `product` · `order` · `q404` · `customizer` |
| `product_id` | text, `NOT NULL DEFAULT ''` | Id del producto si `source = product`; cadena vacía en los demás. **No puede ser nulo**: SQLite trata cada nulo como distinto y `ON CONFLICT` nunca sumaría |
| `count` | integer | |
| PK | (`day`, `source`, `product_id`) — se suma con `INSERT … ON CONFLICT DO UPDATE` |

### Aprende (fase 6, migración `0007`; detalle en `21 §7`)

| Tabla | Columnas principales |
|---|---|
| `learn_pages` | `id` (`learn-<slug con guiones>`, `learn-home` la portada), `slug` único (`''` = portada), `kind`, `topic`, `title`, `subtitle`, `summary`, `body_md`, `body_ast` (JSON), `toc` (JSON), `search_text` (tres líneas normalizadas: título · etiquetas · resto), `filters`, `chips`, `tags`, `related`, `sources`, `extra` (JSON: `featured`, `suggestions`, `terms`), `audience`, `cta`, `cta_text`, `published`, `sort_order`, `reviewed` (`AAAA-MM`), `edited_in_panel`, `created_at`, `updated_at` |
| `learn_faqs` | `id`, `page_id` FK → `learn_pages` (en cascada), `position` (desde 1: el número de `#pregunta-N`), `question`, `answer` |
| `learn_datasets` | `key` PK (`filamentos`, `impresoras`, `mantenimiento`, `datos-curiosos`, `buscador`), `data` (JSON), `updated_at` |
| `learn_sources` | `id` PK, `name`, `url` (nulo si no tiene liga) |
| `learn_search_misses` | `day`, `query`, `count`; PK (`day`, `query`); se suma con `ON CONFLICT` |

`settings` suma `learn_index_synced_at` y `learn_index_docs` (`22 §6`, fase 7).

## 2. Índices

- `products(published, sort_order)`
- `products(slug)` único
- `product_categories(category, product_id)`
- `photos(owner_type, owner_id, sort_order)`
- `photos(status, created_at)` (barrido de `pending`)
- `learn_pages(slug)` único · `learn_pages(topic, published, sort_order)` · `learn_faqs(page_id, position)` · `learn_search_misses(day)`

## 3. Reglas de datos (en `src/lib/publish.ts`, con prueba)

Para **publicar** un producto se necesita: nombre, slug válido, al menos **una foto** y **precio desde** (la categoría es opcional). Si falta algo, el interruptor "Publicado" no se puede encender y el panel dice qué falta (`12 §7`). Un borrador puede guardarse incompleto.

Otras reglas:
- Hasta **10 fotos** por producto; hasta **6 portadas**.
- Al menos 1 y como mucho 12 colores (o ninguno).
- El slug **siempre sigue al nombre** al guardar. La dirección anterior se guarda en `product_slugs` y redirige (301) a la actual, así los links compartidos no se rompen. Ningún otro producto puede usar una dirección vieja; si el producto vuelve a un nombre anterior, esa dirección se libera. El panel ya no muestra el campo de dirección.
- Al reordenar, `sort_order` se reescribe 0…N en un solo `batch`.
- Un producto borrado se borra de verdad (con confirmación), junto con sus fotos.

## 4. Semilla de desarrollo (`scripts/seed.ts`)

Carga los 14 productos de `05 §4` con sus fotos de `reference/seed-photos/` y la portada de `reference/hero/`.

- Las fotos de ejemplo son chicas (≤ 480 px; las de Q-404, 530 × 840) y no son cuadradas. La semilla **no las recorta**: pone cada una centrada sobre un cuadrado de color `--soft` del tamaño de su lado mayor (así no se pierde nada), usa ese cuadrado como "original" con recorte completo y genera las versiones con las reglas de `12 §3` (casi siempre una sola versión de su propio ancho). Se ven pequeñas; es lo esperado hasta que el dueño suba fotos reales.
- Corre en Node con `sharp` (dependencia solo de desarrollo) y escribe en D1 y R2 **locales** con `getPlatformProxy()` de wrangler.
- Solo corre contra la base **local**; si detecta que apunta a la remota, se niega.
- `pnpm dev` la carga **solo si la base local está vacía** (no borra lo que se probó en el panel). `pnpm seed` la vuelve a cargar desde cero.

## 5. Respaldo

- **Descargar respaldo** (panel, menú •••): un `.json` con productos, categorías, colores, datos de fotos, portada y ajustes, con `version: 1`. Las fotos no van dentro; siguen en R2.
- D1 guarda su historial (Time Travel) y permite volver a un momento anterior desde `wrangler` (`17 §5`).
