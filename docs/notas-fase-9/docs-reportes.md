# Notas de la fase 9 · agente «docs-reportes» (pantallas Cotización y Reportes)

Paso 9.6 (parte): `UiQuote` y `UiReports` en `src/components/system/ui/`, con sus datos en el bloque
`docs-reportes` de `src/config/system-demo.ts` y sus textos en `es.system.ui.quote` y
`es.system.ui.reports`.

## Qué se hizo

- **`UiQuote`** (maqueta `#documentos`): hoja de cotización con los datos del negocio
  (`demoBusiness` + ciudad, teléfono y correo de `demoQuote`), «Cotización», folio, fecha
  (`demoBusiness.today` → «13 nov 2026»), vigencia, cliente, tabla de artículos (cantidad,
  descripción con detalle, precio unitario, importe), total y pie de página. `UiFrame kind="card"`
  con `inner="ui-doc"` y `class="fig-doc"`: ancho completo hasta 560 px, centrada por `Stage center`.
- **`UiReports`** (maqueta `#reportes`): ventana (`UiFrame` `win`, `inner="ui-rep"`) con título,
  periodo y periodo de comparación, selector de periodo dibujado (7 días · **30 días** · 90 días ·
  Todo) y «Copiar resumen» (lucide `copy`); las 5 cifras de `demoSales`; ventas por semana
  (`UiColumns` con ganancia bruta y leyenda de dos series); distribución de cada $100 (barra de dos
  partes, gris y verde solo para la ganancia; lista con `UiBar` gris contra el mayor costo);
  productos con más ganancia (`UiBar green` contra el primero); por canal con su total (`hide-xs`
  en ventas y comisión).
- **Lo calculado, no escrito:** importes de la cotización (cantidad × precio) y su total
  (`demoQuoteAmounts`, `demoQuoteTotal` = $2,010.00); el periodo (`demoReportPeriod`: últimos
  `demoSales.days` días hasta `today` y los 30 anteriores → 15 oct – 13 nov 2026 · comparado con
  15 sep – 14 oct); margen neto (2,370 / 6,270 = 37.8 %); «Costos y gastos» de cada $100 (suma de
  todo menos la ganancia neta = $62.10) y el ancho de la barra; los totales por canal (13, $6,270,
  $85, $5,077); el selector marca la opción igual a `demoSales.days`.
- **Datos nuevos** (bloque `docs-reportes` de `system-demo.ts`): `demoQuote`, `demoQuoteAmounts`,
  `demoQuoteTotal`, `demoReportPeriod`, `demoReportRanges`, `demoTopProducts`. Prueba:
  `tests/system-demo-docs-reportes.test.ts` (importes y total de la cotización, periodo, margen
  neto y $62.10/$37.90, productos ordenados y dentro de la ganancia bruta).
- **Página de prueba** `src/pages/dev/ui-docs-reportes.astro` (solo en `pnpm dev`, `noindex`): las
  dos secciones con `FeatureSection` (`soft center` y `wide dark`) y los textos de la maqueta como
  relleno. **Se borra al integrar.**

## Decisiones

- **Pie de página y contacto de la cotización como datos de ejemplo** (`demoQuote.footer`, `city`,
  `phone`, `email`), no como textos de `es.ts`: son lo que el taller de ejemplo captura en Ajustes,
  igual que los nombres de clientes y productos. Las etiquetas de la hoja (Cotización, Folio,
  Fecha:, Vigencia:, Cliente, Cant., Descripción, P. unitario, Importe, Total) sí van en
  `es.system.ui.quote`.
- **Meses cortos** (`ene` … `dic`) en `es.system.ui.quote.months`; `UiReports` los reutiliza para el
  periodo. La fecha se arma en el componente con `split('-')` (sin `Intl`, que según la versión de
  ICU escribe «oct.» con punto).
- **La hoja usa `UiFrame kind="card"`** (no hay variante «hoja»): el `<style>` de `UiQuote` le quita
  el borde de la tarjeta y deja las esquinas de 6 px también en celular
  (`:global(.ui-card.ui-doc) { border: 0; border-radius: 6px; }`); sin eso, en ≤760 tomaba las
  esquinas de 14 px de `.ui-card` y medía 2 px más por el borde. El ancho de 560 px
  (`.feat.doc .fig-doc` de `_talleres.css`) también va en ese `<style>`
  (`:global(.ui-fig.fig-doc)`).
- **Diferencia con la maqueta: Reportes en tabletas angostas (761–959 px).** En la maqueta, la tabla
  «Por canal» se sale de su panel entre 761 y ~925 px (69 px a 761, 44 px a 820, 10 px a 900; la
  columna «Ganancia» queda cortada contra el borde de la ventana). `UiReports` pone los cuatro
  paneles uno debajo de otro en 761–959 (como en celular), con su `<style>`
  (`@media (min-width: 761px) and (max-width: 959px) { .rp-grid { grid-template-columns:
  minmax(0, 1fr); } }`), así la tabla conserva sus cinco columnas («Completas» en tableta, 25 §8).
  La pantalla mide más a 820 (982 → 1496 px; sección 1720 → 2233). Medido: sin desborde de 481 a
  1440.
- La descripción de la cotización dice «dos artículos» con palabra (como la maqueta) hasta cuatro;
  desde cinco, con número.

## Lo que pido fuera de mis archivos

- **`src/components/system/ui/UiFrame.astro`** (opcional): una variante `kind: 'doc'` que pinte
  `<div class="ui ui-doc">` sin `ui-card`, como la maqueta. Con ella sobran las dos reglas
  `:global(.ui-card.ui-doc)` de `UiQuote`.
- **`src/styles/system-ui.css`** (opcional): mover la regla del ancho de la hoja
  `.ui-fig.fig-doc { width: 100%; max-width: 560px; }` (hoy en el `<style>` de `UiQuote`) y la de
  tabletas angostas `@media (min-width: 761px) and (max-width: 959px) { .rp-grid {
  grid-template-columns: minmax(0, 1fr); } }` (hoy en el `<style>` de `UiReports`).
- **`reference/mockups/talleres/_ui.css`** (para quien mantenga la maqueta): la misma regla de
  tabletas angostas, para que la tabla «Por canal» no se salga de su panel.

## Comparación con la maqueta

Página `/dev/ui-docs-reportes` contra `reference/mockups/talleres/talleres.html`, Chromium, alto de
la sección, ancho y alto de la pantalla (`figure[role=img]`) y de cada parte (encabezado, cliente,
tabla, total y pie; encabezado, cifras y los 4 paneles): **iguales al píxel en 360, 390 y 1440**, y
la cotización también en 820; Reportes a 820 difiere a propósito (paneles en una columna, ver
Decisiones). `scrollWidth` = ancho en todos. Capturas lado a lado revisadas (sin la barra fija ni el aviso de la
maqueta).

| Pantalla | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Cotización (`UiQuote`) | igual (sección 1318, hoja 292×637) | igual (1300, 322×619) | igual (1168, 560×501) | igual (845, 560×501) | Hoja de 560 px centrada; en celular el encabezado se apila |
| Reportes (`UiReports`) | igual (2530, 292×1704) | igual (2473, 322×1647) | diferencia aceptada (2233 contra 1720; 694×1496 contra 694×982) | igual (1573, 1144×916) | Sobre el fondo `#202027`; en ≤480 sin ventas ni comisión por canal; en 761–959 los paneles en una columna para que «Por canal» no se salga |
