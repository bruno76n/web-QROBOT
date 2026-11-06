# 17 · Despliegue

Todo en la cuenta de Cloudflare del dueño, donde ya está el dominio.

## 1. Lo que se crea en Cloudflare

| Recurso | Nombre | Notas |
|---|---|---|
| Worker | `quick-robot-web` | Astro con el adaptador de Cloudflare; sirve también los archivos estáticos |
| D1 | `quick-robot-web` | Base de producción |
| D1 | `quick-robot-web-preview` | Base del entorno de vista previa |
| R2 | `quick-robot-photos-preview` | Fotos del entorno de vista previa |
| R2 | `quick-robot-photos` | Fotos; dominio propio `img.[dominio]`, lectura pública |
| Access | Aplicación "Panel Quick Robot" | Rutas de `13 §2`; política: correos de `ADMIN_EMAILS` |
| Web Analytics | Sitio `[dominio]` | Sin cookies (`18`) |
| Rate Limiting (binding de Workers) | `CLICK_LIMITER`: 30 por 60 s | `13 §4`; se declara en `wrangler.jsonc` |
| Transform Rule | En `img.[dominio]`: agregar `X-Content-Type-Options: nosniff` | `13 §5` |
| Dominio | `[dominio]` y `www` → redirige a `[dominio]` | Ruta del Worker |

## 2. Variables y secretos

| Nombre | Tipo | Dónde | Ejemplo |
|---|---|---|---|
| `PUBLIC_IMG_BASE` | variable | `wrangler.jsonc` | `https://img.[dominio]` |
| `ACCESS_TEAM_DOMAIN` | variable | `wrangler.jsonc` | `quickrobot.cloudflareaccess.com` |
| `APP_ENV` | variable | `wrangler.jsonc` (por entorno) | `production` · `preview` |
| `ACCESS_AUD` | secreto | `wrangler secret put` | (de la app de Access) |
| `ADMIN_EMAILS` | secreto | `wrangler secret put` | `correo@ejemplo.com` |
| `CLOUDFLARE_API_TOKEN` | secreto | GitHub Actions | Token con permisos de Workers, D1 y R2 |
| `CLOUDFLARE_ACCOUNT_ID` | secreto | GitHub Actions | |

## 3. Entornos

| Entorno | Cómo | Base y fotos |
|---|---|---|
| Local | `pnpm dev` | D1 y R2 simulados por wrangler, con semilla |
| Vista previa | `wrangler deploy --env preview` en cada rama: es **otro Worker** (`quick-robot-web-preview`) con su propio bloque `env.preview` en `wrangler.jsonc` | Base y bucket de vista previa (**nunca** los de producción). No usar `wrangler versions upload`: comparte los bindings de producción |
| Producción | Al fusionar en `main`: CI aplica migraciones `--remote` y despliega | Producción |

**Orden al desplegar:** migraciones primero, después el código. Una migración nunca borra columnas en uso: primero se deja de usar en un despliegue y se borra en el siguiente.

## 4. CI (GitHub Actions)

`.github/workflows/ci.yml`:
1. En cada push: instalar (`--frozen-lockfile`), `lint`, `typecheck`, `test`, `security`, `build`, `size`, `lhci` contra el build local y `e2e` contra `pnpm dev` (`16 §4`).
2. En `main` (si todo pasó): `wrangler d1 migrations apply quick-robot-web --remote` y `wrangler deploy`.

## 5. Respaldo y recuperación

- **D1 Time Travel:** permite volver la base a cualquier minuto de los últimos días (`wrangler d1 time-travel restore`). El número de días depende del plan; se anota en el informe de la fase 5.
- **Respaldo manual:** "Descargar respaldo" en el panel (`09 §5`) y `wrangler d1 export` (comando `pnpm db:backup` que deja un `.sql` con fecha).
- **R2** es durable; no se respalda por separado. `pnpm r2:orphans` (fase 2) lista, y con `--delete` borra, (a) carpetas `ph/<id>/` sin fila en `photos` y (b) carpetas de versión `ph/<id>/<version>/` que no son la versión actual de su fila (re-centrados que no se guardaron).
- Se recomienda al dueño descargar un respaldo después de cada cambio grande del catálogo.

## 6. Lo que necesita del dueño (casos de parada)

Claude Code **no puede** crear la cuenta, el dominio ni los tokens. Cuando llegue a un paso que los necesita:
1. Se detiene **solo en ese paso**, escribe en el informe exactamente qué necesita (lista de §1 y §2) y cómo dárselo.
2. Sigue con todo lo que no depende de eso (todo funciona en local).

Pasos que dependen de Cloudflare: despliegue de la fase 1, aplicar Access, dominio de fotos y su Transform Rule, Web Analytics y el limitador en producción.

## 7. Costos esperados

Con el tráfico de un taller local, todo cabe en los planes gratis de Workers, D1, R2, Access (hasta 50 usuarios) y Web Analytics. Lo único que se paga es el dominio. Si algún día se pasa de los límites gratis de Workers, el plan de pago cuesta 5 USD al mes.

## 8. Lo que se creó de verdad (2026-11-06)

Cuenta de Cloudflare `bruno76n@gmail.com`; la zona `centerdiv.mx` ya estaba ahí (el dominio es de CenterDiv, esta web va en un subdominio).

| Recurso | Valor |
|---|---|
| Web | `https://quickrobot.centerdiv.mx` (`routes` con `custom_domain: true` en `wrangler.jsonc`; Cloudflare crea el DNS y el certificado solo) |
| Worker | `quick-robot-web` |
| D1 | `quick-robot-web`, `database_id` en `wrangler.jsonc`; migraciones 0000–0006 aplicadas con `--remote` |
| R2 | `quick-robot-photos`, dominio `fotos-quickrobot.centerdiv.mx` (lectura pública) |
| Access | App "Panel Quick Robot" con destinos `quickrobot.centerdiv.mx/admin`, `/api/admin` y `/_actions/admin.*`; política `dueño` (Allow, correo del dueño); login con código al correo |
| Variables | `PUBLIC_IMG_BASE` y `ACCESS_TEAM_DOMAIN` en `wrangler.jsonc`; secretos `ACCESS_AUD` y `ADMIN_EMAILS` con `wrangler secret put` |

- El host de fotos no es `img.<dominio>` (`§1`): el certificado gratis de Cloudflare solo cubre un nivel (`*.centerdiv.mx`), así que es `fotos-quickrobot.centerdiv.mx`. Está en `site.imgBase` (`src/config/site.ts`), que lee el CSP de `astro.config.mjs`.
- Al cambiar `database_id`, wrangler usa **otra base local** (el estado local va por id). Si `pnpm dev` aparece vacío, copiar el `.sqlite` viejo de `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/` sobre el nuevo.
- En la app de Access, cada destino lleva subdominio `quickrobot`, dominio `centerdiv.mx` y solo la ruta en Path. Un dominio repetido (`…centerdiv.mx.centerdiv.mx`) deja el panel sin proteger.
- Desplegar a mano: `pnpm build && pnpm exec wrangler deploy`. El CI de GitHub sigue pausado por facturación (`progreso.md`).
