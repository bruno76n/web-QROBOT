# 10 · Backend

Todo el servidor corre dentro del Worker de Astro. No hay API pública: las páginas leen con **consultas** y el panel lee y escribe con **acciones**.

## 1. Acceso a Cloudflare desde el código

- Bindings en `wrangler.jsonc`: `DB` (D1), `BUCKET` (R2), `CLICK_LIMITER` (Rate Limiting, fase 5).
- Variables (`wrangler.jsonc`): `PUBLIC_IMG_BASE` (`https://img.[dominio]`; en desarrollo `/img`), `ACCESS_TEAM_DOMAIN`, `APP_ENV` (`development` · `preview` · `production`).
- Secretos (`wrangler secret put`): `ACCESS_AUD`, `ADMIN_EMAILS` (lista separada por comas).
- Se leen como indique la versión del adaptador de Cloudflare instalada (`Astro.locals.runtime.env` o `import { env } from 'cloudflare:workers'`). Un solo lugar los envuelve: `src/server/db/client.ts` (`getDb()`), `src/server/storage.ts` (`getBucket()`, `putObject()`, `deleteByPrefix()`, `photoUrl()`), `src/server/env.ts` (variables).
- Tipos de los bindings en `src/env.d.ts` (generados con `wrangler types`).

## 2. Consultas (lectura, `src/server/queries/`)

Las usan las páginas `.astro` en el servidor. El panel **no** las llama directo (es una isla en el navegador): las llama a través de las acciones de lectura de §3.

| Función | Devuelve | La usa |
|---|---|---|
| `listPublishedProducts({ category? })` | Tarjetas: id, slug, nombre, frase, precio, featured, primera foto | Catálogo |
| `getPublishedProduct(slug)` | Producto completo con categorías, colores y fotos en orden; `null` si no existe o está oculto | Producto |
| `listRelated(product, limit = 4)` | Publicados que comparten categoría, sin el mismo | Producto |
| `listChristmasPicks(limit = 4)` | Publicados, categoría `navidad`, `featured`, por orden | Inicio |
| `getProductPrice(slug)` | Precio desde (para Q-404 en el inicio) | Inicio |
| `getHero()` | Portadas con sus fotos y el intervalo | Inicio, panel |
| `listAllProductsForAdmin()` | Todos, con estado y primera foto | Panel |
| `getProductForAdmin(id)` | Todo, incluidas fotos con recorte, versión, anchos y alt | Panel |
| `clickStats(days = 30)` | Toques por producto y por origen (`18`) | Panel |
| `getLearnHome()` · `getLearnTopic(tema)` · `getLearnPage(slug)` · `listLearnSitemap()` · `searchLearnD1(q, tema?)` | Aprende (`21 §9`, `src/server/queries/learn.ts`): una página hace 2 viajes a D1 (la página y un `batch` con preguntas, relacionadas, fuentes y tablas) | Aprende |

Las URL de fotos se arman con `photoUrl(photo, width)`, que solo usa anchos de `photos.widths`.

## 3. Acciones del panel (`src/actions/admin/`)

**Orden de cada acción:**
1. El **middleware** (`src/middleware.ts`) ya rechazó con `401` cualquier petición a `/_actions/admin.*` y `/api/admin/*` sin sesión válida (`requireAdmin`, usando `getActionContext` para reconocer las acciones). Así la sesión se revisa **antes** de que Astro valide la entrada.
2. Dentro del handler se vuelve a llamar `requireAdmin(context)` (defensa en profundidad; si alguien quita la ruta del middleware, sigue protegido).
3. Validación con Zod (la entrada declarada en la acción; esquemas en `src/lib/schemas.ts`).
4. Escritura con un `db.batch`.

