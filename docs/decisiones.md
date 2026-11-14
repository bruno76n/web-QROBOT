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
- **Header sin hero todavía:** el `<script>` busca `[data-hero]` y, mientras esté visible, pone `data-over-hero` en el header (muestra "Visita nuestras redes:" y el botón a Instagram en lugar del logo). Sin `data-hero` el logo siempre se ve. Arranca en `astro:page-load` y se limpia en `astro:before-swap` (regla 13).
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

## 2026-11-04 · Fase 2 · Paso 2.3 · Entrar al panel
- **jose 6.2.15** para el token de Access (`Cf-Access-Jwt-Assertion`): firma con las llaves públicas del equipo (`createRemoteJWKSet` en caché por isolate), `iss`, `aud`, vencimiento y solo `RS256`. Si falta `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` o `ADMIN_EMAILS`, **falla cerrado** (nadie entra).
- **Dos archivos:** `auth-core.ts` (verifica, sin imports de Cloudflare, se prueba en Node con llaves generadas) y `auth.ts` (`requireAdmin`, `isAdminRequest`, lee el entorno). La sesión falsa de desarrollo (`import.meta.env.DEV`) vive solo en `auth.ts`, porque en Vitest `DEV` también es `true`.
- **Middleware:** toda petición a `/_actions/admin.*` y `/api/admin/*` pasa por `isAdminRequest` **antes** de `next()`, así que responde `401 {"ok":false,"code":"UNAUTHORIZED"}` también con entrada inválida; esas respuestas llevan `Cache-Control: no-store`. `/admin*` lleva `X-Robots-Tag: noindex, nofollow`. Los handlers vuelven a llamar `requireAdmin` (se agrega en 2.4 y 2.5).
- **Secretos** `ACCESS_AUD` y `ADMIN_EMAILS` declarados como opcionales en `src/env.d.ts` (no están en `wrangler.jsonc`).
- **Pruebas:** `tests/security/auth.test.ts` (válido; sin token; vencido; `aud`, `iss` y llave equivocados; token manipulado; `alg: none`; correo no permitido o ausente; sin configurar) y `tests/security/admin-routes.spec.ts` (401 con y sin token falso en 4 rutas, `noindex`, y que `dist/` no contiene la cadena de la sesión falsa).
- **Access en Cloudflare:** sin credenciales no se pudo crear la aplicación "Panel Quick Robot". Queda en `progreso.md › Bloqueos`.

## 2026-11-04 · Fase 2 · Paso 2.4 · Subida de fotos (servidor)
- **`POST /api/admin/upload`** (`src/pages/api/admin/upload.ts`): comprueba la sesión (`requireAdmin`, además del middleware), rechaza cuerpos de más de ~41 MB antes de leerlos y delega todo en `src/server/uploads.ts` (`runUpload`), porque solo `src/server/` puede tocar D1 y R2 (el lint lo exige). `handleUpload` recibe sus dependencias (base, bucket, reloj, generador de ids) para probarlo exacto.
- **Formato de la petición** (una foto por llamada): campos de texto (`kind`, `aspect`, `cropX/Y/Width/Height`, `originalWidth/Height`, `widths` en JSON, `photoId` solo al volver a centrar) y archivos `original` (solo foto nueva), `w<ancho>` por cada versión y `og` (solo producto). Respuesta: `{ ok: true, data: { photoId, version, widths, urls } }` o `{ ok: false, code, details? }` con el HTTP de `10 §5` (`10 §4` no fija si va envuelta en `data`; se usa la forma de `Result`).
- **Validación antes de tocar R2 o D1:** campos con Zod; forma coherente con el uso (`product` → 1:1, etc.); recorte dentro del original y con la proporción de su forma (±2 %); anchos **exactamente** los que `widthsToGenerate` da para ese recorte; tipo real por bytes iniciales (JPG, PNG, WEBP; SVG y todo lo demás → `FILE_TYPE` 415; el `Content-Type` declarado debe coincidir con los bytes); versiones solo WebP y `og.jpg` solo JPEG; límites 25 MB y 2 MB (`FILE_TOO_LARGE` 413).
- **`version`** = `cropVersion(recorte, "<hora>-<id aleatorio>")`. R2 con `Cache-Control: public, max-age=31536000, immutable`. Foto nueva → fila `pending` con su recorte, versión y anchos; **volver a centrar no toca la fila** (la aplica `saveProduct`/`saveHero`) y usa el tamaño del original guardado, no el que diga el cliente.
- **Fallo a la mitad:** se borra todo lo subido en esa llamada (el prefijo de la versión y, si la foto era nueva, todo `ph/<id>/`) y se relanza el error (la ruta responde `INTERNAL` con `errorId`).
- `putObject` ahora acepta `cacheControl`. `files.ts` guarda `sniffImageType` y los límites.
- **Vitest:** los archivos `tests/**/*.server.test.ts` corren en el proyecto `server` (runtime de Workers); el proyecto `unit` los excluye.
- **Pruebas** (`tests/security/upload.server.test.ts`, 19 casos): camino feliz (claves, tipos, `Cache-Control`, fila `pending`, URLs), recorte chico con una sola versión, portada sin `og`, `.jpg` que es PNG, PNG declarado como JPEG, SVG con tres tipos declarados, versión JPEG y `og` PNG, nada queda tras un rechazo, 26 MB y 2 MB+1, anchos que no corresponden, recorte fuera o de otra forma, archivos faltantes, campos basura, fallo en la 3.ª escritura a R2 (todo se borra, sin fila), y re-centrado (sin original, tamaño guardado manda, foto inexistente o de otro tipo).

