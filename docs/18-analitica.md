# 18 · Analítica

Lo que importa saber: **cuánta gente entra** y, sobre todo, **cuántos le pican a WhatsApp y desde qué producto**. Nada más. Sin cookies, sin datos personales, sin banner de cookies.

## 1. Visitas: Cloudflare Web Analytics

- Se activa en el panel de Cloudflare y se agrega su script (o la inyección automática del sitio).
- Da: visitas por página, de dónde llegan (WhatsApp, Facebook, Google), país, dispositivo y Web Vitals reales (LCP, INP, CLS).
- No usa cookies ni guarda IP.
- No se ve en el panel de la web; el dueño lo consulta en Cloudflare.

## 2. Toques a WhatsApp: contador propio

Web Analytics no cuenta clics. Por eso la web suma sus propios toques (tabla `whatsapp_clicks`, `09`; endpoint `/api/click`, `10 §7`).

| Origen (`source`) | Cuándo se cuenta |
|---|---|
| `product` (con `productId`) | "Pedir por WhatsApp" en la página de producto |
| `order` | "Mandar por WhatsApp" en el pedido del inicio (también cuando se llegó desde una idea) |
| `q404` | "Quiero este Q-404" |
| `customizer` | "Pedir por WhatsApp" del personalizador. Ya no existe (2026-11-10); queda para los toques guardados |

- Se manda con `navigator.sendBeacon` al tocar el link (no retrasa la apertura de WhatsApp).
- Cuenta **toques al botón**, no pedidos reales: el dueño lo sabe (el texto del panel dice "toques", no "ventas").
- Lo que **no** se guarda: IP, navegador, hora exacta, nada que identifique a la persona.

## 3. Dónde se ve

En el panel, pestaña Productos (`12 §6`):
- Arriba: "Últimos 30 días: N toques a WhatsApp" con el desglose por origen (Productos · Pedido · Q-404 · Nombre en 3D).
- En cada producto de la lista: su número de los últimos 30 días.

## 4. Pruebas

- `click.test.ts` (`13 §10`).
- En el flujo A (`04 §6`), al tocar "Pedir por WhatsApp" se manda el beacon con `source = product` y el id correcto (se intercepta la petición en Playwright).