**Cómo se devuelven los errores.** `ActionError` de Astro solo acepta códigos HTTP (`BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`, …) y no tiene `details`. Por eso:
- **Errores de negocio** (§5 con `422`, `409`, `404`): la acción **no lanza**; devuelve `{ ok: false, code, details? }`. Éxito: `{ ok: true, data }`. El tipo es `Result<T>` en `src/lib/result.ts`.
- **Sesión** (`UNAUTHORIZED`): la responde el middleware con `401`.
- **Validación de Zod** de Astro (`BAD_REQUEST` con `fields`): el ayudante del panel (`src/components/admin/lib/call.ts`) la convierte a `VALIDATION` con los campos.
- **Inesperado**: `ActionError('INTERNAL_SERVER_ERROR')` con el `errorId` en el mensaje; se registra (`13 §9`).

| Acción | Entrada | Hace | Errores |
|---|---|---|---|
| `admin.listProducts` | — | `listAllProductsForAdmin()` | — |
| `admin.getProduct` | `{ id }` | `getProductForAdmin(id)` | `NOT_FOUND` |
| `admin.getHero` | — | `getHero()` | — |
| `admin.clickStats` (fase 5) | `{ days }` | `clickStats(days)` | — |
| `admin.saveProduct` | Datos del producto (sin id si es nuevo); `photos: { id, crop, version, widths, alt }[]` en orden; categorías; colores en orden | Crea o actualiza; slug (`09 §3`); adjunta fotos `pending`, aplica recorte/versión/alt nuevos, quita las que ya no están; reglas de publicar. Después del `batch`, borra de R2 las fotos quitadas y las versiones viejas de las re-centradas | `VALIDATION`, `SLUG_TAKEN`, `CANNOT_PUBLISH` (`details.missing`), `PHOTO_NOT_FOUND`, `TOO_MANY_PHOTOS`, `NOT_FOUND` |
| `admin.setPublished` | `{ id, published }` | Interruptor rápido de la lista | `CANNOT_PUBLISH`, `NOT_FOUND` |
| `admin.reorderProducts` | `ids[]` en el orden nuevo | Reescribe `sort_order` | `VALIDATION` |
| `admin.duplicateProduct` | `{ id }` | Copia datos (no fotos), nombre "… (copia)", sin publicar | `NOT_FOUND` |
| `admin.deleteProduct` | `{ id }` | Borra producto, filas y fotos (`07 §5`) | `NOT_FOUND` |
| `admin.saveHero` | `slides: { desktop: { id, crop, version, widths, alt }, mobile?: {…} }[]` en orden; `intervalSeconds` | Reemplaza la portada completa. Las fotos de portada que ya no están se borran de D1 y de R2; las re-centradas borran su versión vieja | `VALIDATION`, `TOO_MANY_SLIDES`, `PHOTO_NOT_FOUND` |
| `admin.resetHero` | — | Borra todas las portadas y sus fotos (D1 y R2): el inicio vuelve a la foto por defecto | — |
| `admin.exportBackup` | — | Devuelve el JSON de `09 §5` | — |
| `admin.cleanupPending` | — | Borra fotos `pending` de más de 24 h (se llama al abrir el panel) | — |

## 4. Subir fotos (`POST /api/admin/upload`)

Endpoint aparte porque manda archivos (`multipart/form-data`). **Una foto por llamada.**

**Entrada:** `kind` (`product` · `hero_desktop` · `hero_mobile`), `photoId` (solo si se vuelve a centrar una existente), el **original** (si es nueva), las **versiones** generadas en el navegador y su lista de anchos, `og.jpg` (producto), el recorte (`crop_x…`), tamaño del original y `aspect`.

**Pasos:**
1. Sesión (middleware + `requireAdmin`).
2. Validar (`13 §5`): tipos permitidos, tamaños, bytes iniciales, que los anchos sean los que corresponden a ese recorte según `src/lib/crop.ts`.
3. Calcular `version` (hash corto del recorte + hora).
4. Subir a R2 con `Cache-Control: public, max-age=31536000, immutable` y su `Content-Type`.
5. Foto nueva: insertar la fila con `status = 'pending'`, su recorte, versión y anchos. Re-centrado: **no** toca la fila; devuelve la versión nueva y la aplica `saveProduct` o `saveHero` al guardar.
6. Responder `{ photoId, version, widths, urls }`.