## 2026-11-04 · Fase 2 · Paso 2.5 · Consultas y acciones
- **Estructura:** la lógica de cada acción vive en `src/server/admin/*.ts` (`saveProduct`, `setPublished`, `reorderProducts`, `duplicateProduct`, `deleteProduct`, `saveHero`, `resetHero`, `exportBackup`) y en `src/server/cleanup.ts`; reciben `AdminDeps` (db, bucket, reloj, generador de ids) y devuelven `Result<T>`. Las **acciones de Astro** (`src/actions/admin/*.ts`, expuestas como `admin.<nombre>`) son envoltorios delgados: `guard(context)` → servicio con `realDeps()`. Así los servicios se prueban en el runtime de Workers sin los módulos virtuales de Astro (`astro:actions`). Las consultas del panel están en `src/server/queries/{products,hero,photos}.ts`; los tipos que recibe el navegador, en `src/lib/admin-types.ts`.
- **Zod:** Astro 7 trae zod 4.6, la misma mayor que usamos; los esquemas de `src/lib/schemas.ts` se pasan tal cual como `input`.
- **Columna nueva `products.ever_published`** (migración `0002`): `09 §3` dice que el slug no sigue al nombre "si el producto ya estuvo publicado", y con solo `published` un producto ocultado después volvería a cambiar de slug. Se vuelve verdadera al publicar por primera vez y no se apaga.
- **Límites de fotos y portadas:** el esquema Zod los deja amplios a propósito (100 y 50) para que la regla de negocio responda `TOO_MANY_PHOTOS` (10) y `TOO_MANY_SLIDES` (6) como pide `10 §5`, en lugar de un `VALIDATION` genérico. Categorías y colores repetidos se rechazan en el esquema.
- **`saveProduct`:** un solo `db.batch` (producto, categorías, colores, fotos adjuntas con orden/alt, fotos quitadas); después, y solo si el batch salió bien, borra de R2 las fotos quitadas y las versiones viejas de las re-centradas. Un producto nuevo va **al final** del catálogo. Una foto `pending` la puede adoptar cualquiera con acceso al panel; una adjunta solo su dueño. Una foto re-centrada exige que sus versiones nuevas ya estén en R2. Las fotos sin cambio de versión conservan su recorte guardado (se ignora el que mande el cliente).
- **`reorderProducts`:** ids repetidos → `VALIDATION`; ids desconocidos se ignoran y los productos que no vengan en la lista quedan después en su orden actual (así un panel desactualizado no pierde productos nuevos).
- **`duplicateProduct`:** copia datos, categorías y colores (no fotos), nombre "… (copia)", sin publicar, al final; el slug sale del nombre ("…-copia", "…-copia-2").
- **`saveHero`:** reemplaza toda la portada en un `batch` (primero las portadas, luego las fotos quitadas, por las llaves foráneas); cada portada recibe un id nuevo. Las fotos de portada ya adjuntas se aceptan solo si están en la portada actual (`attachedIds`). El intervalo se guarda en `settings.hero_interval_seconds` (4, 6, 8 o 12; por defecto 6).
- **`cleanupPending`** borra primero las filas y luego R2; **`exportBackup`** devuelve `version: 1` con todas las tablas.
- **Pruebas (51 nuevas de servidor):** camino feliz, cada error de su fila de `10 §5`, que un `batch` que falla a la mitad no deja nada escrito (categorías repetidas rompen la llave primaria a mitad del batch), inyección y marcado como texto, 200 productos, reordenar, duplicar, borrar con sus fotos, re-centrar. Cobertura de `src/server/admin` 95 %, `queries` 97 %; las acciones y `auth.ts` (pegamento) se cubren con los flujos de Playwright del panel.

## 2026-11-04 · Fase 2 · Paso 2.6 · Semilla
- **`scripts/seed.ts` corre con Node directo** (Node 22.23 ejecuta TypeScript sin banderas; sin dependencia nueva como `tsx`), con imports relativos a `src/` (con `.ts`). Escribe en la D1 y el R2 **locales** con `getPlatformProxy()` de wrangler y `sharp` (dependencia de desarrollo ya instalada).
- **Procesamiento de fotos (igual que `12 §3`):** cada foto de ejemplo se centra sobre un cuadrado `--soft` del tamaño de su lado mayor (sin recortar), ese cuadrado se guarda como original (WebP calidad 90) con recorte completo; las versiones salen con `widthsToGenerate` (casi siempre una sola de su ancho, nunca agrandada) y `og.jpg` con `ogLayout`. La portada por defecto sube `hero-escritorio.webp` y `hero-celular.webp` (portada 1, intervalo 6 s). Resultado: 14 productos, 21 fotos (19 + 2 de portada), todos publicados y en el orden de la tabla de `05 §4`.
- **`pnpm seed`** aplica las migraciones locales y recarga todo desde cero. **`pnpm dev`** ejecuta `seed.ts --if-empty`: solo carga si no hay productos (no borra lo que se probó en el panel). **`--many`** genera 200 productos "Producto de prueba N" reutilizando las fotos (19.7 s).
- **Se niega a correr contra la remota:** sale con error si recibe `--remote`, `--prod` o `--production`, si `CLOUDFLARE_ENV` no es `local`, o si `wrangler.jsonc` declara algún binding con `"remote": true`. Comprobado a mano con `--remote` y con `CLOUDFLARE_ENV=production`.
- Datos en `scripts/seed-data.ts` (precios, textos, colores y categorías de `05 §4`); `tests/seed-data.test.ts` verifica el orden, los ids válidos, que existan las fotos y que los 4 "Más pedido" y los precios sean los de la tabla.

## 2026-11-04 · Fase 2 · Pasos 2.7–2.10 · Panel (estructura, editor, fotos, portada)
- **Una isla por página:** `/admin` y `/admin/portada` montan `AdminApp` con `client:only="react"` dentro de `AdminLayout.astro` (sin header ni footer públicos, `noindex`, solo `admin.css`). El panel carga sus librerías (TanStack Query, react-hook-form, dnd-kit, react-dropzone, react-easy-crop, sonner) solo ahí; `heic2any` se importa dinámicamente solo al recibir una foto HEIC (`15 §2`: el panel no tiene límite estricto).
- **Versiones nuevas (todas en `06`):** @tanstack/react-query 5.105, @dnd-kit/core 6.3 + sortable 10 + utilities 3.2, sonner 2.0, react-hook-form 7.91 + @hookform/resolvers 7.0, react-dropzone 20.1, react-easy-crop 6.2, browser-image-compression 2.0, heic2any 0.0.4.
- **CSS del panel:** `src/styles/admin.css` parte del CSS del mockup (`admin.html`) con sus clases, sin Tailwind, para quedar igual. Cambios deliberados: texto secundario `#62626b` / `#6a6a73` y rojo `#c42a20` (el mockup no pasa el contraste AA que axe exige); avisos (sonner) arriba y centrados para no tapar la barra de guardar; miniatura de celular de la portada visible en pantallas chicas.
- **Prettier y las clases:** `prettier-plugin-tailwindcss` quita el espacio inicial de cadenas como `` `ph${x ? ' drag' : ''}` `` dentro de `className`, rompiendo la clase. Regla del proyecto: **clases condicionales siempre con `cn()`** (`@/lib/cn`), nunca con plantillas de texto.
- **Lista de productos:** lista simple (`ul`/`li`) con un botón de asa y un botón por fila (no `listbox`/`option`: un botón dentro de una opción incumple `nested-interactive` de axe). La fila seleccionada se marca con `aria-current`. Arrastrar con `@dnd-kit/sortable`, también con teclado (Espacio, flechas, Espacio); se desactiva con búsqueda o filtro y se explica por qué; el reordenado es optimista y se guarda al soltar.
- **Selección en la URL** (`?p=<id>` o `?p=new`) con `history.pushState`. **Cambios sin guardar:** un almacén mínimo (`lib/dirty.ts`) + `beforeunload` + diálogo propio (`<dialog>` nativo, `ConfirmDialog`) al cambiar de producto o de pestaña.
- **Editor:** react-hook-form + el esquema Zod de `src/lib/product-form.ts` (mismos límites que el del servidor). La dirección sigue al nombre mientras el producto nunca se haya publicado y se manda **vacía** si no se tocó a mano (el servidor decide y evita choques); si ya estuvo publicado se avisa al cambiarla. El interruptor "Publicado" se apaga y dice qué falta (`09 §3`). Los colores se guardan en el orden en que se eligen (ese es el orden en que se muestran; no hay arrastre de colores).
- **Fotos:** `usePhotos` + `PhotoUploader` (dropzone, miniaturas ordenables, portada = primera, "Centrar", texto alternativo, quitar al guardar, progreso, error con "Reintentar", insignia "Foto chica"). Cadena en el navegador (`photos/pipeline.ts`): HEIC → JPG con `heic2any` (carga diferida), reducción a 4000 px con `browser-image-compression` (`useWebWorker: false`, por la CSP, `13 §5`), **re-codificación final en canvas a WebP** (aplica la orientación EXIF y elimina todos los metadatos, GPS incluido), recorte centrado automático, versiones y `og.jpg` con canvas, y subida por XHR con progreso.
- **Recortador:** `react-easy-crop` en un `<dialog>` a pantalla casi completa (completa en celular), zoom 1×–4×, parte del recorte guardado, vista previa en vivo (tarjeta del catálogo, o portada con el nombre y la franja rayada). El recorte se redondea a enteros y el servidor lo vuelve a validar.
- **Original para re-centrar:** si la foto se acaba de subir se usa el original en memoria; si está guardada se descarga de `GET /api/admin/photo/<id>` (solo administrador, mismo origen, sin CORS en el dominio de imágenes). Esa ruta entra en la protección `/api/admin/*`.
- **Testabilidad:** las miniaturas llevan `data-photo-id`, `data-version` y `data-crop` para que Playwright compruebe el recorte guardado sin depender del formato de respuesta de las acciones.
- **HEIC:** no hay forma práctica de generar un HEIC de muestra aquí. Se prueba (a) la detección por tipo o extensión con pruebas unitarias (`photo-files.test.ts`) y (b) el desvío con un simulacro: un archivo `.heic` con bytes de JPEG entra a `heic2any`, falla y la miniatura dice "No se subió · Esa foto no se puede usar…" (Playwright). La conversión real con una foto de iPhone queda pendiente de verificar a mano.
- **Portada:** `HeroEditor` (vista previa a escala con la franja rayada, lista ordenable con teclado, foto de celular opcional por portada, "Cambiar", "Centrar", "Quitar", intervalo 4/6/8/12, "Guardar portada", "Volver a la foto original" con confirmación). Una foto sustituida en "Cambiar" deja la anterior hasta guardar, y al guardar se borra (D1 y R2).
- **Pruebas del panel:** `playwright.admin.config.ts` (Chromium contra `pnpm dev`, un solo trabajador porque comparten la D1 y el R2 locales; cada archivo de pruebas vuelve a cargar la semilla; barra de desarrollo de Astro desactivada con `devToolbar.enabled = false`). `pnpm e2e` corre primero las pruebas públicas contra el build y luego las del panel. 16 flujos × 3 anchos: lista y filtros, editar y recargar, confirmación de cambios sin guardar, **flujo D** (producto nuevo con dos fotos, centrar, publicar), **centrar y comprobar `crop_*` y `version`, y que la versión vieja se borra de R2**, quitar foto, **flujo F** (ocultar y reordenar con teclado), duplicar y eliminar, fotos inválidas (SVG y "HEIC" falso), inyección de marcado, y toda la portada. axe sin errores serios en el panel.
- **Un commit por paso:** los pasos 2.7–2.10 se construyeron entrelazados (la isla importa el editor, las fotos y la portada), así que sus commits se separan por archivos y los intermedios no compilan solos; el último de la serie sí.

