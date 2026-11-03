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
