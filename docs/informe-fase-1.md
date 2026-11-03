# Informe de la fase 1

## Resumen
El proyecto Astro (islas de React, Tailwind 4, Geist, tokens del diseño) corre en local con `pnpm dev` y D1 y R2 simulados, y tiene `/` con el header y el footer del mockup y el contenido provisional "En construcción" con Q-404. Las herramientas de calidad (lint con fronteras, pruebas, `pnpm security`, `pnpm size`, Playwright en 390/820/1440, axe y Lighthouse CI) están en verde en local. **Falta el despliegue real a `*.workers.dev` por falta de credenciales de Cloudflare**, y el CI de GitHub no pudo arrancar por un bloqueo de facturación de la cuenta (ver "Bloqueado").

## Pasos
| Paso | Estado | Commit | Notas |
|---|---|---|---|
| 1.1 Crear el proyecto | Listo | `87541f4` | Astro 7.4.5, adaptador de Cloudflare, React, Tailwind, alias `@/`. `pnpm dev`, `build` y `preview` funcionan. Versiones en `decisiones.md`. TypeScript 6 (el 7 aún no lo soporta `@astrojs/check`) |
| 1.2 Herramientas de calidad | Listo | `5eedc84` | ESLint con fronteras y reglas de seguridad; la prueba negativa (4 archivos en `tests/negative/`) falla como debe |
| 1.3 Diseño base | Listo | `dc5c3a5` | Tokens, Geist (latino, 29 KB), `Button` (React y Astro), `Logo`, `Picture`, `build-assets`, `/dev/ui` (404 en producción). shadcn escrito a mano: el registro está bloqueado en este entorno |
| 1.4 Layout, header y footer | Listo | `cbc6f8b` | Igual al mockup en 390/820/1440; footer con nombre gigante al ancho exacto (lo piden los documentos) |
| 1.5 Cabeceras de seguridad | Listo | `97a6b13` | CSP integrada de Astro (como cabecera, con hashes) + middleware con el resto |
| 1.6 D1 y R2 en local | Listo | `0f2d68f` | Drizzle, `settings`, `storage.ts`, ruta `/img` solo en desarrollo, migraciones, pruebas en el runtime de Workers |
| 1.7 CI y despliegue | **CI escrito; despliegue bloqueado por credenciales** | `9245f14` | `wrangler deploy --dry-run` pasa; el job de despliegue se salta solo sin credenciales |

## Pruebas
- **Unitarias y de servidor:** 12 pruebas de Vitest (4 en Node, 8 en el runtime de Workers con D1 y R2 locales). Cobertura de `src/server/`: 96.9 % de sentencias (meta 80 %). `src/lib/` solo tiene `cn.ts` (con prueba); las funciones de negocio llegan en la fase 2.
- **Seguridad:** `pnpm security` 4/4 (audit sin vulnerabilidades, ESLint con reglas de seguridad, las 4 pruebas negativas fallan como deben, `tests/security/` en Playwright). `gitleaks` no está instalado en este entorno: se omite en local y el CI lo exige (**no se ejecutó aquí**).
- **Playwright (21 pruebas = 7 × 3 anchos), todas pasan:** a11y con axe, layout de header y footer, enlace "Ir al contenido", cabeceras de seguridad y CSP sin errores de consola, `/img` y `/dev/ui` con 404 en producción.
- **Rendimiento:** `pnpm size` Inicio 5.5 KB (meta 90 KB). Lighthouse en modo celular de `/`: rendimiento 100, accesibilidad 100, buenas prácticas 100, SEO 100; LCP 1.4 s, CLS 0.
- **CI de GitHub:** no corrió (ver "Bloqueado"). Se ejecutaron en local los mismos comandos que el workflow.

## Comparación con el mockup
| Página / sección | 390 | 820 | 1440 |
|---|---|---|---|
| Header | igual | igual | igual (pestaña de 352 px y no 360: el archivo de Geist de Fontsource tiene métricas apenas distintas; el logo se ve siempre porque aún no hay hero) |
| Footer | igual + nombre gigante | igual + nombre gigante | igual + nombre gigante (el mockup no lo trae; mandan `03`, `04 §2.9` y `11 §2`) |

## Decisiones tomadas
Todas en `docs/decisiones.md`, entradas "Fase 1 · Paso 1.1" a "1.7". Las que más importan: TypeScript 6 en lugar de 7; CSP integrada de Astro mandada como cabecera (con riesgo anotado para las View Transitions en las fases 3–4); `.dev.vars.local` con `CLOUDFLARE_ENV=local` en lugar de `.dev.vars` (si no, un build de producción en local se comporta como desarrollo); `@cloudflare/vitest-plugin` en lugar del paquete deprecado `vitest-pool-workers`; Geist de Fontsource (latino, 29 KB).

## Pendientes del dueño
Valores provisionales en uso (también en `progreso.md`): dominio `quickrobot.example`, WhatsApp `52XXXXXXXXXX`, Facebook `[tu página]`, Instagram `[@tu.usuario]`, fecha límite de Navidad 12 de diciembre, video sin archivo (`src: null`).

## Bloqueado o dudoso
1. **Despliegue a Cloudflare (paso 1.7).** Necesito: `CLOUDFLARE_ACCOUNT_ID` y un `CLOUDFLARE_API_TOKEN` (permisos de Workers Scripts, D1, R2 y KV en modo Edit) como *secrets* del repositorio en GitHub (Settings → Secrets and variables → Actions); crear la D1 `quick-robot-web` (`wrangler d1 create quick-robot-web`) y poner su `database_id` en `wrangler.jsonc`; crear el bucket R2 `quick-robot-photos`. Con eso, el siguiente push a `main` migra y despliega solo.
2. **CI de GitHub sin ejecutar:** el job no arranca porque *"your account is locked due to a billing issue"* (aviso de GitHub en la corrida de `fase-1`). Hay que resolver la facturación de la cuenta `bruno76n` en GitHub (Settings → Billing and plans). Después, volver a correr el workflow (Actions → CI → Re-run) para confirmar que queda en verde; el workflow usa `ubuntu-24.04`.
3. **`gitleaks`** nunca se ejecutó en este entorno; lo correrá el CI.
4. **Riesgo para la fase 3:** la CSP integrada de Astro declara no soportar `ClientRouter`; hay una prueba pendiente de navegación entre páginas con islas distintas y un plan B anotado.

## Cómo probarlo
```bash
pnpm install
pnpm dev            # http://localhost:4321 · crea .dev.vars.local y aplica migraciones a la D1 local
pnpm lint && pnpm typecheck && pnpm test && pnpm security
pnpm build && pnpm size && pnpm e2e      # e2e levanta el build en workerd
pnpm lhci
pnpm exec wrangler deploy --dry-run      # revisa el paquete sin publicarlo
```
Muestra de componentes (solo en desarrollo): `http://localhost:4321/dev/ui`.