## 2026-11-04 · Fase 2 · Paso 2.11 · Respaldo
- **"Descargar respaldo"** en el menú ••• del panel llama `admin.exportBackup` y baja `quick-robot-respaldo-AAAA-MM-DD.json` (`version: 1`, todas las tablas, sin las fotos).
- **`pnpm db:backup`** (`scripts/db-backup.mjs`): `wrangler d1 export` a `backups/quick-robot-<local|remote>-<fecha>.sql` (`backups/` en `.gitignore`); local por defecto, `--remote` exporta producción (necesita credenciales).
- **`pnpm r2:orphans`** (`scripts/r2-orphans.ts`): lista y, con `--delete`, borra (a) carpetas `ph/<id>/` sin fila en `photos` y (b) carpetas de versión que no son la actual de su fila. Solo el bucket **local** (Node + `getPlatformProxy`); contra producción rechaza `--remote` (wrangler no lista objetos de R2; con credenciales se corre desde una máquina con acceso, o se agrega con la API S3 más adelante). Comprobado a mano con dos huérfanos creados con `wrangler r2 object put`.

## 2026-11-04 · Fase 3 · Catálogo, producto, personalizador, SEO y errores
- **Producto y personalizador sin React (contradicción entre `11 §3` y `15 §2`).** `11 §3` pedía islas React (`Gallery.tsx`, `ProductOptions.tsx`, `NameCustomizer.tsx`) y `15 §2` presupuestos de 70 KB (producto) y 25 KB (catálogo). Medido con `pnpm size` siguiendo los imports estáticos, solo `react-dom/client` pesa 64 KB comprimido (la versión React de la página de producto daba **98 KB**). Se decidió **HTML primero** (regla 3): `Gallery.astro` (con `embla-carousel`, sin el paquete de React), `ProductOptions.astro` y `NameMaker.astro`, cada uno con su `<script>` (arranca en `astro:page-load`, limpia en `astro:before-swap`). Resultado: producto 18 KB, catálogo 8.6 KB, inicio 5.5 KB, 404 5.5 KB. React queda para el panel y para la vista 3D, que se importa solo al tocar. `11 §3` y `15 §2` se actualizaron. `embla-carousel-react` se instaló y no se usa (se puede quitar).
- **`pnpm size`** ahora cuenta también `component-url` / `renderer-url` de las islas y los imports estáticos de cada archivo (antes solo contaba los `<script src>` y subestimaba). El presupuesto de 404 y privacidad es "0 KB de React" (≤ 8 KB en total: `ClientRouter` y el script del header).
- **Consultas públicas** (`src/server/queries/public.ts`): `listPublishedProducts`, `getPublishedProduct`, `listRelated`, `listSitemapProducts`. Un producto oculto no sale en ninguna (probado, incluidas relacionadas y cambios de estado). `src/lib/photos.ts` arma `src` y `srcset` solo con los anchos que existen en `photos.widths`. `Picture.astro` tiene dos modos: foto guardada (`photo` + `imgBase`) y de marca (`base` + `widths`); la imagen principal lleva `fetchpriority="high"` y precarga (`<link rel="preload" as="image" imagesrcset>` en el slot `head`).
- **404:** categoría desconocida y producto oculto o inexistente usan `Astro.rewrite('/404')`; `/404` y `/500` son páginas dinámicas (`noindex`, estado HTTP correcto, sin detalles técnicos).
- **Personalizador:** lógica en `src/lib/customizer.ts` (nombre en mayúsculas, solo A–Z, Ñ, acentos, Ü, 0–9 y espacio, hasta 10; colores y formas de `04 §3`) y mensajes de `whatsapp.ts` (el color concuerda en género: "una estrella negra"). Fuente 3D `geist-bold.typeface.json` (15 KB) generada con `opentype.js` desde Geist Bold (paquete `geist`, dependencia de desarrollo) por `scripts/build-font.mjs`; `pnpm build` la regenera. Se agregaron three 0.187, @react-three/fiber 9.8 y drei 10.7 (de `06`). En desarrollo, el módulo 3D se importa desde un `<script>` y no desde una isla, por lo que se simula el preámbulo de Fast Refresh de `@vitejs/plugin-react` (solo `import.meta.env.DEV`).
- **SEO (`14`):** `<head>` completo en `BaseLayout` (canonical, Open Graph, Twitter, precio del producto, `apple-touch-icon`), JSON-LD de `Product` (con `AggregateOffer`), `LocalBusiness` y `BreadcrumbList` generados por funciones puras de `src/lib/seo.ts` (con pruebas contra el JSON esperado), `/sitemap.xml` y `/robots.txt` del servidor. Los títulos son los de `14 §1`.
- **Excepción documentada a la regla 11 (`set:html`):** el JSON-LD se imprime con `set:html` **solo** a través de `jsonLdString()`, que escribe `<`, `>`, `&` y los separadores de línea como `\uXXXX` (prueba: un nombre con `</script><script>…` no puede cerrar la etiqueta ni abrir marcado y sigue siendo JSON válido). Astro no evalúa expresiones dentro de `<script type="application/ld+json">` y `set:text` escapa las comillas; la propia documentación de Astro usa `set:html` para esto. La línea lleva su `eslint-disable` con el motivo; las pruebas negativas de `set:html` siguen rompiendo el lint en cualquier otro lugar.
- **URLs sin barra final:** `trailingSlash: 'ignore'` más un 301 en el middleware (con `'never'` Astro responde 404 antes de que corra el middleware). Prueba: `/catalogo/` → 301 `/catalogo`.
- **CSP:** se agregó `https://img.<dominio de site.ts>` a `img-src` y `media-src` (`13 §3`), derivado de `site.domain` en `astro.config.mjs`. Hay que actualizarlo solo cambiando el dominio en `site.ts`. La navegación entre páginas con scripts distintos (catálogo → producto → catálogo) **no produce errores de CSP** con `ClientRouter` (prueba de Playwright), así que el riesgo anotado en la fase 1 queda descartado por ahora.
- **Pruebas públicas:** `e2e/flow-public.spec.ts` (flujos A, C, G, sin JavaScript, sitemap, robots, 301, 404 con Q-404, 500, navegación con CSP, prioridad y carga perezosa de imágenes). Como en el build de producción las fotos salen de `img.quickrobot.example` (no existe todavía), las pruebas contestan esas peticiones con una imagen mínima (`e2e/stub-images.ts`). El servidor de las pruebas públicas recarga la semilla antes de construir. `pnpm lhci` usa `scripts/lhci-server.mjs` (el build en workerd con `/img`).
- **Lighthouse (celular):** inicio, catálogo y producto 100 / 100 / 100 / 100 (rendimiento, accesibilidad, buenas prácticas, SEO); LCP 0.8–1.4 s; CLS 0.
- **Corregido de paso:** cuadrículas de producto y catálogo con `minmax(0,1fr)` (en 390 px la galería de Embla ensanchaba la columna y la página se desbordaba).

