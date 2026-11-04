# Informe de la fase 4

## Resumen
`/` es el inicio completo: hero con la portada del panel, Navidad (solo en temporada), ¿Qué se te antoja?, Video, Imprimiendo, Q-404, Alberca y Pedido, igual al mockup en 390, 820 y 1440. Los flujos B (pedir desde una idea) y E (cambiar la portada desde el panel) pasan. Lighthouse en celular da 98 / 100 / 100 / 100 en el inicio y el JS al abrir pesa 18.9 KB.

## Pasos
| Paso | Estado | Notas |
|---|---|---|
| 4.1 Hero | Listo | portadas del panel o la foto por defecto, Embla fade + autoplay, nombre en una línea al ancho exacto, header sobre el hero |
| 4.2 Navidad | Listo | solo del 1 de octubre al 24 de diciembre (hora de Guadalajara, decidida en el servidor), contador, línea del tiempo, 4 productos reales |
| 4.3 ¿Qué se te antoja? | Listo con **reemplazo** | falta el componente externo de 21st.dev: corre `HoverLinks.placeholder.tsx` (pendiente en `progreso.md`) |
| 4.4 Video | Listo | sin archivo el botón está deshabilitado |
| 4.5 Imprimiendo | Listo | `scroll()` de `motion`, 640 capas, robot completo con movimiento reducido |
| 4.6 Q-404 | Listo | 6 combinaciones, mensaje de WhatsApp por combinación, precio y alto del producto |
| 4.7 Alberca | Listo | matter-js al tocar, canvas sin clics, Vaciar / Escape / automático |
| 4.8 Pedido | Listo | huecos que crecen, plurales, `#pedido=<idea>` y `#pedido=navidad` |
| 4.9 Inicio completo | Listo | comparado en los tres anchos, Lighthouse y axe |

## Pruebas
- **Vitest: 230 pruebas** (nuevas: `order`, `print`, `hero`, `clock`, consultas de Navidad y precio).
- **Playwright público: 142 pruebas** (3 anchos), todas verdes: flujo B, "Apartar un regalo", header sobre el hero, nombre en una línea, Imprimiendo (capas y reducido), Q-404, Video, alberca (matter-js solo al tocar, Escape, reducido), foto de la fila en táctil, `x-test-now` ignorado en producción, scripts que siguen funcionando después de navegar, y axe sin errores serios en el inicio.
- **Playwright de desarrollo (`e2e/dev-home.spec.ts`, 3 anchos):** temporada con fecha simulada en servidor y navegador (30 sep, 1 oct, 23 dic 18:00 con el contador corriendo, 24 y 25 dic) y **flujo E** (portada de escritorio y de celular desde el panel, vistas en el inicio). Corrida completa del panel y de desarrollo: **63 pruebas verdes**.
- **Seguridad (`pnpm security`, 5/5).** `gitleaks` sigue sin correr aquí.
- **Rendimiento:** `pnpm size`: inicio 18.9 KB (meta 90), catálogo 8.8, producto 20.0, 404 5.5. Lighthouse celular: inicio 98 / 100 / 100 / 100 (LCP 2.3 s, CLS 0, TBT 0), catálogo y producto 100 / 100 / 100 / 100.

## Comparación con el mockup
| Sección | 390 | 820 | 1440 |
|---|---|---|---|
| Hero | igual | igual | igual |
| Navidad | igual (tarjetas = productos reales) | igual | igual |
| ¿Qué se te antoja? | igual (reemplazo) | igual (reemplazo) | igual (reemplazo) |
| Video | igual | igual | igual |
| Imprimiendo | igual | igual | igual |
| Q-404 | igual | igual | igual |
| Alberca | igual | igual | igual |
| Pedido | igual | igual | igual |

## Decisiones tomadas
`docs/decisiones.md`, entrada "Fase 4". Las que más importan: los links `#pedido=<id>` los atiende `Pedido.astro` (con `ClientRouter` un clic en un link con `#` no dispara `hashchange`); el `<source>` del hero lleva su ancho y alto (había CLS 0.29); `content-visibility: auto` en las secciones de abajo (rendimiento 67 → 98); física de la alberca con matter-js; hero de varias fotos con Embla sin React; la fecha simulada solo existe fuera de producción.

## Pendientes del dueño
Los de antes (WhatsApp, redes, dominio, fecha de Navidad, video del timelapse, alto del Q-404, fotos y precios reales) y el **componente externo "Interactive Hover Links"** (hoy corre el reemplazo; se integra en el último paso de la fase 5).

## Bloqueado o dudoso
Cloudflare (Access, despliegue, dominio de fotos) y el CI de GitHub, como en fases anteriores.

## Cómo probarlo
```bash
pnpm dev                 # http://localhost:4321/
pnpm test && pnpm security
pnpm build && pnpm size && pnpm e2e:public
pnpm e2e:admin           # incluye dev-home (fecha simulada y flujo E)
pnpm lhci
```
Para ver Navidad en otra fecha (solo en desarrollo): `curl -H 'x-test-now: 2026-12-24T12:00:00-06:00' localhost:4321/`.
