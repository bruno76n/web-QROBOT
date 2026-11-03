# Fase 3 · Catálogo y producto

**Objetivo:** las páginas públicas que muestran el catálogo con los datos del panel, el personalizador 3D, y todo lo necesario para que Google las encuentre y para que se vean bien al compartirlas.

**Al terminar existe:** `/catalogo`, `/catalogo/[categoria]`, `/producto/[slug]`, `/404`, `/500`, `/sitemap.xml` y `/robots.txt`, iguales al mockup, con los productos de la base, y los links de WhatsApp correctos.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-2.md` · este archivo.

---

## Pasos

### 3.1 Consultas públicas y `Picture`
- **Hacer:** consultas públicas de `10 §2` (`listPublishedProducts`, `getPublishedProduct`, `listRelated`); `Picture.astro` completo con `srcset`, `sizes`, prioridad y precarga.
- **Consultar:** `10 §2`, `15 §3`, `11 §2`.
- **Prueba:** un producto oculto no sale en ninguna consulta pública; el orden es `sort_order`.

### 3.2 Tarjeta y catálogo
- **Hacer:** `ProductCard.astro`, `CategoryTabs.astro`, páginas `/catalogo` y `/catalogo/[categoria]` (categoría desconocida → 404), aviso de precios, "¿No ves lo que buscas?", estado vacío.
- **Consultar:** `04 §3`, `05 §2` (Catálogo), `reference/mockups/catalogo.html`.
- **Listo cuando:** comparado con el mockup en 390, 820 y 1440.

### 3.3 Página de producto
- **Hacer:** `/producto/[slug]` con migas, `Gallery.tsx` (Embla), `ProductOptions.tsx` (color, personalización, cantidad, link), link base en HTML, ficha, descripción en párrafos, relacionados.
- **Consultar:** `04 §4`, `05 §2` (Producto), `05 §5`, `11 §3`, `reference/mockups/producto.html`.
- **Listo cuando:** flujo A pasa; sin JavaScript el link base funciona; comparado con el mockup.

### 3.4 Personalizador de nombre
- **Hacer:** `NameCustomizer.tsx` (isla ligera con controles, vista fija y link) y `NameCustomizer3D.tsx` (R3F + drei, se importa al tocar), formas, 7 colores, nombre en mayúsculas hasta 10 caracteres permitidos, giro con arrastre (y con teclado: flechas), respeta movimiento reducido (sin giro automático).
- **Consultar:** `04 §3` (punto 3), `05 §5`, `11 §3` (Personalizador), `15 §2`, `reference/mockups/catalogo.html`.
- **Listo cuando:** flujo C pasa; three no se descarga hasta tocar la vista (`pnpm size` y prueba de red en Playwright).

### 3.5 SEO y compartir
- **Hacer:** `<head>` completo en `BaseLayout` (`14 §1`), JSON-LD (`14 §2`), `/sitemap.xml` y `/robots.txt` del servidor (`14 §3`), `og-default.jpg` y `apple-touch-icon.png` (180 × 180) generados por `scripts/build-assets.mjs` a partir de `assets/` (`15 §3`), barra final y redirecciones (`14 §4`).
- **Consultar:** `14` completo.
- **Prueba:** flujo G; prueba que valida el JSON-LD de un producto contra el esperado; el panel tiene `noindex`.

### 3.6 Páginas de error
- **Hacer:** `/404` con Q-404 y `/500` (error del servidor) con sus textos.
- **Consultar:** `04 §5`, `04 §7`, `05 §2` (404 y error).

### 3.7 Rendimiento y accesibilidad de lo hecho
- **Hacer:** Lighthouse CI y axe sobre catálogo y producto; ajustar hasta cumplir.
- **Consultar:** `15 §1–3`, `11 §7`.

---

## No hacer en esta fase
- Secciones del inicio (fase 4). El inicio sigue provisional, pero el header ya enlaza al catálogo.
- Contador de toques (fase 5): los links de WhatsApp todavía no mandan beacon.

## Cierre
- Flujos A, C, D (completo), F y G pasan.
- Lighthouse ≥ metas de `15 §1` en catálogo y producto; `pnpm size` en verde.
- Comparación con el mockup en `progreso.md`.
- `docs/informe-fase-3.md`.