## 2026-11-04 · Fase 4 · Inicio
- **Orden de la página:** Hero → Navidad (solo en temporada) → ¿Qué se te antoja? → Video → Imprimiendo → Q-404 → Alberca → Pedido, cada una en `src/components/sections/` con su CSS (copiado del mockup) y su `<script>` que arranca en `astro:page-load` y limpia en `astro:before-swap`.
- **Hora del servidor:** `src/server/clock.ts` (`now(request)`) acepta `x-test-now` solo fuera de producción (`10 §8`). La temporada la decide el servidor (`isChristmasSeason`); el navegador solo hace correr el reloj. Pruebas: con la cabecera y `page.clock` en desarrollo (30 de septiembre → sin sección; 1 de octubre → con ella; 23 de diciembre 18:00 → 0 días 06 horas; 24 → "Hoy es Nochebuena."; 25 → sin sección) y, en el build de producción, que la cabecera **se ignora**. Las pruebas que necesitan fecha simulada o el panel viven en `e2e/dev-*.spec.ts` (servidor de desarrollo, config de Playwright del panel).
- **Hero:** `src/lib/hero.ts` (pura, con prueba) arma las diapositivas desde `getHero()` o la foto por defecto; la precarga (`<link rel="preload" imagesrcset>` para celular y escritorio) se pone en el slot `head` **de la página** (los slots no atraviesan componentes). `<source>` lleva `width`/`height` del celular: sin eso la proporción de la imagen cambiaba al cargar y el inicio tenía CLS 0.29. Varias portadas: `embla-carousel` + `embla-carousel-fade` + `embla-carousel-autoplay` en un `<script>` (sin React, `11 §3` pedía `HeroSlides.tsx`; por el presupuesto del inicio), con el intervalo del panel y sin autoplay con movimiento reducido. El nombre gigante usa `font-size: calc(100cqw / 6.2)` (ancho medido de "Quick Robot" + la cabeza). La frase de venta del mockup va como texto oculto (`04 §2.1`, `05 §2`).
- **Header sobre el hero:** el `<script>` del header ya observaba `[data-hero]`; ahora el `<h1>` lo lleva. Para que axe no mida texto a media transición, el logo y la frase pasan a `visibility` además de `opacity`.
- **¿Qué se te antoja?** `Ideas.astro` envuelve `HoverLinks` desde `src/components/external/index.ts` (regla 3 de `11 §4`). No hay archivo real: se creó `HoverLinks.placeholder.tsx` (lista de links con la foto a la derecha; en táctil, la foto de la fila más cercana a la mitad de la pantalla) y un `README.md`. Cada idea es un link a `#pedido=<id>`. Nombres en `#86868f` en vez de `#c9c9d0` (contraste 1.6:1 no pasa axe).
- **Links `#pedido=<id>`:** `#pedido=servilleteros` no es el id de ningún elemento (el navegador no se mueve) y con `ClientRouter` un clic en un link con `#` **no dispara `hashchange`**. `Pedido.astro` atiende esos clics: pone el hash, lanza `hashchange` a mano y baja a `#pedido` (suave salvo movimiento reducido); `OrderComposer` lee el hash al montarse y en cada `hashchange`.
- **Pedido:** `OrderComposer.tsx` (isla React `client:visible`) con `src/lib/order.ts` (pura, probada: `parseOrderHash`, mensajes de `05 §5`). Los huecos crecen midiendo el texto con canvas (`field-sizing: content` no está en todos los navegadores). Las opciones están en `src/config/order.ts`; las 7 ideas, en `src/config/ideas.ts`.
- **Imprimiendo:** `src/lib/print.ts` (progreso, capas de 640, minutos restantes; con prueba) y `scroll()` de `motion` para enterarse del scroll; con movimiento reducido la sección no se "activa" y el robot sale completo.
- **Q-404:** `src/config/q404.ts` (6 combinaciones); el precio y el alto salen de `getPublishedProduct('q-404')`.
- **Alberca:** física con `matter-js` 0.20 (`pit.ts`, solo al tocar el botón; el mockup tenía una a mano y la regla 2 de `CLAUDE.md` pide librería). Capa fija sin clics, el mouse empuja, Vaciar, Escape y vaciado a los pocos segundos; con movimiento reducido caen la mitad, ya amontonados, y se quita sola a los 4 s.
- **Video:** el póster es el hero por defecto solo redimensionado; el desenfoque lo hace CSS (el mockup lo hacía así). Sin `site.video.src` el botón queda deshabilitado con `aria-label` "todavía no hay video".
- **Rendimiento del inicio:** las secciones de abajo llevan `content-visibility: auto` (utilidad `cv`); con eso el inicio pasó de 67 a 98 en rendimiento (TBT 660 → 0 ms). Lighthouse celular: inicio 98 / 100 / 100 / 100, LCP 2.3 s, CLS 0; catálogo y producto 100. `pnpm size`: inicio 18.9 KB (las islas `client:visible` de más abajo no cuentan, como pide `15 §2`; `pnpm size` ahora lo respeta con `skipVisible`).
- **Dependencias nuevas (todas en `06`):** motion 14.9, matter-js 0.20 (+ @types/matter-js), embla-carousel-fade y embla-carousel-autoplay 8.6.

