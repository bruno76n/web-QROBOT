# Decisiones tomadas durante la construcción

Registro que llena Claude Code en modo autónomo. Una entrada por decisión. No se borra nada.

Formato:

```
## AAAA-MM-DD · Fase N · Paso N.N · Título corto
- Situación: qué no estaba claro o qué falló.
- Opciones consideradas.
- Decisión y por qué (qué regla de CLAUDE.md o qué documento la respalda).
- Impacto: archivos o documentos afectados.
```

También se registran aquí: versiones instaladas (fase 1), cada librería nueva que no esté en `06`, y cada componente externo integrado con sus dependencias.

---

## 2026-11-03 · Planeación · Decisiones previas a la construcción
Ver `01-idea-y-decisiones.md` (W1–W16). Resumen: muestrario sin tienda; proyecto aparte del sistema interno; Astro con islas de React; Cloudflare (Workers, D1, R2, Access); librerías para todo lo resuelto; componentes externos de 21st.dev con hueco reservado; fotos con original y recorte; construcción autónoma con un archivo por fase.

## 2026-11-03 · Fase 1 · Paso 1.1 · Versiones instaladas y base del proyecto
- Situación: `06` pide "la estable más reciente al empezar la fase 1".
- Versiones (resueltas el 2026-11-03): Node 22.23 (LTS, `.nvmrc` = 22), pnpm 10.28, astro 7.4.5, @astrojs/cloudflare 14.4.4, @astrojs/react 7.1.2, react / react-dom 19.3.1, tailwindcss y @tailwindcss/vite 4.3.4, wrangler 4.157.0, @astrojs/check 0.9.12.
- **TypeScript 6.0.3 y no 7.0.2.** TypeScript 7 (compilador nativo) aún no es compatible con `@astrojs/check` (peer `^5 || ^6`). Se vuelve a evaluar cuando lo soporte.
- Astro 7 con `@astrojs/cloudflare` genera `dist/server/wrangler.json` a partir de `wrangler.jsonc` y `astro preview` ya corre sobre workerd, así que `pnpm preview` = `astro preview` (hay que correr `pnpm build` antes).
- El adaptador agrega por defecto un binding KV `SESSION` para sesiones de Astro. No usamos sesiones; se deja como viene y se revisa en la fase 2 al configurar Access.
- `pnpm-workspace.yaml` aprueba los scripts de instalación de `esbuild`, `workerd` y `sharp` (pnpm 10 los bloquea por defecto).
- Impacto: `package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.jsonc`, `pnpm-workspace.yaml`, `.nvmrc`.

## 2026-11-03 · Fase 1 · Paso 1.2 · Herramientas de calidad
- Versiones: eslint 10.14, typescript-eslint 8.72, eslint-plugin-astro 3.2, eslint-plugin-react-hooks 7.1, eslint-plugin-jsx-a11y 6.10 (su peer declara hasta ESLint 9 pero funciona con 10; se vigila), prettier 3.9 (+ plugins de Astro y Tailwind), vitest 5.1, @playwright/test 1.64, @axe-core/playwright 4.14, @lhci/cli 0.16.
- **Prueba negativa por stdin:** los archivos de `tests/negative/` se lintean con `eslint --stdin --stdin-filename <ruta falsa>` (`scripts/lint-negative.mjs`) para que las reglas por carpeta (fronteras de `07 §6`) se apliquen como si el archivo viviera en `src/components/` o `src/lib/`. Cada uno debe disparar su regla; si no, `pnpm security` falla.
- **Fronteras en ESLint:** `drizzle-orm` y `cloudflare:workers` solo se importan desde `src/server/`, `scripts/`, pruebas y configs; `src/lib/` no importa Astro, React, Cloudflare ni `src/server`/`src/components`. `set:html` con `astro/no-set-html-directive`; `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval` y `new Function` con `no-restricted-syntax`.
- **`astro preview` en Astro 7 corre en segundo plano y guarda un lock.** Los scripts (`size`, Playwright, Lighthouse) lo arrancan con `--ignore-lock`. `pnpm size` y `lhci` levantan su propio servidor.
- **`pnpm size`** mide los `<script src>` y `modulepreload` de cada página (gzip), saltándose las páginas que aún no existen (404).
- **gitleaks** no está instalado en este entorno: `pnpm security` lo omite con aviso en local y lo exige en CI (`CI=true`).
- **Navegador de Playwright:** en entornos con Chromium preinstalado se pasa `PW_CHROMIUM_PATH`; si no, Playwright usa el suyo (`pnpm exec playwright install chromium`).
- **Vitest** con `passWithNoTests` hasta que existan las primeras pruebas (paso 1.6).
- Impacto: `eslint.config.js`, `.prettierrc`, `vitest.config.ts`, `playwright.config.ts`, `lighthouserc.json`, `scripts/*`, `tests/negative/*`, `e2e/*`.

