# Notas · agente «inicio» (fase 9, paso 9.6)

Pantalla de Inicio del sistema (`UiSidebar`, `UiHome`, `UiFloats`) para el hero de `/talleres` y el de `/talleres/descargar` (`docs/25 §6.3, §8`).

## Qué quedó

- `src/components/system/ui/UiSidebar.astro`: barra lateral (negocio «EZ · Eje Z · Impresión 3D», «Buscar ⌘K», Inicio y los 3 grupos con sus 13 módulos desde `modules`/`moduleGroups`, con los contadores de `demoMenuCounts`: Pedidos 6, Compras 4). Prop opcional `current` (por defecto `'home'`).
- `src/components/system/ui/UiHome.astro`: sin props. `UiFrame` con `class="fig-app"` e `inner="ui-app"` (las clases de la maqueta). Escritorio con barra lateral, tableta sin ella y celular con su versión (todo con las clases de `system-ui.css`: `ui-mtop`, `ui-hide-sm`, etc.).
- `src/components/system/ui/UiFloats.astro`: los dos avisos (`aria-hidden`, solo ≥ 1240 px por `system-ui.css`). **Se colocan dentro del mismo contenedor `position: relative` que la pantalla** (el `.hero-shot` de la maqueta), justo después de `<UiHome />`:
  ```astro
  <div class="hero-stage"><div class="wrap hero-shot"><UiHome /><UiFloats /></div></div>
  ```
  En Descargar va solo `<UiHome />` (la maqueta no lleva avisos ahí).
- `src/pages/dev/ui-inicio.astro`: página de prueba (404 fuera de `astro dev`), con el contenedor del hero de la maqueta. **Se borra al integrar.**
- Datos en mi bloque de `system-demo.ts`: `demoNetChange` (17.6), `demoTodayLabel`, `demoMenuCounts`, `demoAlerts` (tipo `DemoAlert`), `demoPrinting`, `demoDeliveries`. Textos en `es.system.ui.home`. Prueba: `tests/system-demo-inicio.test.ts` (fecha = `demoBusiness.today`, contador de Compras = artículos de `demoPurchases`, trabajos ≤ impresoras, pedido #3 = `demoOrder3`).

## Decisiones

- **Descripción de `UiFrame`** (adaptada a los datos): «Pantalla de Inicio de Quick Cerebro: ventas de 30 días por $6,270 con ganancia bruta de $5,077 y ganancia neta de $2,370, 5 alertas con su acción, 2 de 3 impresoras trabajando con su tiempo restante y próximas entregas».
- **Íconos** (lucide más parecido a los trazos de la maqueta): alerta de filamento `triangle-exclamation-point`, fecha de entrega `clock`, stock crítico el de Filamentos (`disc`, por `ModuleIcon`), saldo `banknote`, mantenimiento `wrench`, tiempo restante `clock`, menú `menu`, nueva pieza `plus`, buscar `search`, avisos `check` y el de Reportes (`chart-column`).
- La lista del menú va en `<div class="ui-nav">` y no en `<nav>`: está dentro de una figura `role="img"` y no es navegación real (no debe crear un punto de referencia).
- **«▲ 17.6 %» del aviso de ganancia neta**: la maqueta repite la cifra de la ganancia bruta. Se guarda aparte como `demoNetChange` para no presentar el cambio de la bruta como si fuera el de la neta; si se quiere otra cifra, solo se cambia ahí.
- La fecha del encabezado es texto de ejemplo (`demoTodayLabel = 'Viernes 13 de noviembre'`); la prueba revisa que corresponda a `demoBusiness.today` (el 13 nov 2026 es viernes).
- Las alertas se escriben con funciones de `es.system.ui.home.alert[kind]`; los nombres, gramos, horas y montos son datos de `demoAlerts`. El saldo se escribe con `formatPesos` («$500.00», como la maqueta).
- Datos que otras pantallas deberían respetar para cuadrar (están exportados para reutilizarlos): P1S imprimiendo 3 × Letrero de taquería del pedido #3 al 62 % (6 h 50 min) y Ender 3 V3 SE 10 × Servilletero con logo del pedido #3 al 30 % (17 h 30 min), 3 impresoras; PLA Negro faltan 125 g para el pedido #5 (Tacos El Güero); PLA Silk Morado 85 g (crítico); P1S boquilla en 14 h; Mariana R. saldo $500.00 de la venta del 31 oct; pedido #2 listo para el 14 nov; pedido #7 aceptado para el 19 nov. Los agentes «taller» y «costo-pedidos» pueden importar `demoPrinting`, `demoAlerts` y `demoDeliveries` en vez de repetirlos.

## Lo que pido fuera de mis archivos

1. **`src/styles/system-ui.css`** — los íconos dentro de un texto (`.ui-meta .ic`) quedan como bloque porque la base de Tailwind hace `svg { display: block }` (la maqueta no lo hace): el reloj de «Tiempo restante» bajaba a su propia línea y cada trabajo crecía 13 px. Cambio exacto: en la regla `.ui-meta .ic { … }` agregar `display: inline-block;`. Mientras tanto lo resuelvo en el `<style>` de `UiHome` (`.ui-meta :global(.ic) { display: inline-block; }`); cuando se agregue en `system-ui.css`, ese `<style>` se puede borrar. Probablemente afecta también a otras pantallas con íconos en `.ui-meta`.
2. **Página principal (agente «principal») y Descargar**: los estilos del contenedor del hero (`.hero-shot { position: relative }`, `.hero-stage` con el lila desde 140 px y 90 px en ≤ 760, `margin-top: clamp(36px, 5vw, 64px)`, `padding-bottom: clamp(40px, 6vw, 96px)`) son de la página, no de la pantalla; están copiados en `src/pages/dev/ui-inicio.astro` como referencia.
3. Al integrar: borrar `src/pages/dev/ui-inicio.astro`.

## Diferencias con la maqueta

Ninguna visible. En la página de prueba, la barra de Quick Cerebro (fija) tapa la parte de arriba de la captura al hacer scroll; no afecta a la pantalla.

## Comparación (Chromium, página de prueba contra el hero de `talleres.html`)

Altos medidos con `getBoundingClientRect` (pantalla completa, barra lateral, encabezado, resumen, cifras, columnas, alertas, en impresión, próximas entregas), alertas y botones visibles, posición de los avisos y el texto completo de la pantalla: idénticos en las cuatro anchuras (y también en 1100, 1240 y 1280). Sin scroll horizontal. En 390 no hay barra lateral.

| Pantalla o página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| `UiHome` + `UiFloats` (hero) | igual | igual | igual | igual | Pantalla 1115 / 1098 / 920 / 920 px de alto; celular con 3 alertas sin botón y sin próximas entregas; avisos solo desde 1240 |
