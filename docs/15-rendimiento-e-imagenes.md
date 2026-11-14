# 15 · Rendimiento e imágenes

La web se abre casi siempre **desde un link en el celular, con datos móviles**. Que cargue rápido es la razón de usar Astro (`07 §1`).

## 1. Metas

Medidas con Lighthouse en modo celular (4G lento simulado) y con las Web Vitals reales de Cloudflare Web Analytics.

| Métrica | Meta |
|---|---|
| LCP (lo más grande visible) | < 2.5 s |
| CLS (saltos de diseño) | < 0.1 |
| INP (respuesta al tocar) | < 200 ms |
| Lighthouse Rendimiento (celular) | ≥ 90 en inicio, catálogo y producto |
| Lighthouse Accesibilidad | ≥ 95 |
| Lighthouse Buenas prácticas | ≥ 95 |
| Lighthouse SEO | 100 |
| Tiempo de respuesta del servidor (TTFB) | < 400 ms en páginas públicas |

## 2. Presupuestos de JavaScript (comprimido)

Lo verifica `pnpm size` (`scripts/size-check.mjs`) leyendo el build.

| Página | JS al abrir | Notas |
|---|---|---|
| Producto | ≤ 70 KB | Embla + galería + opciones (sin React: React solo con el recortador del panel) |
| Catálogo | ≤ 25 KB al abrir | Sin islas pesadas: pestañas y tarjetas son HTML |
| Inicio | ≤ 90 KB al abrir | Sin contar islas `client:visible` de más abajo ni `matter-js` (se carga al tocar) |
| Aprende (portada, tema, ficha, ¿Cabe mi pieza?, calculadora) | ≤ 25 KB al abrir | Buscador, filtros y herramientas son `<script>` sin React (`21 §13`); `pnpm size` revisa también que no lleven `requestIdleCallback(` directo ni *lookbehind* (`24 §5`) |
| Para talleres (principal, precios, descargar) | ≤ 20, 15 y 8 KB al abrir (`25 §11`) | **Se mide al encender:** mientras esté oculta sus rutas dan 404 en el build y `pnpm size` las salta. La revisión de Safari 14 sí cubre sus scripts: `pnpm size` revisa todos los `.js` de `dist/client/_astro` (menos los del panel, `Admin*`) |
| Privacidad, 404 | 0 KB de React (≤ 8 KB en total) | Solo los `<script>` del header y `ClientRouter` |
| Panel | Sin límite estricto | Se carga solo para el dueño; las librerías pesadas (`heic2any`, recortador) con carga diferida |

## 3. Imágenes

**Tamaños por uso** (versiones que genera el panel, `12 §3`):

| Dónde | `sizes` | Versiones |
|---|---|---|
| Tarjeta del catálogo | `(max-width: 760px) 50vw, 300px` | 400, 800 |
| Galería del producto | `(max-width: 760px) 100vw, 640px` | 400, 800, 1200 |
| Miniaturas de la galería | `80px` | 400 |
| Hero escritorio | `100vw` | 1200, 2400 |
| Hero celular | `100vw` | 600, 1200 |
| Al compartir | — | `og.jpg` 1200 × 630 |

**Reglas**
- Siempre `width` y `height` (o `aspect-ratio`) para que no salte el diseño.
- `loading="lazy"` en todo salvo la imagen principal de la página (hero en el inicio, primera foto en producto), que lleva `fetchpriority="high"` y **precarga** (`<link rel="preload" as="image" imagesrcset=…>`).
- WebP calidad 0.82. Una foto de producto de 800 px debería pesar 40–90 KB.
- Las fotos de marca de `assets/` (Q-404, ideas, portada por defecto, `og-default.jpg`, `apple-touch-icon.png`) se optimizan **antes del build** con `scripts/build-assets.mjs` (`sharp`, en Node) y quedan en `public/brand/` con varios anchos en WebP. No se usa `astro:assets` para optimizar: en Workers no hay `sharp` y las páginas que se arman en el servidor saldrían sin optimizar. El adaptador se configura con `imageService: 'passthrough'` (se registra). `pnpm build` corre `build-assets` primero.
- Video: `preload="none"`, portada propia, MP4 H.264 ≤ 8 MB para 30 s.

## 4. Fuente

Geist variable servida desde el sitio, `font-display: swap`, precarga del archivo `woff2` latino. Un solo archivo.

## 5. Servidor

- Cada página pública hace **una o dos consultas** a D1 (las de `10 §2`); nada de consultas por cada tarjeta.
- Índices de `09 §2`.
- Prueba de rendimiento: con 200 productos de prueba, `/catalogo` responde en < 400 ms en local (Vitest + `wrangler dev`) y Lighthouse sigue ≥ 90.

## 6. Límites

| Cosa | Límite |
|---|---|
| Fotos por producto | 10 |
| Portadas | 6 |
| Original subido | 25 MB (antes de procesar) |
| Versión subida | 2 MB |
| Nombre | 80 caracteres |
| Frase corta | 120 |
| Descripción | 2 000 |
| Productos | Sin límite práctico (probado con 200) |

## 7. Pruebas

- `pnpm size` en CI.
- Lighthouse CI (`lighthouserc.json`) contra el build local con la semilla, en `/`, `/catalogo`, `/producto/llaveros-con-nombre`, con las metas de §1 como aserciones.
- Playwright verifica que la imagen principal tiene `fetchpriority="high"` y que el resto es `lazy`.