## 2026-11-04 · Fase 5 · Pasos 5.1 y 5.2 · Toques a WhatsApp y aviso de privacidad

- **Un solo oyente de clic** (`ClickBeacon.astro`, en `BaseLayout`) atiende cualquier elemento con `data-click="<source>"` (y `data-click-product`): los cuatro botones solo llevan atributos, sin script propio. Se agrega una vez al documento y sirve también tras las transiciones de vista (regla 13: no hay nada de la página que limpiar).
- **`/api/click`** responde `204` (contado), `400` (JSON, origen o producto inválido, o producto inexistente) o `429` (limitador). Un `productId` solo se acepta con `source = product` y viceversa. Cuerpo máximo de 512 bytes. El día se calcula en hora de Guadalajara. La IP solo es la llave del limitador (`CLICK_LIMITER`, 30 por 60 s; el binding es opcional en el código para no romper en local).
- **El panel** pide `admin.clickStats` (30 días) y lo muestra arriba de la lista y en cada fila (solo si el número es mayor que 0).
- **`/privacidad` no se prerenderiza** (`prerender = false`): es contenido fijo sin datos ni islas, pero los archivos que Cloudflare sirve directo de `dist` no pasan por el middleware y se quedarían sin las cabeceras de seguridad ni la CSP (`13 §3`). Que la sirva el Worker las conserva y evita además la redirección a `/privacidad/`. Los datos del responsable y la fecha viven en `site.ts` (`owner`, `privacyUpdated`), el texto en `es.privacy`.
- Presupuesto de JS de `/privacidad`: 8 KB, igual que la 404 (el `0` anterior no contaba con los scripts de cabecera).

## 2026-11-04 · Fase 5 · Paso 5.6 · Componente externo "Interactive Hover Links"

- El dueño entregó el componente (21st.dev). Vive en `src/components/external/InteractiveHoverLinks.tsx`; el reemplazo se borró. El envoltorio `components/sections/IdeasLinks.tsx` adapta las 7 ideas a sus props; `external/index.ts` sigue siendo el único punto de importación.
- **Dependencias:** `motion` y `lucide-react` ya estaban instaladas (no hubo que agregar nada). El proyecto no usa la carpeta `components/ui` de shadcn para esto: `docs/11 §4` manda los externos a `external/`.
- **Cambio obligatorio aplicado:** en táctil (`(hover: none)` o ≤ 760 px) la foto de la fila más cercana a la mitad de la pantalla se muestra al hacer scroll; con mouse queda como se entregó.
- **Cambios permitidos (`11 §4` reglas 1 y 5), anotados también en el encabezado del archivo:** sin datos de demostración (textos en inglés e imágenes de otro dominio rompían los textos en `es.ts` y la CSP), sin padding propio en la sección, `aria-label` en cada link (las letras en `span` separados hacían que el nombre fuera "S e r v…"), el título se parte por palabras (se cortaba a media palabra en 390 px), foto decorativa (`alt=""`) con carga diferida.
- **Colores:** el componente usa `background`, `foreground`, `muted` y `muted-foreground`; se mapean en `@theme` de `global.css` a los colores de la marca.
- **Tipografía:** el título de cada fila usa la de la web (Geist 600, tracking −0.04 em, como los h1–h3) en lugar de `font-bold`; el componente no trae fuente propia, hereda Geist.

## 2026-11-05 · Categorías editables desde el panel

- **Cambio de alcance pedido por el dueño:** las categorías dejan de ser una lista fija en `src/config/categories.ts` y pasan a la tabla `categories` (migración `0004`, con `negocio`, `casa` y `navidad` como semilla, mismos ids, así que productos y URLs existentes no cambian). Actualizados `docs/09` y `docs/12`.
- Lista plana, sin subcategorías. El `id` se genera del nombre (`categoryIdFromLabel`) y no cambia al renombrar, para no romper enlaces.
- `product_categories.category` no lleva clave foránea (SQLite no la agrega sin recrear la tabla): la existencia se valida en `saveProduct` (`UNKNOWN_CATEGORY`) y el borrado limpia los vínculos en un solo `db.batch`.
- **`navidad` es intocable** (`CHRISTMAS_CATEGORY`): la sección de temporada y su bloque en el home la consultan por id.
- Borrar se rechaza (`CATEGORY_IN_USE`) si deja a un producto publicado sin categorías, porque `docs/09 §3` exige al menos una para publicar.
- Nuevos códigos de error: `UNKNOWN_CATEGORY`, `CATEGORY_PROTECTED`, `CATEGORY_IN_USE`, `TOO_MANY_CATEGORIES` (máximo 30).
- El respaldo `.json` agrega `categoryList` (la tabla); `categories` sigue siendo los vínculos producto → categoría.
- Sin librerías nuevas: usa dnd-kit para el orden, como la lista de productos.

## 2026-11-05 · Subir fotos desde Safari: codificador WebP en WASM

- **Bug:** en Safari, `canvas.toBlob('image/webp')` no codifica WebP y devuelve un PNG. El servidor (`/api/admin/upload`) exige WebP en las versiones y respondía `415 FILE_TYPE`: el panel mostraba "Esa foto no se puede usar…" con cualquier foto (reproducido con WebKit de Playwright y `hero5-escritorio.png`).
- **Arreglo:** `canvasToBlob` (`photos/pipeline.ts`) detecta que el navegador no devolvió WebP y, solo entonces, carga `@jsquash/webp` (WASM) para codificarlo. En Chrome nada cambia. El servidor sigue exigiendo WebP real (se valida por los bytes).
- **Librería nueva:** `@jsquash/webp` (regla 2 de CLAUDE.md: no se escribe un codificador a mano).
- **CSP:** se agrega `'wasm-unsafe-eval'` a `script-src` (solo permite compilar WebAssembly, no `eval` de texto). Actualizado `docs/13 §3`.

## 2026-11-05 · Fotos de producto con márgenes (zoom hacia afuera)

- **Problema:** el recorte de producto es 1:1 y debía quedar dentro del original; una foto vertical (el muñeco de nieve) no podía mostrarse entera.
- **Decisión:** solo en productos, el recorte puede salir de la foto (`x`/`y` negativos, tamaño mayor al original). `isValidCrop(…, { allowPadding: true })` lo acepta si cubre parte de la foto y no pasa de 3× el lado largo; la portada sigue estricta. El original no se toca (regla 9); las versiones WebP salen con márgenes transparentes y `og.jpg` los rellena de `#f6f6f8`.
- **Panel:** el recortador de producto baja su zoom mínimo a `lado corto ÷ lado largo × 0.85` (foto completa con aire); con `restrictPosition` apagado. Los esquemas Zod (`cropSchema`, `uploadFieldsSchema`) aceptan coordenadas negativas; el servidor es quien valida contra el original.
- Nunca se agranda el contenido: alejar solo reduce la foto dentro del cuadro.

