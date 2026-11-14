# Continuar y probar en local

Estado (2026-11-14): **las 9 fases están construidas y en `main`** (`docs/informe-fase-1.md` … `informe-fase-9.md`). En producción está la web y el panel de las fases 1–5; **falta publicar Aprende (fases 6–8)**, y con el mismo despliegue sale Para talleres oculta (fase 9). **Lo pendiente, paso por paso, está en `docs/pendientes-en-local.md`.**

## Arrancar
```bash
pnpm install
pnpm dev          # http://localhost:4321/  · panel: /admin (sesión de desarrollo, solo con pnpm dev)
pnpm seed         # recarga la base local con los productos de ejemplo
pnpm learn:import # carga content/aprende/ (118 páginas) en la base local; pnpm dev lo hace solo si está vacía
```
Con `pnpm dev` también se ven `/admin/aprende` (editar Aprende) y **Para talleres** (`/talleres`, `/talleres/precios`, `/talleres/descargar`), que en producción responde 404 mientras `site.system.enabled` sea `false`.
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
| Para talleres: nombre, precios, dirección del sistema, descargas, interruptor | `site.system` en `src/config/site.ts` (encender: `docs/25 §13`) |
| Contenido de Aprende | `content/aprende/` (importador) o el panel `/admin/aprende` |

## Estado de la documentación
- `docs/progreso.md`: tabla página por página (390/820/1440), flujos A–G, bloqueos y valores provisionales.
- `docs/decisiones.md`: todo lo que no estaba escrito y se decidió, por fase.
- `docs/informe-fase-N.md`: resultado, pruebas y pendientes de cada fase.

## Para publicar
Aprende y lo demás que falta: `docs/pendientes-en-local.md` (sección 1). Los pasos de la primera publicación están en `docs/informe-fase-5.md`. Nunca semilla en producción, nunca `learn:import --overwrite` en producción.

## Bloqueos conocidos
- Aprende sin publicar: se publica desde la Mac (`pendientes-en-local.md`).
- WebKit (Safari) sin probar en la nube: se prueba en la Mac.
- GitHub Actions por facturación.
- HEIC real sin probar con un iPhone.
- `gitleaks` sin correr localmente.
