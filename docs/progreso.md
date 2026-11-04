# Progreso

Lo actualiza Claude Code al terminar cada paso. Estados: **pendiente** · **en curso** · **igual al mockup** · **diferencia aceptada** (con motivo) · **bloqueado** (con motivo).

## Páginas y secciones

| Página / sección | Fase | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Header | 1 | igual al mockup | igual al mockup | igual al mockup | Alto 68 px, botón Cotizar 40 px, pestaña negra desde 901 px. La pestaña mide 352 px y no 360 (el archivo de Geist de Fontsource tiene métricas apenas distintas al de Google). Sin hero aún: muestra el logo; el cambio a "Impresión 3D · Guadalajara" está listo (`data-hero`) para la fase 4 |
| Footer | 1 | igual al mockup | igual al mockup | igual al mockup | Logo, WhatsApp, Facebook, Instagram y ©, como el mockup. Se suma el nombre gigante al ancho exacto que piden `03 §5`, `04 §2.9` y `11 §2` (el mockup no lo tiene; manda el documento, `02 §1`). Sin liga a privacidad hasta la fase 5 |
| Panel · Productos (lista) | 2 | pendiente | pendiente | pendiente | |
| Panel · Editor de producto | 2 | pendiente | pendiente | pendiente | |
| Panel · Fotos y recorte | 2 | pendiente | pendiente | pendiente | |
| Panel · Portada | 2 | pendiente | pendiente | pendiente | |
| Catálogo | 3 | pendiente | pendiente | pendiente | |
| Personalizador 3D | 3 | pendiente | pendiente | pendiente | |
| Producto | 3 | pendiente | pendiente | pendiente | |
| 404 y error | 3 | pendiente | pendiente | pendiente | |
| Inicio · Hero | 4 | pendiente | pendiente | pendiente | |
| Inicio · Navidad | 4 | pendiente | pendiente | pendiente | |
| Inicio · ¿Qué se te antoja? | 4 | pendiente | pendiente | pendiente | Componente externo |
| Inicio · Video | 4 | pendiente | pendiente | pendiente | |
| Inicio · Imprimiendo | 4 | pendiente | pendiente | pendiente | |
| Inicio · Q-404 | 4 | pendiente | pendiente | pendiente | |
| Inicio · Alberca | 4 | pendiente | pendiente | pendiente | |
| Inicio · Pedido | 4 | pendiente | pendiente | pendiente | |
| Aviso de privacidad | 5 | pendiente | pendiente | pendiente | Revisar con el dueño |

## Flujos (`04 §6`)

| Flujo | Fase | Estado |
|---|---|---|
| A · Pedir un producto | 3 | pendiente |
| B · Pedir desde una idea | 4 | pendiente |
| C · Nombre en 3D | 3 | pendiente |
| D · Subir un producto | 2–3 | pendiente |
| E · Cambiar la portada | 4 | pendiente |
| F · Ocultar y reordenar | 2–3 | pendiente |
| G · Compartir | 3 | pendiente |

## Componentes externos (`11 §4`)

| Componente | Estado | Notas |
|---|---|---|
| Interactive Hover Links (Ideas) | pendiente de entrega | |

## Valores provisionales en uso (`01 › Pendientes del dueño`)

| Dato | Valor provisional | Desde |
|---|---|---|
| Dominio | `https://quickrobot.example` | Fase 1 (`src/config/site.ts`) |
| Número de WhatsApp | `52XXXXXXXXXX` (se muestra `+52 [tu número]`) | Fase 1 |
| Facebook | `[tu página]` (texto, sin liga) | Fase 1 |
| Instagram | `[@tu.usuario]` (texto, sin liga) | Fase 1 |
| Fecha límite de Navidad | 12 de diciembre | Fase 1 |
| Video del timelapse | `src: null` | Fase 1 |

## Bloqueos

| Paso | Motivo | Qué se necesita |
|---|---|---|
| 2.3 Cloudflare Access | Sin credenciales de Cloudflare no se puede crear la aplicación de Access | En Cloudflare Zero Trust: aplicación autohospedada "Panel Quick Robot" con las rutas `/admin*`, `/_actions/admin.*` y `/api/admin/*`, política con el correo del dueño y sesión de 24 h. Luego `wrangler secret put ACCESS_AUD` (el *Application Audience tag*) y `wrangler secret put ADMIN_EMAILS`, y poner `ACCESS_TEAM_DOMAIN` en `wrangler.jsonc` (`quickrobot.cloudflareaccess.com`) |
| 1.7 CI de GitHub | El job no arranca: "your account is locked due to a billing issue" | Resolver la facturación de la cuenta `bruno76n` en GitHub y volver a correr el workflow |
| 1.7 Despliegue a `*.workers.dev` | Faltan credenciales de Cloudflare. El CI ya está listo y salta el despliegue sin ellas; `wrangler deploy --dry-run` pasa | (1) `CLOUDFLARE_ACCOUNT_ID`; (2) un `CLOUDFLARE_API_TOKEN` con permisos de Workers Scripts, D1 y R2 (Edit) y KV (Edit); ambos como *secrets* del repositorio en GitHub (Settings → Secrets and variables → Actions); (3) crear la D1 `quick-robot-web` (`wrangler d1 create quick-robot-web`) y pegar su `database_id` en `wrangler.jsonc`; (4) crear el bucket R2 `quick-robot-photos`. Detalle en `17 §1, §2, §6` |
