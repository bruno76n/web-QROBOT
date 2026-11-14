# Notas · fase 9 · Precios (paso 9.7)

Agente «Precios», rama `fase-9-precios`.

## Qué se hizo

- `src/pages/talleres/precios.astro` (25 §7.2): encabezado (`section.s-ph`, `h1`, frase, `PeriodToggle`) → `PlanBand headingLevel={2}` en `section.pt0` «Planes» → `PlanFinder` → precio de fundador (`site.system.founderSeats`) → `CompareTable` → `Faqs` «Sobre el pago» (`wide`, `t-h2`, `pay-h`, `es.system.pricing.pay.items(trialDays)`) → `EndCta`. Cerrojo (`prerender = false` y `Astro.rewrite('/404')`) intacto.
- `src/components/system/PeriodToggle.astro` + `src/scripts/system-period.ts`: Mensual / Anual («2 meses gratis») con `aria-pressed`. Al cambiar, solo copia los textos de `data-monthly-*` / `data-yearly-*` de cada `[data-plan-price]` a su `b`, su `span` y su `.price-yr` hermano (PlanBand no se tocó) y avisa con el evento `system:period`.
- `src/components/system/PlanFinder.astro` + `src/scripts/system-finder.ts`: deslizadores impresoras 1–20, personas 1–10, ventas y pedidos 0–100 de 5 en 5 (empieza en 3 / 1 / 30, como la maqueta); el tope se lee «20 o más» (también en `aria-valuetext`); relleno con `--p` (estilos `-webkit-` y `-moz-range-progress`). Resultado con `recommendPlan`, motivos con `planReasons` y los textos de `es.system.pricing.finder.reasons`, precio en el periodo elegido y el botón («Empezar gratis» para Gratis, «Probar 14 días gratis» para los de pago). En escritorio el resultado va a la derecha con `position: sticky` (medido: se queda a `--pbar + 24px`, igual que la maqueta).
- `src/components/system/CompareTable.astro`: filas de `compareGroups`; las de `limit` leen el plan (número o «Sin límite»); ✓ / — con «Incluido» / «No incluido» en `.vh`; columna del plan recomendado resaltada; en celular, celdas de 8 px de relleno (tres columnas angostas, sin scroll horizontal en 360).
- `e2e/dev-talleres-precios.spec.ts` (flujo N): Anual → Taller $1,490 y «Equivale a $124 al mes» (y el buscador «$1,490 al año»); 1/1/10 → Gratis; 12 impresoras → Taller con «Con 12 impresoras pagas lo mismo que con 1»; 3 personas → Negocio; 10 personas → «Para más de 8 personas, escríbenos por WhatsApp»; teclado (→ y Fin, «20 o más»); sin JavaScript → mensual con «o $1,490 al año» y el buscador en Taller sin motivos. Los deslizadores se mueven con `fill` (dispara `input`, como al arrastrar) y con el teclado.

## Decisiones

