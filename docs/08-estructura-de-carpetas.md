# 08 · Estructura de carpetas

Un solo proyecto Astro (no monorepo). Repositorio propio, separado del sistema interno.

```
quick-robot-web/
├─ CLAUDE.md
├─ docs/                          esta documentación
│  └─ fases/                      un archivo por fase
├─ reference/                     NO se modifica
│  ├─ mockups/                    index, catalogo, producto, admin (.html)
│  ├─ seed-photos/                fotos de ejemplo por producto
│  └─ hero/                       portada por defecto (escritorio y celular)
├─ assets/                        marca: logo-cabeza.svg, q404/, ideas/
├─ astro.config.mjs               adaptador de Cloudflare, React, Tailwind, CSP (`13 §3`)
├─ wrangler.jsonc                 bindings: DB (D1), BUCKET (R2), variables
├─ drizzle.config.ts
├─ package.json, pnpm-lock.yaml, tsconfig.json, .nvmrc
├─ eslint.config.js, .prettierrc
├─ vitest.config.ts, playwright.config.ts, lighthouserc.json
├─ migrations/                    SQL generado por drizzle-kit
├─ scripts/
│  ├─ seed.ts                     carga la semilla en D1 local (y sube fotos a R2 local)
│  ├─ learn-import.ts             pnpm learn:import: content/aprende/ → D1 (`21 §8`); learn-files.ts lee los archivos
│  ├─ build-assets.mjs            versiones optimizadas de assets/ en public/brand/ (`15 §3`)
│  ├─ r2-orphans.ts               pnpm r2:orphans (`17 §5`)
│  ├─ security.mjs                pnpm security
│  └─ size-check.mjs              pnpm size (presupuestos de JS, `15 §2`)
├─ public/
│  ├─ favicon.svg                 cabeza de Q-404
│  ├─ brand/                      generado por build-assets.mjs: Q-404, ideas, portada por defecto,
│  │                              portada del video, og-default.jpg, apple-touch-icon.png (no se edita a mano)
│  └─ media/                      timelapse.mp4 (cuando exista)
├─ content/aprende/               contenido de Aprende (páginas .md, datos, fuentes, buscador; `content/aprende/README.md`)
├─ tests/fixtures/learn/          archivos chicos de prueba del importador
├─ e2e/                           pruebas de Playwright (flujos A–G de `04 §6`)
└─ src/
   ├─ pages/
   │  ├─ index.astro              inicio
   │  ├─ catalogo/index.astro
   │  ├─ catalogo/[categoria].astro
   │  ├─ producto/[slug].astro
   │  ├─ privacidad.astro
   │  ├─ 404.astro
   │  ├─ 500.astro
   │  ├─ admin/index.astro        isla del panel · productos
   │  ├─ admin/portada.astro       isla del panel · portada
   │  ├─ api/admin/upload.ts      subir versiones de una foto
   │  ├─ api/click.ts             contar toques a WhatsApp
   │  ├─ sitemap.xml.ts, robots.txt.ts   para buscadores (`14 §3`)
   │  └─ img/[...key].ts          SOLO en desarrollo: sirve fotos desde R2 local
   ├─ layouts/
   │  ├─ BaseLayout.astro         <head> (SEO, `14`), header, footer, ClientRouter
   │  ├─ LearnLayout.astro        Aprende: estilos (`src/styles/learn.css`), barra del buscador y scripts comunes
   │  └─ SystemLayout.astro       Para talleres: header que se va con el scroll, barra del producto, `system.css` y `system-ui.css`
   ├─ lib/learn/                  lógica pura de Aprende: markdown, content, import, fit, cost, heat, tables, glossary, fuzzy, search-docs (`21`, `22`)
   ├─ lib/system/                 lógica pura de Para talleres: visibility, plans, platform, bars, guard (`25 §5`, `§12`); en `lib/` también `nav.ts` (menú del sitio)
   ├─ scripts/                    scripts de navegador compartidos de Aprende: learn-search.ts (buscador), learn-printers.ts (¿Cabe mi pieza? e impresoras)
   ├─ components/
   │  ├─ learn/                   Aprende: Content, Node, Inline, Callout, Mark, PageHead, Article, TopicPages, Glossary, Search, Marked, tablas (FilamentTable, PrinterTable, MaintenanceCalendar), FitTool, CostCalculator, LearnScripts
   │  ├─ site/                    Header, Footer, Logo, ProductCard, Price, Breadcrumbs, Faqs (compartidas por Aprende y Para talleres)
   │  ├─ system/                  Para talleres: barra del producto, piezas de la página (`25 §6.2`) y `ui/` con las pantallas del sistema en HTML (`25 §6.3`)
   │  ├─ sections/                una por sección del inicio: Hero, Navidad, Ideas, Video,
   │  │                           Imprimiendo, Q404, Alberca, Pedido (Astro + su isla si hace falta)
   │  ├─ product/                 Gallery, ProductOptions (islas)
   │  ├─ catalog/                 CategoryTabs, NameCustomizer (isla 3D)
   │  ├─ admin/                   AdminApp, ProductList, ProductEditor, PhotoUploader,
   │  │                           PhotoCropper, HeroEditor, AdminShell
   │  ├─ ui/                      componentes de shadcn/ui
   │  └─ external/                componentes que da el dueño (`11 §4`) y su README
   ├─ actions/
   │  ├─ index.ts                 export const server = { admin: {...} }
   │  └─ admin/                   products.ts, hero.ts, backup.ts
   ├─ server/                     lo único que toca D1 y R2
   │  ├─ db/
   │  │  ├─ schema.ts             tablas (`09`)
   │  │  └─ client.ts             getDb(env)
   │  ├─ queries/                 lecturas: products.ts, hero.ts, clicks.ts, learn.ts
   │  ├─ learn-import.ts          escribe el plan del importador en D1 (y arma el SQL de --remote)
   │  ├─ search.ts                buscar en Aprende: Meilisearch con tiempo máximo, respaldo en D1, búsquedas sin resultado
   │  ├─ search-index.ts          índice de Meilisearch: ajustes, documentos y sincronización (`22 §4–6`)
   │  ├─ storage.ts               R2: getBucket, putObject, deleteByPrefix, photoUrl
│  ├─ clock.ts                 now() (con x-test-now fuera de producción, `10 §8`)
│  ├─ env.ts                   variables y secretos
   │  ├─ auth.ts                  requireAdmin (verifica el token de Access)
   │  └─ cleanup.ts               barrido de fotos pending
   ├─ lib/                        lógica pura con pruebas
   │  ├─ whatsapp.ts              armar mensajes y links (`05 §5`)
   │  ├─ money.ts                 centavos ↔ "$1,250"
   │  ├─ plural.ts
   │  ├─ publish.ts               reglas para publicar (`09 §3`)
   │  ├─ crop.ts                  recorte → versiones (`12 §3`)
   │  ├─ season.ts                temporada de Navidad, contador, posición en la línea
   │  ├─ schemas.ts               esquemas Zod compartidos (producto, portada)
│  ├─ result.ts                Result<T> de las acciones (`10 §3`)
   │  └─ *.test.ts
   ├─ config/
   │  ├─ site.ts                  dominio, WhatsApp, redes, fecha límite, imagen por defecto, `system` (`25 §4`)
   │  ├─ system.ts                Para talleres: `systemVisible`, módulos, fórmula, alertas, roles, comparación, plataformas
   │  ├─ system-demo.ts           Para talleres: datos de ejemplo de las pantallas del sistema (taller «Eje Z»)
   │  ├─ categories.ts
   │  ├─ colors.ts
   │  ├─ ideas.ts                 las 7 ideas (`05 §3`)
   │  └─ q404.ts                  combinaciones de color y sus renders
   ├─ i18n/
   │  └─ es.ts                    todos los textos
   ├─ styles/
   │  └─ global.css               Tailwind + tokens (`03 §2`)
   ├─ middleware.ts               cabeceras de seguridad (`13 §3`)
   └─ env.d.ts                    tipos de los bindings
```

## Convenciones de nombres

- Componentes: `PascalCase` (`ProductCard.astro`, `PhotoCropper.tsx`).
- Lógica y servidor: `kebab-case` o `camelCase` según el archivo (`whatsapp.ts`, `size-check.mjs`).
- Rutas en español porque son lo que ve la persona (`/catalogo`, `/producto`); todo lo demás en inglés.
- Tablas y columnas en inglés, `snake_case` (`products`, `price_from_cents`).

Más en `16`.
