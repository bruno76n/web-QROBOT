# Notas · agente «costo-pedidos» (fase 9, paso 9.6)

Pantallas `UiPiece` (costo de una pieza, sección `#costo`) y `UiOrder` (pedido #3, sección `#pedidos`), con su página de prueba `/dev/ui-costo-pedidos` (solo en `astro dev`; se borra al integrar).

## Qué se hizo

- **`UiPiece`** (`src/components/system/ui/UiPiece.astro`): el servilletero de `demoPiece`. El desglose se arma desde los datos: la reserva por fallos es `costo − (material + máquina + luz + extras)` = $1.34; las filas se ordenan de mayor a menor (orden estable), y el % y el ancho de cada barra (`UiBar`, `max` = costo) salen de `monto ÷ costo`: 63.6 %, 28.0 %, 5.0 %, 3.4 %, 0.0 %, iguales a la maqueta. Las líneas de cálculo («45 g × $0.36 × 1.05», «2.5 h × $3.00», …) también salen de los datos. La ganancia por canal es `precio × (1 − comisión) − costo` con `demoChannels` ($93.25, $93.25, $72.85).
- **`UiOrder`** (`src/components/system/ui/UiOrder.astro`): `demoOrder3` más `demoOrder3Detail` (nuevo, en mi bloque de `system-demo.ts`): estados con fecha y el actual, artículos (cantidad, monto, existencias, por imprimir, impresora, avance en %, minutos restantes), fin estimado y pagos. Estados hechos/actual se calculan desde `current`; el origen omite «Existencias: 0»; las piezas (13) se suman de los artículos.
- **Textos** en `es.system.ui.piece` y `es.system.ui.order`, con funciones donde llevan datos. `piece.duration(min)` da «2 h 30 min» y lo usa también `UiOrder` para el tiempo restante.
- **Descripciones** (`aria-label` de `UiFrame`): las de la maqueta, iguales letra por letra, armadas con los datos (`site.system.name`, costo, precio, ganancia; estado, total, pagado, saldo y número de artículos en palabras).
- **Prueba** `tests/system-demo-costo-pedidos.test.ts`: el desglose suma el costo y da los % de la pantalla; la ganancia por canal; artículos = total ($2,350), pagos = pagado ($1,000), existencias + por imprimir = cantidad, 13 piezas; el estado actual está entre los estados.

## Decisiones

- **Fechas como se muestran** («2 nov», «sábado 14 nov, 1:20 p. m.») en `demoOrder3Detail`, igual que `demoOrder3.due` («15 nov»): formatearlas con `Intl` daría variaciones entre motores («p.m.» / «p. m.»).
- **Columnas secundarias en ≤ 480 (`hide-xs`, 25 §8):** en la maqueta la pantalla del costo no lleva `hide-xs`; lo que se oculta en ≤ 480 es la columna de la barra del desglose (`.brk td.bar`, ya en `system-ui.css`). La tabla de ganancia por canal conserva sus tres columnas, como la maqueta (la «comisión por canal» de 25 §8 es la de la tabla de Reportes).
- **Coherencia con Impresoras (agente «taller»):** el pedido #3 dice que la Bambu Lab P1S imprime el letrero de taquería (62 %, 6 h 50 min restantes) y la Ender 3 V3 SE los servilleteros (30 %, 17 h 30 min). Si `UiPrinters` muestra trabajos actuales, conviene que coincidan (o tomarlos de `demoOrder3Detail.items`).
- Íconos: `check` (estados hechos y precio mínimo), `printer`, `clock`, `file-text`, `copy` de lucide en lugar de los trazos de la maqueta.

## Diferencias con la maqueta

Ninguna visible: alto, ancho, texto y descripción iguales en 360, 390, 820 y 1440 (capturas lado a lado revisadas). El miniatura del servilletero es el mismo SVG de la maqueta.

## Lo que pido fuera de mis archivos

- **`src/styles/system-ui.css`**, regla `.ui-meta .ic` (sección «base»): agregar `display: inline-block;`. El reset global del sitio pone `svg { display: block }` y el ícono de la impresora en `.ui-meta` empujaba el nombre a otra línea (+13 px por artículo). Mientras tanto lo resuelve el `<style>` de `UiOrder` (`.ped-items :global(.ui-meta .ic) { display: inline-block; }`); al agregarlo en `system-ui.css` se puede quitar de ahí. Afecta a cualquier pantalla con ícono dentro de `.ui-meta`.
- **Integración:** en `src/pages/talleres/index.astro`, `<UiPiece />` en la sección `#costo` (normal) y `<UiOrder />` en `#pedidos` (`rev soft`); luego borrar `src/pages/dev/ui-costo-pedidos.astro`.

## Tabla para `progreso.md`

| Pantalla o página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| `UiPiece` (costo de una pieza) | igual | igual | igual | igual | 292×954.6 · 322×935.8 · 693.8×619.4 · 593.3×619.4 px, igual a la maqueta; sin desborde horizontal |
| `UiOrder` (pedido #3) | igual | igual | igual | igual | 292×773.7 · 322×773.7 · 693.8×608.8 · 593.3×608.8 px, igual a la maqueta; ícono en línea resuelto en el componente (ver arriba) |

Pruebas: `pnpm lint`, `pnpm typecheck` (0 errores), `pnpm test` (57 archivos, 486 pruebas) y `pnpm security` (8/8; en una primera corrida el servidor de Playwright del puerto 4321 se cayó a media corrida en w1440, la segunda pasó completa) en verde.
