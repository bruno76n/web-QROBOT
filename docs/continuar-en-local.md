# Continuar y probar en local

Estado: **las 5 fases están construidas** (`docs/informe-fase-1.md` … `informe-fase-5.md`). Lo único que falta para publicar son las credenciales de Cloudflare y el dominio (`informe-fase-5.md › Pendientes del dueño`).

## Arrancar
```bash
pnpm install
pnpm dev          # http://localhost:4321/  · panel: /admin (sesión de desarrollo, solo con pnpm dev)
pnpm seed         # recarga la base local con los productos de ejemplo
```
`pnpm dev` crea solo `.dev.vars.local` (de `.dev.vars.example`) con `APP_ENV=development` y fotos en `/img`. D1 y R2 son simulados por wrangler; no se toca producción.

## Probar
```bash
pnpm test                # Vitest: lógica pura y servidor (Workers, D1 y R2 locales)
pnpm lint && pnpm typecheck
pnpm security            # docs/13 §10 (gitleaks solo si está instalado)
pnpm build && pnpm size  # presupuestos de JS por página (docs/15 §2)
pnpm e2e                 # Playwright: público (390/820/1440) y luego panel + desarrollo
pnpm lhci                # Lighthouse en celular
pnpm preview             # el build de producción con workerd
```
Navidad en otra fecha (solo en desarrollo): `curl -H 'x-test-now: 2026-12-24T12:00:00-06:00' localhost:4321/`.

## Dónde cambiar cada dato (todavía provisionales)
| Dato | Archivo |
|---|---|
| Dominio, WhatsApp, Facebook, Instagram, fecha límite de Navidad, video, responsable y fecha del aviso de privacidad | `src/config/site.ts` |
| Todos los textos | `src/i18n/es.ts` |
| Alto del Q-404, precios y fotos | panel (`/admin`) |
| Componente externo de Ideas | `src/components/external/` |

## Estado de la documentación
- `docs/progreso.md`: tabla página por página (390/820/1440), flujos A–G, bloqueos y valores provisionales.
- `docs/decisiones.md`: todo lo que no estaba escrito y se decidió, por fase.
- `docs/informe-fase-N.md`: resultado, pruebas y pendientes de cada fase.

## Para publicar
Los comandos y los pasos manuales de después están en `docs/informe-fase-5.md` (secciones "Pasos para publicar" y "Pasos manuales después del lanzamiento"). Sin semilla en producción.

## Bloqueos conocidos
Cloudflare (despliegue, Access, dominio de fotos), GitHub Actions por facturación, HEIC real sin probar con un iPhone, `gitleaks` sin correr localmente.