## 2026-11-03 · Fase 1 · Paso 1.3 · Diseño base
- **Geist con `@fontsource-variable/geist` y no con `geist`:** el paquete `geist` trae un `woff2` variable de 69 KB con todos los alfabetos; el de Fontsource tiene el subconjunto latino separado (29 KB). `docs/15 §4` pide un solo archivo y `docs/06` permite ambos. `scripts/build-assets.mjs` lo copia a `public/fonts/geist-latin.woff2`; `@font-face` con `unicode-range` latino (cubre ñ, á, ¿, ¡) y `font-display: swap`. Versión: @fontsource-variable/geist 5.3.0.
- **shadcn/ui a mano:** el registro `ui.shadcn.com` no es accesible desde este entorno (403), así que no se pudo correr `shadcn init/add`. Se dejó `components.json` (para que `shadcn add` funcione después, con alias `@/lib/cn`) y `src/components/ui/button.tsx` escrito con el mismo patrón que genera shadcn (cva + Radix Slot), ajustado a los tokens. Dependencias: class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.0, lucide-react 1.67.0, @radix-ui/react-slot 1.5.0 (todas ya estaban en `06`).
- **Una sola fuente del aspecto del botón:** `ui/button-variants.ts` (cva) la usan el `Button` de React (islas) y `site/Button.astro` (HTML primero, sin JS). Variantes `black` y `green`, tamaños `default` (50 px) y `sm` (40 px), radio 8 px por el token `--radius-btn`; hay prueba de que nunca es `rounded-full`.
- **Logo:** `Logo.astro` importa `assets/logo-cabeza.svg` como componente (soporte nativo de SVG de Astro) en lugar de `set:html`, que está prohibido por lint.
- **Tokens:** variables CSS en `:root` (`03 §2`) y `@theme inline` de Tailwind 4 que apunta a ellas (`bg-ink`, `text-ink-2`, `border-line`, `bg-soft`, `text-purple`, `bg-green`, `rounded-btn`, `rounded-card`). Utilidades propias `wrap`, `vh`, `dl` (doble filete) y `lead`, con los mismos valores del mockup.
- **Assets generados:** `public/brand/`, `public/fonts/` y `public/favicon.svg` están en `.gitignore`; `pnpm dev`, `pnpm build` y `pnpm typecheck` corren `scripts/build-assets.mjs` primero (pnpm no ejecuta scripts `pre*` por defecto). Nunca se agranda una imagen: los anchos pedidos se recortan al del original (Q-404 530 px, ideas ≤ 480 px). `og-default.jpg` es provisional (Q-404 sobre `--soft`, sin texto, porque el texto SVG depende de fuentes del sistema); se revisa en la fase 3 (SEO).
- **`/dev/ui`** responde 404 fuera de desarrollo (verificado contra el build).
- Impacto: `src/styles/global.css`, `src/components/ui/*`, `src/components/site/{Button,Logo,Picture}.astro`, `src/pages/dev/ui.astro`, `scripts/build-assets.mjs`, `components.json`.

## 2026-11-03 · Fase 1 · Paso 1.4 · Layout, header y footer
- **Footer con nombre gigante aunque el mockup no lo tiene:** `03 §5`, `04 §2.9` y `11 §2` lo piden y `02 §1` dice que cuando documento y mockup no coinciden manda el documento. No cambia ningún comportamiento (solo se suma un bloque).
- **Ancho exacto sin JavaScript:** el contenedor `.footer-name` es `container-type: inline-size` y el `<span>` interior usa `font-size: calc(100cqw / 5.168)`. 5.168 es el ancho de "Quick Robot" a 1 em con Geist 600 e interletrado −0.068em, medido en el navegador. La prueba e2e verifica que el texto mide el ancho del contenedor (±2 px) en 390, 820 y 1440. Si cambia la fuente o el peso, hay que remedir. (`cqw` en el propio contenedor no funciona: toma el contenedor del ancestro; por eso hay dos elementos.)
- **Header sin hero todavía:** el `<script>` busca `[data-hero]` y, mientras esté visible, pone `data-over-hero` en el header (muestra "Impresión 3D · Guadalajara" en lugar del logo). Sin `data-hero` el logo siempre se ve. Arranca en `astro:page-load` y se limpia en `astro:before-swap` (regla 13).
- **Enlaces:** Navidad, Ideas, Q-404 y Cotizar apuntan a `/#navidad`, `/#ideas`, `/#q404`, `/#pedido` (`04 §1`); el logo, a `/`. `aria-current="page"` solo para rutas sin ancla (Catálogo).
- **Enlace "Ir al contenido":** se agregó (accesibilidad, `03 §7`); texto en `es.ts`. No está en el mockup.
- **`<html lang="es-MX">`** (pide la fase), aunque el mockup dice `es`.
- **Textos y datos:** todo en `src/i18n/es.ts`; el teléfono, redes y dominio en `src/config/site.ts` con los valores provisionales de `01` (también en `progreso.md`). Redes sin URL se pintan como texto.
- **Año del ©:** `new Date().getFullYear()` en el footer (la página se arma en cada visita).
- Impacto: `src/layouts/BaseLayout.astro`, `src/components/site/{Header,Footer}.astro`, `src/i18n/es.ts`, `src/config/site.ts`, `src/pages/index.astro`, `e2e/layout.spec.ts`.
