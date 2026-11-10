# Progreso

Lo actualiza Claude Code al terminar cada paso. Estados: **pendiente** · **en curso** · **igual al mockup** · **diferencia aceptada** (con motivo) · **bloqueado** (con motivo).

## Páginas y secciones

| Página / sección | Fase | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Header | 1 | igual al mockup | igual al mockup | igual al mockup | Alto 68 px, botón Cotizar 40 px, pestaña negra desde 901 px. La pestaña mide 352 px y no 360 (el archivo de Geist de Fontsource tiene métricas apenas distintas al de Google). Sin hero aún: muestra el logo; el cambio a "Impresión 3D · Guadalajara" está listo (`data-hero`) para la fase 4 |
| Footer | 1 | igual al mockup | igual al mockup | igual al mockup | Logo, WhatsApp, Facebook, Instagram y ©, como el mockup. Se suma el nombre gigante al ancho exacto que piden `03 §5`, `04 §2.9` y `11 §2` (el mockup no lo tiene; manda el documento, `02 §1`). Con liga al aviso de privacidad (fase 5) |
| Panel · Productos (lista) | 2 | igual al mockup | igual al mockup | igual al mockup | Diferencias aceptadas: filas con precio y estado (como pide `12 §2`; el mockup agrega "· 1 foto"); colores de texto gris más oscuros para cumplir contraste AA (`#62626b` y `#6a6a73` en lugar de `#6b6b74` y `#9a9aa3`, `13`/`03 §7`); los avisos salen arriba y no abajo para no tapar la barra de guardar |
| Panel · Editor de producto | 2 | igual al mockup | igual al mockup | igual al mockup | Dirección con prefijo `/producto/` (no `producto.html#`, `02 §1`); contadores "55/120" en lugar de "55 / 110" (límite de `09`) |
| Panel · Fotos y recorte | 2 | igual al mockup | igual al mockup | igual al mockup | El recortador (react-easy-crop, zoom 1×–4×, pellizco, vista previa) es nuevo respecto al mockup (`12 §3–4`). Las fotos de ejemplo se ven chicas y con la insignia "Foto chica": es lo esperado (`09 §4`) |
| Panel · Portada | 2 | igual al mockup | igual al mockup | igual al mockup | En pantallas de menos de 860 px la miniatura de celular se queda visible (el mockup la ocultaba) para poder ver y cambiar esa foto desde el teléfono |
| Catálogo | 3 | igual al mockup | igual al mockup | igual al mockup | Diferencias aceptadas: pestañas son links reales (`/catalogo/negocio`…), sin contadores; las tarjetas no llevan "c/u" ni cantidad (`02 §1`) |
| ~~Personalizador 3D~~ | 3 | — | — | — | Quitado a pedido del dueño (2026-11-10) |
| Producto | 3 | igual al mockup | igual al mockup | igual al mockup | Migas con el nombre del producto al final; nota de precio sin la frase extra del mockup (el texto sale del campo del panel) |
| 404 y error | 3 | igual (sin mockup) | igual (sin mockup) | igual (sin mockup) | Q-404 de cuerpo completo, textos de `05 §2`, botones de `04 §5`; `/500` con "Intentar de nuevo". No hay mockup de estas páginas |
| Inicio · Hero | 4 | igual al mockup | igual al mockup | igual al mockup | Nombre en una línea al ancho exacto (`cqw`); la frase de venta del mockup va como texto oculto (`04 §2.1`, `05 §2`); varias fotos con Embla fade + autoplay (sin React) |
| Inicio · Navidad | 4 | igual al mockup | igual al mockup | igual al mockup | Las 4 tarjetas son productos reales (Navidad + "Más pedido") que abren su página (`02 §1`); solo del 1 de octubre al 24 de diciembre; el 24 dice "Hoy es Nochebuena." |
| Inicio · ¿Qué se te antoja? | 4 | igual | igual | igual | Componente real de 21st.dev integrado en la fase 5 (fotos de las filas con hover en escritorio; en táctil, la fila de la mitad de la pantalla). Ver `decisiones.md` |
| Inicio · Video | 4 | igual al mockup | igual al mockup | igual al mockup | Video entregado y puesto a 0.5× (`site.video`); sin `src` el botón queda deshabilitado con su `aria-label` |
| Inicio · Imprimiendo | 4 | igual al mockup | igual al mockup | igual al mockup | `scroll()` de `motion`; con movimiento reducido el robot sale completo |
| Inicio · Q-404 | 4 | igual al mockup | igual al mockup | igual al mockup | Precio y alto salen del producto `q-404` de la base ("mide [alto] cm" mientras el dueño no lo llene) |
| Inicio · Alberca | 4 | igual al mockup | igual al mockup | igual al mockup | Física con matter-js (el mockup tenía una a mano); se carga al tocar |
| Inicio · Pedido | 4 | igual al mockup | igual al mockup | igual al mockup | Isla React `OrderComposer` (`client:visible`); huecos que crecen medidos con canvas |
| Aviso de privacidad | 5 | hecho | hecho | hecho | **Revisar con el dueño**: faltan `[domicilio]` y `[correo]` (`site.ts › owner`) y que alguien que sepa de la LFPDPPP lo revise (`19`) |

## Flujos (`04 §6`)

