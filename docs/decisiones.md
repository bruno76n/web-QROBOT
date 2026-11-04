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
- **Navegador de Playwright:** `playwright.config.ts` usa `PW_CHROMIUM_PATH` o detecta el Chromium preinstalado en `/opt/pw-browsers`; si no hay, usa el propio de Playwright (`pnpm exec playwright install chromium`).
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

## 2026-11-03 · Fase 1 · Paso 1.5 · CSP y cabeceras de seguridad
- **CSP: función integrada de Astro (`security.csp`), disponible y estable en Astro 7.** No hace falta `scripts/csp-hashes.mjs`. Con el adaptador de Cloudflare en modo servidor, Astro manda la política como **cabecera** `Content-Security-Policy` (no como `<meta>`), con los hashes `sha256` de los scripts en línea (islas, `ClientRouter`, el script del header), así que `frame-ancestors 'none'` va dentro de la misma política (en cabecera sí funciona) y no hace falta una cabecera CSP aparte del middleware como decía `13 §3`.
- Política de la fase 1: `default-src 'self'; img-src 'self' data: blob:; media-src 'self'; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; script-src 'self' <hashes>; style-src 'self' 'unsafe-inline'` (sin hashes de estilos, `13 §3`). Todavía **no** se agregan `https://img.[dominio]` (fase 2, dominio de fotos) ni `static.cloudflareinsights.com` / `cloudflareinsights.com` (fase 5, Web Analytics); se suman cuando esas piezas existan.
- **Riesgo anotado para las fases 3–4:** la documentación de Astro dice que la CSP integrada "no soporta" las View Transitions (`ClientRouter`). En la fase 1 la página carga sin errores de CSP y `ClientRouter` funciona, pero al navegar entre páginas con islas distintas los hashes de la página inicial podrían no cubrir los scripts de la nueva. Se agrega una prueba de navegación entre páginas cuando existan dos páginas públicas (fase 3); si falla, plan B: `scripts/csp-hashes.mjs` que calcula la unión de hashes de todas las páginas.
- **Middleware (`src/middleware.ts`)** pone `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy` (con `camera=(self)` en `/admin*`) en las respuestas del Worker. Los archivos estáticos que sirve Cloudflare sin pasar por el Worker (`/_astro/*`, `/brand/*`, `/fonts/*`) no pasan por el middleware; si hiciera falta cabeceras ahí, se agrega `public/_headers` (se revisa en 1.7 con el despliegue real).
- Prueba: `tests/security/headers.spec.ts` (Playwright contra `pnpm preview`, en 390/820/1440): cabeceras exactas, CSP sin `unsafe-inline`/`unsafe-eval` en `script-src`, y cero errores de consola. Corre dentro de `pnpm security`.
- Impacto: `astro.config.mjs`, `src/middleware.ts`, `tests/security/headers.spec.ts`.