Si algo falla a la mitad, se borra lo que alcanzó a subirse con esa `version`.

## 5. Códigos de error

Mismos códigos en servidor y panel. Texto en español en `src/i18n/es.ts` (`12 §7`). Nunca se muestra el mensaje técnico.

| Código | HTTP equivalente | Cómo llega | Cuándo |
|---|---|---|---|
| `UNAUTHORIZED` | 401 | Middleware | Sin sesión válida de Access |
| `VALIDATION` | 400 | Zod de Astro → ayudante del panel | Entrada inválida; trae los campos |
| `NOT_FOUND` | 404 | `Result` | Id que no existe |
| `SLUG_TAKEN` | 409 | `Result` | Slug escrito a mano que ya usa otro producto |
| `CANNOT_PUBLISH` | 422 | `Result` | Falta algo para publicar; `details.missing` |
| `TOO_MANY_PHOTOS` | 422 | `Result` | Más de 10 |
| `TOO_MANY_SLIDES` | 422 | `Result` | Más de 6 |
| `PHOTO_NOT_FOUND` | 422 | `Result` | `photoId` que no existe o es de otro dueño |
| `FILE_TYPE` | 415 | Respuesta del endpoint de subida | No es JPG, PNG ni WEBP, o los bytes no coinciden (las HEIC se convierten a JPG en el navegador) |
| `FILE_TOO_LARGE` | 413 | Respuesta del endpoint de subida | Original > 25 MB o versión > 2 MB |
| `INTERNAL` | 500 | `ActionError` / endpoint | Inesperado; solo se muestra el `errorId` |

El endpoint de subida responde `{ ok: false, code, details? }` con su HTTP.

## 6. Configuración del negocio (`src/config/site.ts`)

```ts
export const site = {
  domain: 'https://quickrobot.example',     // pendiente (01)
  whatsapp: '523481308678',                  // +52 348 130 8678
  facebook: '', instagram: '',               // pendientes
  christmas: { orderDeadline: '12-12', eve: '12-24', seasonStart: '10-01' },
  timeZone: 'America/Mexico_City',
  video: { src: '/media/timelapse.mp4' as string | null, speed: 0.5 }, // src null = sin video; speed = velocidad de reproducción
};
```

Fechas sin año: el año se calcula con la fecha de hoy en Guadalajara (`src/lib/season.ts`).

## 7. Contar toques a WhatsApp (`POST /api/click`, fase 5)

Recibe `{ source, productId? }` (con `navigator.sendBeacon`). Pasa por el limitador (`CLICK_LIMITER`, `13 §4`), valida con Zod, suma 1 en `whatsapp_clicks` del día (`product_id = ''` si no es de producto) y responde `204`. No guarda IP ni nada de la persona.

## 8. Hora actual y modo de prueba

- Todo lo que depende de la fecha en el servidor (temporada de Navidad) pide la hora a `src/server/clock.ts` → `now()`.
- Si `APP_ENV` **no** es `production`, `now()` acepta la cabecera `x-test-now` (fecha ISO). Las pruebas de Playwright la mandan junto con el reloj simulado del navegador. En producción la cabecera se ignora (prueba que lo verifica).

## 9. Solo en desarrollo

- `src/pages/img/[...key].ts` lee de R2 local y sirve la foto. Responde 404 si `APP_ENV` es `production`.
- Sesión falsa de administrador solo con `import.meta.env.DEV` (`13 §2`).
- `src/pages/dev/ui.astro` (muestra de componentes, fase 1): responde 404 si no es `import.meta.env.DEV`.
- `scripts/seed.ts` (`09 §4`).