- **Safari y los márgenes:** Safari no dibuja nada con `drawImage` cuando el rectángulo de origen sale de la imagen (las versiones salían en blanco). `pipeline.ts` (`drawCrop`) recorta a los bordes de la foto y calcula el destino a mano, en versiones y `og.jpg`. Comprobado en Chrome y WebKit. Las fotos guardadas con la versión anterior en Safari quedaron en blanco: se arreglan con "Centrar" y guardar de nuevo.

## 2026-11-05 · Sin campo de dirección y "Tamaño a medida"

- **Dirección (slug) fuera del panel:** el campo no se podía usar de verdad (no dejaba cambiarla) y confundía. El panel siempre manda `slug: ''` y el servidor la genera del nombre; sigue las reglas de `docs/09 §3` (cambia con el nombre hasta la primera publicación y luego se queda fija). El servidor sigue aceptando un slug escrito (la API no cambia), pero ninguna pantalla lo usa.
- **Tamaño a medida:** nueva columna `products.custom_size` (migración `0005`, texto de hasta 120 caracteres, vacío por defecto). Campo "Tamaño a medida (a cotizar)" en "Página del producto"; si tiene texto, la página del producto lo muestra como fila "A medida" en la ficha. No cambia el mensaje de WhatsApp.

## 2026-11-05 · La dirección siempre sigue al nombre, con redirección

- **Antes:** la dirección se congelaba al publicar. Al reutilizar el producto "Búho" como "Mono de nieve", la dirección seguía siendo `/producto/buho`.
- **Ahora:** `slugForSave` regenera la dirección del nombre en cada guardado (un nombre sin letras usables conserva la actual). La anterior pasa a `product_slugs` (migración `0006`) y `/producto/<vieja>` responde `301` a la nueva (`findCurrentSlug`, solo si el producto está publicado). `takenSlugs` incluye las viejas de otros productos: nadie las puede tomar; volver a un nombre anterior libera esa dirección.
- Un slug escrito a mano por la API sigue ganando, pero el panel no lo ofrece. El respaldo `.json` agrega `slugHistory`.

## 2026-11-05 · Imágenes nuevas de "¿Qué se te antoja?"

- El dueño entregó fotos nuevas para las 7 ideas (asignadas por nombre: renos → Adornos de Navidad, monstruito naranja → Figuras, gato amarillo → Llaveros, vela 5 → Números de mesa, soporte QR R Motors → Porta QR, servilletero Oktoberfest → Servilleteros, Bulbasaur → Lo que se te ocurra). Reemplazan los archivos de `assets/ideas/` (pedido explícito del dueño; la regla de no tocar `assets/` es para el build autónomo).
- Se optimizaron igual que las anteriores: WebP con transparencia, lado largo máximo de 480 px (nunca agrandadas), calidad 82; entre 7 y 39 KB cada una. `build-assets.mjs` genera las versiones de 240 px y la mayor; `src/config/ideas.ts` lleva las medidas nuevas.
- La captura del monstruito traía fondo gris y sombra: se quitaron (gris poco saturado y claro → transparente) para que sea un recorte como los demás.
- Después se intercambiaron a pedido del dueño: Figuras usa el monstruito naranja y "Lo que se te ocurra" usa el Bulbasaur (se renombraron los archivos de `assets/ideas/` y se ajustaron las medidas en `ideas.ts`).

## 2026-11-05 · Panel pages also need the admin session

The middleware now answers `401` (plain text) for `/admin*` pages without a valid Access session, not only for the admin actions. Before, the empty panel shell was public (it could not read or write anything). Access still is the login screen; this is the second lock (docs/13 §2).

## 2026-11-06 · Primera publicación

- Sitio en `quickrobot.centerdiv.mx` (subdominio del dominio del dueño) y fotos en `fotos-quickrobot.centerdiv.mx`; motivo del host de fotos en `docs/17 §8`.
- El hero (2 diapositivas y su intervalo) se copió del R2/D1 local al de producción; los productos de local no se subieron.
- Acceso al panel con Cloudflare Access (código al correo). Desplegado a mano con `wrangler deploy`; el CI sigue pausado.
- Un token de API de Cloudflare se pegó en el chat para leer la app de Access; debe borrarse (no se guardó en el repo).

## Publicar sin categoría
La categoría ya no es requisito para publicar: el dueño decide. Solo se exigen nombre, foto y precio desde.

## 2026-11-08 · Foto y precio siguen siendo requisito para publicar
Se revierte "Publicar sin límites" (`e06d6da`): quitar el bloqueo de foto y precio dejaba publicar productos vacíos. Queda solo la excepción de la categoría (opcional). El interruptor "Publicado" vuelve a bloquearse en el panel y en el servidor (`CANNOT_PUBLISH`) si falta nombre, foto o precio desde.

## 2026-11-08 · Video del timelapse puesto, a 0.5×
- El dueño entregó el video (1280×720, H.264, 7.1 s, 1.6 MB). Vive en `public/media/timelapse.mp4` (`docs/08`); `site.video.src` apunta ahí. `media-src 'self'` de la CSP ya lo permite.
- **Cámara lenta sin recodificar:** la velocidad es `site.video.speed = 0.5` y `Video.astro` la aplica con `playbackRate` (y `defaultPlaybackRate`, porque cargar el `src` reinicia la velocidad). No hay ffmpeg en el proyecto; el archivo no se modifica. Quien descargue el video lo ve a velocidad normal.
- A 0.5× dura ~14 s: `durationLabel` pasa a `0:14` y "de video" a `14 s`. La entrada dice "en unos segundos" para no repetir el número.
- `printTime` sigue siendo el provisional `[3 h 40 min]` hasta que el dueño diga cuánto tardó esa impresión.

## 2026-11-08 · Video: solo el ícono de play
- Pedido del dueño tras ver la web publicada: encima del video no va nada más que el ícono de play. Se quitan la etiqueta "Timelapse", el texto "Dale play 0:14" del botón y los tres datos de abajo ("[3 h 40 min] de impresión", "14 s de video", "0.2 mm por capa"). Es una diferencia respecto al mockup (`docs/02 §1`); se actualizaron `03`, `04`, `05` y `10`.
- Se borran de `es.ts` los textos que ya nadie usa (`tag`, `play`, `printTime`, `videoLength*`, `layer*`) y de `site.ts` `durationLabel` y `printTime` (este último era el valor provisional `[3 h 40 min]`: ya no hay nada pendiente del dueño sobre el video). Quedan `playLabel` y `noVideo` como texto para lectores de pantalla.
- El ícono es el cuadrado blanco de antes, solo, un poco más grande (72–104 px). Sigue la portada desenfocada hasta que se toca.

## 2026-11-08 · Video: la portada es un cuadro del video
- El dueño vio la web publicada: al quitar los textos seguía la portada desenfocada y oscura de la foto del hero, que no tiene que ver con el video. Ahora la portada es el último cuadro del propio video (piezas terminadas), sin desenfoque, sin oscurecer y sin degradado: `public/media/timelapse-poster.webp` (1280×720, 61 KB; se sacó con `AVAssetImageGenerator`, no hay ffmpeg, y se pasó a WebP con `sharp`). También es el `poster` del `<video>`.
- Se borra de `scripts/build-assets.mjs` la generación de `video-poster-1200.webp` (nadie la usa). Corrige la decisión de la fase 4 (portada desenfocada con CSS).
- En celular (caja 4/5) el recorte se corre con `object-position: 55% 50%` para que las piezas queden a la vista.
- **Si se cambia el video, hay que sacar otra portada** y reemplazar ese archivo.

