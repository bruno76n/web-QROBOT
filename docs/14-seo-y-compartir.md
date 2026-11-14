# 14 · SEO y compartir

Dos objetivos: que **Google** encuentre cada producto ("llaveros con nombre Guadalajara", "servilleteros con logo") y que **cada link compartido** en WhatsApp o Facebook salga con foto, nombre y precio.

## 1. Etiquetas por página

Se generan en `BaseLayout.astro` con lo que mande cada página.

| Página | `<title>` | `description` | `og:image` |
|---|---|---|---|
| Inicio | Quick Robot · Impresión 3D | Piezas con el logo de tu negocio, figuras de los que quieres y regalos que no hay en ninguna tienda. Pide por WhatsApp. | Imagen de marca 1200 × 630 (`public/brand/og-default.jpg`: solo el logo, la cabeza de Q-404, centrado sobre blanco) |
| Catálogo | Catálogo · Quick Robot | Llaveros, servilleteros, figuras y adornos impresos en 3D. Precios desde $X. | La de marca |
| Categoría | {Categoría} · Quick Robot | Lista de lo que hay en esa categoría, con precio desde | La de marca |
| Producto | {Nombre} desde ${precio} · Quick Robot | {Frase corta} Impresión 3D. | `og.jpg` de su primera foto |
| Privacidad | Aviso de privacidad · Quick Robot | — | La de marca |
| 404 | Error 404 · Quick Robot | — (`noindex`) | La de marca |
| Panel | Panel · Quick Robot | — (`noindex, nofollow`) | — |

En todas: `canonical` con el dominio de `site.ts`, `og:type` (`website` o `product`), `og:title`, `og:description`, `og:url`, `og:locale = es_MX`, `og:site_name = Quick Robot`, `twitter:card = summary_large_image`, `lang="es-MX"` en `<html>`, favicon SVG (cabeza de Q-404) y `apple-touch-icon` PNG 180 × 180.

Producto además: `product:price:amount` y `product:price:currency = MXN`.

## 2. Datos estructurados (JSON-LD)

- **Inicio:** `LocalBusiness` (o `Store`) con nombre, `url`, `logo`, `image`, `areaServed: Guadalajara`, `address` (ciudad y estado; la dirección completa solo si el dueño la da), `telephone` (cuando exista) y `sameAs` (redes).
- **Producto:** `Product` con `name`, `description`, `image` (las versiones de 1200), `brand: Quick Robot`, `offers` como `AggregateOffer` con `lowPrice`, `priceCurrency: MXN`, `availability: InStock`.
- **Catálogo:** `BreadcrumbList` en producto y categoría.

Se valida en la fase 3 con el validador de Schema.org (prueba que compara contra un JSON esperado).

## 3. Sitemap y robots

- Sin `@astrojs/sitemap` (solo ve páginas fijas). El sitemap es una ruta del servidor (`src/pages/sitemap.xml.ts`) que lista inicio, catálogo, categorías, productos publicados (con `lastmod = updated_at`) y privacidad.
- `robots.txt` (`src/pages/robots.txt.ts`): permite todo salvo `/admin` y `/api`; apunta al sitemap.
- **Para talleres** (`25 §2`): el sitemap incluye sus 3 páginas solo con `systemVisible`; `robots.txt` nunca menciona `/talleres` (un `Disallow` anunciaría la ruta).

## 4. URLs

- Limpias y en español: `/catalogo/navidad`, `/producto/llaveros-con-nombre`.
- Sin barra final (configuración `trailingSlash: 'never'`); la otra forma redirige con 301.
- Si un slug cambia, el viejo da 404 (decisión: no se guarda historial de slugs; el panel avisa, `09 §3`).

## 5. Contenido

- Un `h1` por página con el nombre del producto o de la página.
- Texto real en HTML (no dentro de imágenes); `alt` en cada foto.
- La ciudad (Guadalajara) aparece en el título del inicio, el texto oculto del hero, el footer y el JSON-LD.

## 6. Después del lanzamiento (manual, lo hace el dueño)

- Dar de alta el sitio en Google Search Console y mandar el sitemap.
- Perfil de Google Business con el link a la web.
- Probar un link en WhatsApp y en el depurador de Facebook (Sharing Debugger).

Estos pasos van como lista en el informe de la fase 5.
