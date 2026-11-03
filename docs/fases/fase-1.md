# Fase 1 · Base

**Objetivo:** el proyecto armado con todas sus herramientas, el diseño base (tokens, tipografía, header, footer) igual al mockup, D1 y R2 funcionando en local, y el sitio desplegado en Cloudflare desde el primer día.

**Al terminar existe:** una página `/` con el header y el footer del mockup y un contenido provisional ("En construcción" con Q-404), corriendo en local con `pnpm dev` y publicada en `*.workers.dev` (o lista para publicar si faltan credenciales). CI en verde.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/01` · `docs/06` · `docs/07` (§1, §2, §6) · `docs/08` · `docs/16` · este archivo.

---

## Pasos

### 1.1 Crear el proyecto
- **Hacer:** proyecto Astro con TypeScript estricto, pnpm, adaptador `@astrojs/cloudflare` (salida de servidor), `@astrojs/react`, Tailwind con `@tailwindcss/vite`, alias `@/`. `.nvmrc` con Node LTS. Copiar `reference/` y `assets/` tal como vienen.
- **Consultar:** `06 §1–2`, `08` (árbol completo).
- **Archivos:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.jsonc`, `.nvmrc`, `.gitignore`, `src/env.d.ts`.
- **Listo cuando:** `pnpm dev` y `pnpm build` funcionan; `pnpm preview` (wrangler) sirve el build. Versiones exactas anotadas en `docs/decisiones.md`.

### 1.2 Herramientas de calidad
- **Hacer:** ESLint (Astro, React hooks, jsx-a11y, `no-restricted-imports` con las fronteras de `07 §6`, `no-restricted-syntax` para `set:html`/`dangerouslySetInnerHTML`/`innerHTML`/`eval`), Prettier con plugins, Vitest, Playwright (tres anchos como proyectos: 390, 820, 1440), `@axe-core/playwright`, Lighthouse CI, `scripts/security.mjs`, `scripts/size-check.mjs`.
- **Consultar:** `16 §2, §4, §7`, `13 §10`, `15 §2`.
- **Archivos:** `eslint.config.js`, `.prettierrc`, `vitest.config.ts`, `playwright.config.ts`, `lighthouserc.json`, `scripts/security.mjs`, `scripts/size-check.mjs`.
- **Prueba negativa:** un archivo de ejemplo en `tests/negative/` que importa la base desde un componente y otro con `set:html` deben **romper** el lint (se excluyen del lint normal y se prueban con un script que espera el error).
- **Regla para todas las fases:** cada script y cada prueba corre sobre **lo que ya existe**. La lista de páginas a revisar (cabeceras, Lighthouse, axe, capturas) vive en `e2e/urls.ts` y crece en cada fase; `pnpm size` solo revisa los presupuestos de páginas que existen.
- **Listo cuando:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm security`, `pnpm size` corren en verde; la prueba negativa falla como debe.

### 1.3 Diseño base
- **Hacer:** tokens de `03 §2` en `src/styles/global.css` y en el tema de Tailwind; Geist servida desde el sitio con precarga; shadcn/ui inicializado y su tema ajustado (botones de 8 px, nunca redondos); `scripts/build-assets.mjs` (versiones de `assets/` en `public/brand/`); componentes `Logo`, `Button` (variantes negra y verde con flecha), `Picture` (todavía solo para imágenes de `public/brand/`). Página de muestra `src/pages/dev/ui.astro` que responde 404 fuera de desarrollo.
- **Consultar:** `03` completo, `11 §2`, `15 §3–4`, `10 §9`.
- **Archivos:** `src/styles/global.css`, `src/components/ui/*`, `src/components/site/Logo.astro`, `public/favicon.svg` (de `assets/logo-cabeza.svg`).
- **Listo cuando:** una página de muestra interna (`/dev/ui`, solo en desarrollo) enseña botones, tipografías y colores, y coinciden con el mockup.

### 1.4 Layout, header y footer
- **Hacer:** `BaseLayout.astro` (con `<head>` básico: título, descripción, `lang="es-MX"`, favicon; el SEO completo es de la fase 3), `Header.astro` (pestaña negra, Cotizar, cambio al pasar el hero listo para usarse en la fase 4), `Footer.astro` (nombre grande al ancho exacto), `ClientRouter`. Textos en `src/i18n/es.ts`; datos en `src/config/site.ts` con valores provisionales de `01`.
- **Consultar:** `03 §4`, `04 §1` (links del header), `05 §2` (header y footer), `11 §2`, `10 §6`.
- **Archivos:** `src/layouts/BaseLayout.astro`, `src/components/site/Header.astro`, `Footer.astro`, `src/i18n/es.ts`, `src/config/site.ts`, `src/pages/index.astro` (provisional).
- **Listo cuando:** captura en 390, 820 y 1440 comparada con `reference/mockups/index.html`: header y footer iguales en estructura, tamaños y textos. Fila en `progreso.md`.

### 1.5 Cabeceras de seguridad
- **Hacer:** `src/middleware.ts` con las cabeceras de `13 §3`. Decidir cómo se hace la CSP con hashes (función integrada de Astro si existe en la versión instalada) y registrar la decisión.
- **Consultar:** `13 §3`.
- **Prueba:** `tests/security/headers.spec.ts` contra `pnpm preview`.
- **Listo cuando:** la prueba pasa y la página carga sin errores de CSP en la consola.

### 1.6 D1 y R2 en local
- **Hacer:** bindings `DB` y `BUCKET` en `wrangler.jsonc`; Drizzle configurado (`drizzle.config.ts`, `src/server/db/client.ts`) con una tabla mínima de prueba (`settings`, de `09`); `src/server/storage.ts` con `getBucket`, `putObject`, `deleteByPrefix`, `photoUrl`; `src/server/env.ts`; la ruta de desarrollo `src/pages/img/[...key].ts`. Comandos `db:generate`, `db:migrate`.
- **Consultar:** `09` (reglas generales y `settings`), `10 §1`, `10 §8`.
- **Prueba:** `src/server/storage.test.ts` sube un archivo a R2 local, lo lee por `/img/...` y lo borra por prefijo; `settings` se lee y escribe en D1 local.
- **Listo cuando:** la prueba pasa y la ruta `/img` responde 404 en el build de producción.

### 1.7 CI y despliegue
- **Hacer:** `.github/workflows/ci.yml` (`17 §4`). Despliegue con `wrangler deploy`.
- **Consultar:** `17` completo.
- **Si faltan credenciales de Cloudflare** (`17 §6`): no detener la fase. Dejar CI corriendo todo menos el despliegue, anotar en el informe qué hace falta (cuenta, token, id de cuenta) y marcar este paso como "bloqueado por credenciales".
- **Listo cuando:** CI en verde; si hubo credenciales, la página responde en `*.workers.dev` con las cabeceras de `13 §3`.

---

## No hacer en esta fase
- Tablas de productos, fotos o portada (fase 2).
- Páginas de catálogo o producto (fase 3).
- Secciones del inicio (fase 4).
- Configurar Access, el dominio de fotos o Web Analytics (fases 2 y 5).

## Cierre
- `pnpm lint`, `typecheck`, `test`, `security`, `size`, `e2e` en verde.
- `docs/progreso.md` con la fila de header y footer.
- `docs/informe-fase-1.md` con la plantilla de `20`.