## 2026-11-03 · Fase 1 · Paso 1.6 · D1 y R2 en local
- **Versiones:** drizzle-orm 0.45.4, drizzle-kit 0.31.11, @cloudflare/workers-types 5.20261103.1, **@cloudflare/vitest-plugin 1.5.1** (hoy `@cloudflare/vitest-pool-workers` está deprecado y renombrado a este paquete; el viejo exigía vitest 4, el nuevo acepta vitest 5.1). Registrado porque `06` y `16 §4` nombran `@cloudflare/vitest-pool-workers`.
- **Pruebas de servidor** (`src/server/**/*.test.ts`, `src/actions/**/*.test.ts`) corren dentro del runtime de Workers con D1 y R2 de miniflare, como segundo "project" de Vitest (`server`); lo demás corre en Node (`unit`). Usan `wrangler.test.jsonc` (mismos bindings, sin el punto de entrada de Astro, que no se puede resolver fuera del build). **Mantener en sincronía con `wrangler.jsonc`.** `src/server/test-setup.ts` aplica las migraciones de `migrations/` antes de cada archivo. La base de cada archivo empieza limpia.
- **Variables:** `wrangler.jsonc` trae los valores **seguros de producción** (`APP_ENV=production`, `PUBLIC_IMG_BASE=https://img.quickrobot.example`, `ACCESS_TEAM_DOMAIN=""`). Para desarrollo, `pnpm dev` corre con `CLOUDFLARE_ENV=local` y lee `.dev.vars.local` (`APP_ENV=development`, `PUBLIC_IMG_BASE=/img`), que se crea solo desde `.dev.vars.example`. **No se usa `.dev.vars`** a propósito: `astro preview` y `wrangler dev` siempre lo leen y un build de producción en la máquina del desarrollador pasaría a "development" (se comprobó: `/img` respondía 200 en el build). Con `.dev.vars.local`, `pnpm preview` ve los valores de producción y `/img` responde 404, igual que en Cloudflare.
- **`pnpm dev`** (`scripts/dev.mjs`): `setup-local` (crea `.dev.vars.local`, aplica migraciones a la D1 local en `.wrangler/state`) → `build-assets` → `astro dev` con `CLOUDFLARE_ENV=local`. La semilla (`pnpm seed`) es de la fase 2.
- **`database_id` de D1** es un marcador (`0000…`) en `wrangler.jsonc`: el id real lo da `wrangler d1 create quick-robot-web` (paso 1.7 / `17`); el trabajo local no lo usa.
- **Tipos de los bindings:** `worker-configuration.d.ts` se genera con `pnpm cf-typegen` (`wrangler types --include-runtime=false --strict-vars=false`: sin los tipos de runtime, que chocan con los de DOM, y con las variables como `string`); los tipos de runtime vienen de `@cloudflare/workers-types` referenciado en `src/env.d.ts`. Hay que volver a correrlo al cambiar `wrangler.jsonc`.
- **Variables y bindings se leen con `import { env } from 'cloudflare:workers'`** (adaptador 14), envuelto en `src/server/env.ts`. `getAppEnv()` devuelve `production` si la variable falta o es desconocida.
- **Migraciones:** `drizzle-kit generate` produce SQL en `migrations/` y `wrangler d1 migrations apply DB --local` las aplica (`pnpm db:migrate`; `--remote` en producción, a mano). Primera migración: tabla `settings` (`key` PK, `value`).
- **Ruta `/img/[...key]`** delega en `src/server/images.ts` (`serveDevImage`): 404 si es producción, si la clave está vacía, empieza con `/` o contiene `..`. `Cache-Control: no-store` (solo desarrollo).
- **Pruebas:** `storage.test.ts` (sube a R2, lo lee por la ruta `/img`, borra por prefijo sin tocar al vecino, borra más de una página de 1 000 objetos, `photoUrl`, 404 en producción y con claves peligrosas), `db/settings.test.ts` (leer, escribir, upsert, `db.batch` junto y **rollback completo si una sentencia falla**) y `tests/security/dev-routes.spec.ts` (el build de producción responde 404 en `/img/*` y `/dev/ui`).
- Impacto: `wrangler.jsonc`, `wrangler.test.jsonc`, `drizzle.config.ts`, `migrations/`, `src/server/*`, `src/pages/img/[...key].ts`, `src/env.d.ts`, `vitest.config.ts`, `scripts/{dev,setup-local}.mjs`.

## 2026-11-03 · Fase 1 · Paso 1.7 · CI y despliegue
- **CI (`.github/workflows/ci.yml`):** en cada push y PR corre `lint`, `typecheck`, `test`, `security`, `build`, `size`, `lhci` y `e2e` (Node de `.nvmrc`, pnpm de `packageManager`, Chromium de Playwright, `gitleaks` 8.28.0 descargado del release porque `pnpm security` lo exige con `CI=true`). `17 §4` decía que `e2e` corre contra `pnpm dev`; aquí corre contra el **build de producción** (`pnpm build && pnpm preview`), porque las cabeceras, la CSP y `size` solo son reales ahí. Los flujos que necesiten `pnpm dev` (fase 2 en adelante, con sesión de administrador de desarrollo) lo arrancarán ellos mismos.
- **Despliegue:** job `deploy` solo en `main`, después de que pasen las pruebas: `wrangler d1 migrations apply quick-robot-web --remote` y luego `pnpm run deploy` (`wrangler deploy`; **`pnpm deploy` a secas es un comando propio de pnpm**, por eso `run`). **Sin `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` el job se salta con un aviso y el CI queda en verde**, como pide la fase. Está en el entorno `production` de GitHub.
- **`wrangler deploy --dry-run` funciona** (551 KiB de Worker, 48 archivos estáticos) con los bindings `DB`, `BUCKET`, `ASSETS`, `SESSION` y las variables de producción.
- **Lighthouse CI en modo celular** (el modo por defecto, como pide `15 §1`) con aserciones de error: rendimiento ≥ 0.9, accesibilidad ≥ 0.95, buenas prácticas ≥ 0.95, SEO = 1. Resultado local de `/`: 100 / 100 / 100 / 100, LCP 1.4 s, CLS 0. `startServerReadyPattern` apunta a "Preview server".
- **Bloqueado por credenciales (solo el despliegue real):** ver `progreso.md › Bloqueos` y el informe. Además de las credenciales, antes del primer despliegue hay que crear en Cloudflare la D1 `quick-robot-web` y el bucket `quick-robot-photos` (`17 §1`) y poner el `database_id` real en `wrangler.jsonc`; el binding KV `SESSION` que agrega el adaptador se crea solo con `wrangler deploy` (aprovisionamiento automático) pero se puede quitar si no se usan sesiones.