| Flujo | Fase | Estado |
|---|---|---|
| A · Pedir un producto | 3 | pasa en Playwright (`e2e/flow-public.spec.ts`); falta el tramo Inicio → Catálogo (fase 4) |
| B · Pedir desde una idea | 4 | pasa en Playwright |
| ~~C · Nombre en 3D~~ | 3 | quitado con el personalizador (2026-11-10) |
| D · Subir un producto | 2–3 | pasa completo en Playwright: el producto subido aparece en el catálogo y en su página con la foto elegida |
| E · Cambiar la portada | 4 | pasa en Playwright (portada de escritorio en 1440 y de celular en 390) |
| F · Ocultar y reordenar | 2–3 | pasa completo en Playwright: el oculto da 404 y no sale en el catálogo; el orden se refleja en el catálogo |
| G · Compartir | 3 | pasa en Playwright (etiquetas `og:`, precio, JSON-LD) |

## Componentes externos (`11 §4`)

| Componente | Estado | Notas |
|---|---|---|
| Interactive Hover Links (Ideas) | **integrado** (fase 5, paso 5.6) | `src/components/external/InteractiveHoverLinks.tsx` con el cambio obligatorio aplicado |

## Fase 5

Terminada en local; ver `docs/informe-fase-5.md`. **Publicada el 2026-11-06 en https://quickrobot.centerdiv.mx** (ver `docs/17 §8`). Pendiente: productos reales en producción, datos reales del dueño, aviso de privacidad.

## Después de la fase 5 (2026-11-08)

Trabajo en local y en la nube (sesión de Claude Code en la web); se unió en `main` con un commit de fusión.

- **Publicar:** la categoría ya es opcional (`796bf77`). Se probó quitar también foto y precio (`e06d6da`) y se **revirtió** (`2a32dcc`): para publicar siguen haciendo falta nombre, foto y precio desde. Detalle en `decisiones.md`.
- **Video del timelapse:** puesto en `public/media/timelapse.mp4` y reproducido a 0.5× (`site.video`). Encima del video solo queda el ícono de play (sin etiqueta, textos ni datos).
- **Despliegues del día:** dos a mano (publicar con categoría opcional + video; luego video solo con el ícono de play). Todo en GitHub (`main`).
- **Despliegue:** a mano (`pnpm build && pnpm exec wrangler deploy`), sin migraciones nuevas (0000–0006). `pnpm security` en local falla en su paso de Playwright solo porque falta el Chromium (`pnpm exec playwright install chromium`).

## 2026-11-10

- **WhatsApp real:** `523481308678` (se muestra `+52 348 130 8678`) en `src/config/site.ts`.
- **Sin personalizador:** el dueño pidió quitar del catálogo la sección para personalizar el llavero ("Escríbele su nombre."). Se borran la sección, su lógica, sus textos, la fuente 3D y three/R3F/drei.
- Pruebas que seguían con valores viejos (dominio, host de fotos, `'wasm-unsafe-eval'`) leen ahora `site.ts`. Siguen en rojo en `pnpm e2e`, desde antes de este cambio: header de 56 px y menú (`layout.spec.ts`), video "sin archivo" (`flow-home.spec.ts`) y contraste de color en el inicio (`a11y.spec.ts`).

## Valores provisionales en uso (`01 › Pendientes del dueño`)

| Dato | Valor provisional | Desde |
|---|---|---|
| Dominio | `https://quickrobot.example` | Fase 1 (`src/config/site.ts`) |
| Facebook | `[tu página]` (texto, sin liga) | Fase 1 |
| Instagram | `[@tu.usuario]` (texto, sin liga) | Fase 1 |
| Fecha límite de Navidad | 12 de diciembre | Fase 1 |

## Bloqueos

| Paso | Motivo | Qué se necesita |
|---|---|---|
| 2.3 Cloudflare Access | Sin credenciales de Cloudflare no se puede crear la aplicación de Access | En Cloudflare Zero Trust: aplicación autohospedada "Panel Quick Robot" con las rutas `/admin*`, `/_actions/admin.*` y `/api/admin/*`, política con el correo del dueño y sesión de 24 h. Luego `wrangler secret put ACCESS_AUD` (el *Application Audience tag*) y `wrangler secret put ADMIN_EMAILS`, y poner `ACCESS_TEAM_DOMAIN` en `wrangler.jsonc` (`quickrobot.cloudflareaccess.com`) |
| 1.7 CI de GitHub | El job no arranca: "your account is locked due to a billing issue" | Resolver la facturación de la cuenta `bruno76n` en GitHub y volver a correr el workflow |
| 1.7 Despliegue a `*.workers.dev` | Faltan credenciales de Cloudflare. El CI ya está listo y salta el despliegue sin ellas; `wrangler deploy --dry-run` pasa | (1) `CLOUDFLARE_ACCOUNT_ID`; (2) un `CLOUDFLARE_API_TOKEN` con permisos de Workers Scripts, D1 y R2 (Edit) y KV (Edit); ambos como *secrets* del repositorio en GitHub (Settings → Secrets and variables → Actions); (3) crear la D1 `quick-robot-web` (`wrangler d1 create quick-robot-web`) y pegar su `database_id` en `wrangler.jsonc`; (4) crear el bucket R2 `quick-robot-photos`. Detalle en `17 §1, §2, §6` |
