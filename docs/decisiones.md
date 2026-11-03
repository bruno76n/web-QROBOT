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