## 2026-11-10 · Sin personalizador de nombre en el catálogo
- Pedido del dueño: quitar del catálogo la sección donde se personaliza el llavero ("Escríbele su nombre."). Es una diferencia más con el mockup (`02 §1`) y sale del alcance (`01`).
- Se borran `NameMaker.astro`, `maker3d.tsx`, `src/lib/customizer.ts`, `customizerMessage`/`colorFor` de `whatsapp.ts`, los textos `es.maker`, `scripts/build-font.mjs` (fuente 3D) y las dependencias three, @react-three/fiber, @react-three/drei, three-stdlib, @types/three, geist y opentype.js. El flujo C de `04 §6` deja de existir.
- Se conserva el origen de clics `customizer` (esquema, `/api/click` y desglose del panel) porque puede haber toques guardados en D1; cambiarlo pediría migración.
- Si se quiere de vuelta, está en la historia de git antes de este commit.

## 2026-11-10 · Sin "Guadalajara" arriba ni al compartir
- Pedido del dueño: el texto del header sobre el hero pasa de "Impresión 3D · Guadalajara" a **"Visita nuestras redes:" + botón "Instagram"** (liga a `site.instagram.url`, otra pestaña; botón blanco con borde para no competir con "Cotizar"; en celular el texto queda arriba y el botón abajo). El título y la descripción al compartir el link (`<title>`, `og:title`, `og:description`, descripción de producto y de categoría) también quitan "Guadalajara". Es una diferencia más con el mockup (`02 §1`).
- La imagen al compartir (`og-default.jpg`) pasa a ser solo el logo (cabeza de Q-404, sin nombre) centrado sobre blanco, hecha del SVG en `scripts/build-assets.mjs`. Sin el nombre porque el texto SVG depende de fuentes del sistema (ver decisión de assets); el nombre ya sale en el título del link. Las páginas de producto siguen compartiendo la foto de su primer producto.
- **No se tocó:** el © del footer ("Impresión 3D en Guadalajara", no se pidió) ni el JSON-LD (`areaServed` y `addressLocality` "Guadalajara": no se ve y sirve a Google para búsquedas locales).
- WhatsApp y Facebook guardan la vista previa de cada link: para ver la nueva hay que pedirle al depurador de Facebook que vuelva a leerlo.
- **Footer (mismo día):** el dueño pidió quitarlo también del © del footer: "© {año} Quick Robot · Impresión 3D". Ya no queda "Guadalajara" en nada visible; solo en el JSON-LD (`areaServed`, `addressLocality`) y en la zona horaria de la temporada.

## 2026-11-13 · Plan de Aprende (lo decidió el dueño con Claude)
- **Qué:** sección `/aprende` de respuestas sobre impresión 3D, con buscador como pieza principal. No es foro: sin cuentas ni comentarios (`01`, `21`).
- **Contenido en D1, no en archivos de Astro:** el dueño lo quiere editar desde el panel, como los productos. La primera carga sale de `content/aprende/` con `pnpm learn:import`; lo editado en el panel no se sobrescribe (`21 §8`).
- **Markdown sin `set:html`:** se convierte a un árbol propio con lista blanca al importar o guardar y se pinta con componentes (`21 §5`). Convertir en cada visita gastaría CPU del Worker.
- **Meilisearch detrás del Worker:** el navegador busca en `/api/aprende/buscar`; la CSP no cambia, las llaves no salen al navegador y se cuentan las búsquedas sin resultado. Respaldo en D1 para local y para cuando Meilisearch falle (`22`).
- **Sin llamados al sistema (Quick Cerebro):** el sistema todavía no sale; sus llamados se guardan con `cta: system` y quedan ocultos con `site.system.enabled = false`.
- **Fases 6–8** con el mismo formato de las anteriores (`20`).

## 2026-11-13 · Fase 6: librerías de Aprende
- **mdast-util-from-markdown, micromark-extension-gfm, mdast-util-gfm:** convierten el Markdown a un árbol que se filtra con lista blanca (`21 §5`). Resuelven el Markdown y las tablas GFM sin escribir un analizador a mano (regla 2). Alternativas descartadas: `marked` y `markdown-it` producen HTML (obligaría a `set:html`).
- **@types/mdast:** solo tipos del árbol.
- **yaml:** lee el frontmatter de los archivos de `content/aprende/` (el importador, solo en Node).
- **meilisearch:** SDK oficial para el buscador (`22`); se usa desde la fase 7. Se instala ahora para dejar `package.json` completo.
- `pnpm audit --prod`: una vulnerabilidad moderada en `astro` que ya existía; ninguna alta ni crítica.
- `--lilac: #f1ecfd` agregado a los tokens (`03 §2`, `global.css`).

## 2026-11-13 · Fase 6: ajustes mínimos para que el contenido pase la validación
- `content/aprende/paginas/{filamentos/diametro,laminado/altura-de-capa,maquinas/boquillas}.md`: las etiquetas numéricas (`1.75`, `0.2`…) se entrecomillaron (`'1.75'`). YAML las leía como número y el esquema pide texto. El texto de las páginas no cambia.
- `datos/filamentos.json` no se tocó: el esquema (`src/lib/learn/content.ts`) acepta `null` en `hdtC`, `impactKjM2`, `stiffnessMpa`, `waterPct` y `maxSpeedMmS` (la fuente no da el dato; la tabla mostrará un guion) y `ams: 'dry'` (PVA/BVOH: solo con rollo seco).
- Ids estables: cada página guarda `learn-<slug con guiones>` (`learn-home` la portada) y cada pregunta `<id>-q<n>`; así local y producción comparten ids.
- `search_text` guarda tres líneas normalizadas (título · etiquetas · resto: subtítulo, resumen y preguntas) para ordenar la búsqueda en D1 sin otra columna.
- Las preguntas empiezan en `position = 1` (es el número de `#pregunta-N`).

## 2026-11-13 · Maquetas de todas las pantallas de Aprende y reglas de dispositivos
- 12 maquetas en `reference/mockups/aprende/`, generadas con el contenido de `content/aprende/` (reemplazan las 3 anteriores: `aprende.html`, `aprende-filamentos.html`, `aprende-pieza.html`).
- Reglas de celular, tableta, escritorio y navegadores en `docs/24`.
- **Safari:** el dueño pidió que los filtros funcionen en Chrome y en Safari, incluido Safari 14. Tailwind CSS 4 (toda la web) pide Safari 16.4 o más nuevo, así que el soporte completo es desde 16.4; los scripts de Aprende se escriben y compilan para que funcionen desde Safari 14 (`24 §4–5`). Nada de `requestIdleCallback` directo (Safari no lo tiene).
- Tabla de filamentos: el PETG pasa de «cerrada recomendada» a «mejor cerrada» (`enclosed-better`); el interruptor «Mi impresora es abierta» ya no lo oculta, porque Bambu Lab lo recomienda cerrado pero no desaconseja la impresora abierta (a diferencia de ABS, ASA, PC y nylon).

- `CLAUDE.md`: la regla de Safari entra como **17** (la 16 ya es la de código documentado).

