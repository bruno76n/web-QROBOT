# Progreso

Lo actualiza Claude Code al terminar cada paso. Estados: **pendiente** · **en curso** · **igual al mockup** · **diferencia aceptada** (con motivo) · **bloqueado** (con motivo).

## Páginas y secciones

| Página / sección | Fase | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Header | 1 | igual al mockup | igual al mockup | igual al mockup | Alto 68 px, botón Cotizar 40 px, pestaña negra desde 901 px. La pestaña mide 352 px y no 360 (el archivo de Geist de Fontsource tiene métricas apenas distintas al de Google). Sin hero aún: muestra el logo; el cambio a "Impresión 3D · Guadalajara" está listo (`data-hero`) para la fase 4 |
| Footer | 1 | igual al mockup | igual al mockup | igual al mockup | Logo, WhatsApp, Facebook, Instagram y ©, como el mockup. Se suma el nombre gigante al ancho exacto que piden `03 §5`, `04 §2.9` y `11 §2` (el mockup no lo tiene; manda el documento, `02 §1`). Sin liga a privacidad hasta la fase 5 |
| Panel · Productos (lista) | 2 | igual al mockup | igual al mockup | igual al mockup | Diferencias aceptadas: filas con precio y estado (como pide `12 §2`; el mockup agrega "· 1 foto"); colores de texto gris más oscuros para cumplir contraste AA (`#62626b` y `#6a6a73` en lugar de `#6b6b74` y `#9a9aa3`, `13`/`03 §7`); los avisos salen arriba y no abajo para no tapar la barra de guardar |
| Panel · Editor de producto | 2 | igual al mockup | igual al mockup | igual al mockup | Dirección con prefijo `/producto/` (no `producto.html#`, `02 §1`); contadores "55/120" en lugar de "55 / 110" (límite de `09`) |
| Panel · Fotos y recorte | 2 | igual al mockup | igual al mockup | igual al mockup | El recortador (react-easy-crop, zoom 1×–4×, pellizco, vista previa) es nuevo respecto al mockup (`12 §3–4`). Las fotos de ejemplo se ven chicas y con la insignia "Foto chica": es lo esperado (`09 §4`) |
| Panel · Portada | 2 | igual al mockup | igual al mockup | igual al mockup | En pantallas de menos de 860 px la miniatura de celular se queda visible (el mockup la ocultaba) para poder ver y cambiar esa foto desde el teléfono |
| Catálogo | 3 | igual al mockup | igual al mockup | igual al mockup | Diferencias aceptadas: pestañas son links reales (`/catalogo/negocio`…), sin contadores; las tarjetas no llevan "c/u" ni cantidad (`02 §1`) |
| Personalizador 3D | 3 | igual al mockup | igual al mockup | igual al mockup | La vista fija es SVG y la 3D (three + R3F) carga solo al tocarla; el mockup giraba capas CSS. Se agregaron botones ← → para girar sin arrastrar |
| Producto | 3 | igual al mockup | igual al mockup | igual al mockup | Migas con el nombre del producto al final; nota de precio sin la frase extra del mockup (el texto sale del campo del panel) |
| 404 y error | 3 | igual (sin mockup) | igual (sin mockup) | igual (sin mockup) | Q-404 de cuerpo completo, textos de `05 §2`, botones de `04 §5`; `/500` con "Intentar de nuevo". No hay mockup de estas páginas |
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
| A · Pedir un producto | 3 | pasa en Playwright (`e2e/flow-public.spec.ts`); falta el tramo Inicio → Catálogo (fase 4) |
| B · Pedir desde una idea | 4 | pendiente |
| C · Nombre en 3D | 3 | pasa en Playwright (mensaje exacto; three no se descarga hasta tocar la vista) |
| D · Subir un producto | 2–3 | pasa completo en Playwright: el producto subido aparece en el catálogo y en su página con la foto elegida |
| E · Cambiar la portada | 4 | pendiente |
| F · Ocultar y reordenar | 2–3 | pasa completo en Playwright: el oculto da 404 y no sale en el catálogo; el orden se refleja en el catálogo |
| G · Compartir | 3 | pasa en Playwright (etiquetas `og:`, precio, JSON-LD) |

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