1. **Datos al script por `data-finder-data` (JSON)**, no importando `site` ni `es` en el cliente: así no se empaqueta todo `es.ts`. El JSON lleva los planes, nombres, precios ya escritos por periodo, y los motivos ya escritos (el de impresoras uno por cada número del 1 al 20, el tope con «o más»), así el script nunca formatea dinero ni arma textos. Difiere de `25 §14` («el script importa `site.system.plans`»), que es solo la forma; el resultado es el mismo.
2. **Sin JavaScript** el buscador muestra el resultado de los valores iniciales calculado en el servidor con `recommendPlan` (Taller, el recomendado) y la lista de motivos vacía se oculta (`ul:empty`); el relleno `--p` de los deslizadores también sale del servidor en `style`, así se ve bien sin script.
3. **Contraste de «2 meses gratis»:** en la maqueta es `--green-d` (#00873a) de 12 px sobre `--soft`, 4.29:1 → axe lo marca «serious». Se usa `#007a34` (5.1:1) solo en ese texto. Ver «Pedidos» 1.
4. **El periodo avisa al buscador con un evento** (`system:period` en `document`); el buscador lee además el botón con `aria-pressed="true"` al arrancar. Ambos scripts arrancan en `astro:page-load` y limpian en `astro:before-swap` (probado: ida a `/talleres` y vuelta por la barra del producto, el periodo y el buscador siguen respondiendo).
5. **Encabezado de «Sobre el pago»:** `Faqs` pinta `header.sec-h`, pero los estilos de `.sec-h` viven en `SectionHead` (con alcance), así que ese encabezado quedaba sin `margin-bottom` (−32 a −60 px contra la maqueta). La página le da esos estilos con `:global(section[aria-labelledby='pay-h'] .sec-h)`. Ver «Pedidos» 2.

## Diferencias con la maqueta

| Dónde | Diferencia | Por qué |
|---|---|---|
| Planes (−16 px en 360/390, −23 en 820, −7 en 1440) | El nombre del plan mide 22 px; en la maqueta de precios el `h2` no tiene regla (`.plan h3` no lo alcanza) y queda en 25.5 px del navegador | `PlanBand` (compartido) los iguala a propósito («Same size as `h2` and `h3`»); no es mío |
| Precio de fundador (+5 px en 360/390) | El párrafo mide 18 px | La web usa 18 px de cuerpo también en celular; la maqueta baja a 17 px (`_base.css`). Es del tamaño base de la web, no del componente |
| Qué trae cada plan (−1 px) | Sin filete debajo de «Ayuda por WhatsApp» en la última fila | En la maqueta la última fila quita el borde de las `td` pero no del `th`; aquí se quita de toda la fila |
| ¿Qué plan te toca? (+1 px en 360/390) | Un píxel en la línea del deslizador | Cuerpo de 18 px contra 17 px (misma causa que el fundador) |
| «2 meses gratis» | Verde un tono más oscuro | Contraste AA (Decisiones 3) |

Todo lo demás (alturas, capturas por sección, sin scroll horizontal) es igual en los 4 anchos.

## Pedidos fuera de mis archivos

1. **`src/styles/global.css` o docs/03 §2 (opcional):** si se quiere un token para texto verde pequeño sobre `--soft`, agregar `--green-dd: #007a34` (o oscurecer `--green-d`) y usarlo en `PeriodToggle.astro` en lugar del valor escrito. Si no, se queda como está.
2. **`src/components/site/Faqs.astro`** (o `src/styles/system.css`): con `wide`, el `header.sec-h` necesita los estilos de `.sec-h` (`display: grid; gap: 16px; margin-bottom: clamp(32px, 4.4vw, 60px); max-width: 860px`). Lo más simple: mover esa regla de `SectionHead.astro` a `system.css` como `.system .sec-h` (y quitarla de SectionHead), o usar `SectionHead` dentro de `Faqs` cuando `wide`. Cuando se haga, quitar la regla `:global(section[aria-labelledby='pay-h'] .sec-h)` de `src/pages/talleres/precios.astro`. La portada (`Faqs` de 6 preguntas) tiene el mismo hueco.
3. **9.10 (WebKit):** `e2e/dev-talleres-precios.spec.ts` también debería correr en el proyecto `webkit` cuando se agregue (aquí no hay WebKit).

## Pruebas

- `pnpm lint` 0 errores / 0 avisos; `pnpm typecheck` 0 errores; `pnpm test` 56 archivos, 487 pruebas; `pnpm security` 7/7.
- `ADMIN_PORT=4332 pnpm exec playwright test -c playwright.admin.config.ts e2e/dev-talleres-precios.spec.ts`: 15/15 (390, 820, 1440).
- axe (Chromium, 1440) en `/talleres/precios`: sin violaciones después del cambio de color.

## Comparación para `progreso.md`

| Página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| `/talleres/precios` | diferencia aceptada | diferencia aceptada | diferencia aceptada | diferencia aceptada | Nombre del plan a 22 px (PlanBand), cuerpo de 18 px en celular (fundador +5 px), sin filete bajo la última fila de la tabla (−1 px), «2 meses gratis» más oscuro por contraste; sin scroll horizontal en los 4 anchos |