## 2026-11-14 · Pruebas del panel estables (antes de la fase 7)
- Ordenar con el teclado, centrar la foto y volver a la lista esperaban tiempos fijos (250 ms) o revisaban una sola vez. Ahora esperan lo que se ve: la fila con la clase `drag` al levantarla, la fila de abajo que sube cuando dnd-kit toma el nuevo lugar (`moveDownWithKeyboard`), la foto nueva antes que la barra de progreso, y «Sin guardar» que desaparece antes de volver a la lista (`backToList`). Sin cambios en el panel.

## 2026-11-14 · Fase 7: páginas y buscador de Aprende
- **Estilos:** `src/styles/learn.css` sale de `_base.css` + `_aprende.css` de las maquetas, con cada regla dentro de `.learn` (el `<main>` de Aprende) para no tocar header, footer ni otras páginas. Los `style=""` de las maquetas pasan a clases (la CSP no permite estilos en línea nuevos).
- **Búsqueda en D1 con tolerancia a errores:** si las palabras no aparecen tal cual, se comparan con títulos y etiquetas con la misma tolerancia que Meilisearch (`src/lib/learn/fuzzy.ts`), para que «petj» encuentre PETG sin Meilisearch (flujo H en local). Se busca con `instr()` en lugar de `LIKE`: D1 limita los patrones de `LIKE` a 50 bytes. `22 §8` al día.
- **SDK de Meilisearch:** corre en el Worker con su opción `timeout` (1.5 s). El índice (`src/server/search-index.ts`) usa solo el esquema de la base, así los scripts lo corren en Node contra D1 local. La llave de escritura suma `indexes.get` (`22 §3`).
- **Meilisearch real no probado:** no hay Docker en este entorno y no se permite ejecutar el binario descargado. `syncLearnIndex` y el endpoint se prueban con un Meilisearch simulado; `pnpm learn:search-setup` queda sin probar. Hasta que el dueño elija dónde corre (`22 §2`), el buscador usa D1.
- **`learn:sync` y `--sync` solo en local:** la base de producción solo la lee el Worker; en producción el índice se actualiza desde el panel («Actualizar buscador», fase 8).
- **Pasos numerados:** una lista numerada cuyos puntos empiezan en negrita se pinta con el estilo de pasos de la maqueta (`.steps`).
- **Conteos y textos con número:** `es.ts` guarda formas `{ one, many }` con `{n}`; `countText`/`fillText` (`src/lib/learn/tables.ts`) las llenan en el servidor y en los scripts.
- **Header en celular chico:** con «Aprende» en el menú no cabe «Visita nuestras redes:» sobre la portada a ≤ 480 px; ahí solo queda el botón de Instagram (el header sigue de 56 px). `24 §3` al día.
- **`vite.build.target`:** sin `es2020` (Vite 7 lo rechaza junto a la lista de navegadores). El CSS no cambia: Tailwind 4 sigue pidiendo Safari 16.4 (`24 §4`).
- **WebKit:** el proyecto `webkit` de Playwright (iPhone 13, flujos H–L) se activa solo si WebKit está instalado; aquí no lo está y no se pueden instalar navegadores. Se corre en la Mac con `pnpm exec playwright install webkit` y `pnpm e2e`.
- **Pruebas de componentes Astro:** proyecto de Vitest `astro` (`vitest.astro.config.ts`, `getViteConfig`) para pintar componentes con la API de contenedor (prueba de inyección de `21 §14`).
- Diferencias con las maquetas en `21 §11`.

## 2026-11-13 · PLA y PETG (lo pidió el dueño)
- El PETG sirve para todo lo que sirve el PLA y aguanta más; el PLA no sirve para todo lo del PETG. Para figuras y decoración decide el precio. El PETG entra al filtro Decoración.

## 2026-11-13 · Plan de Para talleres (lo decidió el dueño con Claude)
- **Qué:** la página de venta del sistema para talleres (Quick Cerebro) dentro de la web: principal, precios y descargar (`25`). Más parecida a las páginas de sistemas de su tipo que la propuesta anterior: la app como protagonista (capturas reales del sistema), recorrido por pantallas, del archivo a la entrega, roles, planes con «¿Qué plan te toca?».
- **Oculta hasta que salga el sistema:** se construye y se publica, pero responde 404. Un solo interruptor (`site.system.enabled`); cerrojo en el middleware **y** en cada página (la ruta se compara decodificada, por `/%74alleres`); nunca prerender; sin ligas, sin sitemap y sin mención en `robots.txt` (un `Disallow` anunciaría la ruta). En `pnpm dev` se ve para construirla y probarla (`25 §2`).
- **Cuentas, registro, entrar y pagos viven en el sistema:** la web solo enlaza (`25 §1`). Las maquetas viejas de crear cuenta y entrar no se construyen aquí.
- **Nada duplicado:** la calculadora (con precio de venta para esta página), las preguntas y los tokens que usan Aprende y Para talleres pasan a piezas compartidas (`25 §6`). Las maquetas también comparten base: `reference/mockups/_base.css` y `_base.js` (las de Aprende se regeneraron con esa base y se ven igual, comprobado con capturas).
- **Sin doble filete** (líneas morada y verde) en Para talleres: el dueño lo pidió (`25 §7`).
- **Capturas:** de las maquetas del sistema, con un negocio de ejemplo («Eje Z») y piezas genéricas en lugar de personajes con licencia (`assets/talleres/`).

## 2026-11-14 · Fase 9 · Datos y textos de Para talleres
- **Guardia de encendido:** además de `https://` y no vacío, rechaza los dominios reservados para ejemplos (`.example`, `.test`, `.invalid`, `.localhost`). La dirección provisional (`sistema.quickrobot.example`) es `https://` y la habría dejado pasar; así no se puede encender sin la dirección real (`25 §12`).
- **Pruebas de los datos en `tests/system-data.test.ts`:** el proyecto `unit` de Vitest no lee `src/config/`; la guardia vive en `src/lib/system/guard.ts` (pura, con su prueba) y la prueba de los datos reales queda junto a la de la semilla.
- **Menú con tres ligas en 360 px:** con «Para talleres» (solo en `pnpm dev` mientras siga oculta) las ligas se encimaban con el logo. La maqueta lo resuelve aplastando el logo a 1 px; aquí, solo con tres ligas y ≤ 380 px, las ligas pierden relleno (4 px) y caben las tres junto al logo y Cotizar. Con dos ligas el header queda igual (`24 §3`).
- **Fila de la comparación «Pedidos con anticipo y saldo»:** id `advances` (la de «Ventas y pedidos al mes» es `orders`).

## 2026-11-14 · Fase 9 · Layout y piezas comunes de Para talleres
- **Nombre del plan a 22 px en las dos páginas:** en la maqueta de precios el nombre es un `h2` sin tamaño propio (sale a 27 px, el del navegador) y en la principal un `h3` de 22 px. Se usa 22 px en ambas; precios sigue con `h2` porque la banda no tiene título (`PlanBand headingLevel`).
- **Botones con `Button.astro`** (variantes `black`, `green`, `outline`, `outlineLight`) en lugar de la clase `.btn` de la maqueta: 1 px más de relleno por lado, el resto igual.
- **Header de la web en Para talleres:** el de toda la web (ligas en negritas, sin flecha en Cotizar, ancho completo), no el de la maqueta; la barra del producto sí es la de la maqueta.
- **`system.css` repite de `learn.css`** `.lead`, `.link` y el espacio de las secciones (cada uno con su prefijo, `.system` o `.learn`); se revisa al integrar la fase.