## 2026-11-04 · Fase 2 · Paso 2.1 · Esquema y migraciones
- Tablas de `09 §1` (sin `whatsapp_clicks`, fase 5): `products`, `product_categories`, `product_colors`, `photos`, `hero_slides` (+ `settings` de la fase 1) e índices de `09 §2`. Migración `0001_modern_sphinx.sql`.
- Fechas como milisegundos unix (`integer`, `mode: timestamp_ms`) con valor por defecto en SQL.
- `photos.owner_id` no tiene llave foránea (es polimórfico: producto o portada y nulo mientras está `pending`). `hero_slides` sí referencia `photos` (sin cascada: las fotos de una portada se borran en la acción, junto con R2).
- `photos.aspect`, `owner_type` y `status` son enumeraciones de TypeScript (texto en SQL).
- `categories.ts` y `colors.ts` exportan listas de ids tipadas para los esquemas Zod. Color "café" con id `cafe` (sin tilde, para ids estables).
- Prueba `schema.test.ts`: producto con categorías, colores y fotos; slug único; borrado en cascada; portada exige foto existente. Cada prueba filtra por sus propios ids (el almacenamiento se comparte dentro del archivo).

## 2026-11-04 · Fase 2 · Paso 2.2 · Lógica pura
- **Dependencias nuevas (ya en `06`):** zod 4.6.7 y @sindresorhus/slugify 4.0.0 (slug sin tildes ni ñ).
- `src/lib/` queda sin Astro, React ni Cloudflare (el lint lo exige): `money`, `plural`, `publish`, `crop`, `schemas`, `whatsapp`, `season`, `result`, `cn`. 66 pruebas, cobertura 100 % de líneas (meta 90 %), incluidos todos los casos obligatorios de `16 §4`.
- **Dinero:** `formatMoney` muestra pesos enteros ("$1,250") y centavos solo si existen; `parsePesos` acepta "$1,250", "50", "1250.5".
- **Recorte (`crop.ts`):** `widthsToGenerate` nunca agranda; `centerCrop` (4000×3000 en 1:1 → 3000×3000 en x=500); `ogLayout`; `cropVersion` = hash FNV-1a de 8 caracteres del recorte + un `nonce` que pasa quien llama (la función sigue pura; el servidor usa hora + aleatorio, `10 §4`).
- **Mensajes de WhatsApp:** además de lo escrito en `05 §5`, el color concuerda en género con la forma del personalizador ("una estrella negra", "un llavero negro"; `colorFor`). Decisión mía porque `05 §5` solo dice `{color}` y "una estrella negro" sería un error visible. El personalizador devuelve `null` sin nombre (botón desactivado).
- **Temporada:** `season.ts` usa `Intl` con la zona `America/Mexico_City`; como México ya no tiene horario de verano, la diferencia de relojes de pared es la diferencia real. Todas las funciones reciben `now`.
- **`uploadFieldsSchema`:** los campos de texto de `POST /api/admin/upload` (`kind`, `aspect`, recorte, tamaño del original, `widths` en JSON); los archivos viajan aparte (`10 §4`).
- **`Result<T>` y los 11 códigos** de `10 §5` en `result.ts`.
