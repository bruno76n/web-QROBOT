# Notas · agente «principal» · fase 9, paso 9.7 (página principal de Para talleres)

## Qué se hizo

- `src/pages/talleres/index.astro`: las secciones de `25 §7.1` en el orden de la maqueta `talleres.html` (hero con `Wordmark`, `UiHome` y `UiFloats`; Módulos; Costo, Pedidos, Producción, Filamento, Existencias, Documentos y Reportes con `FeatureSection`; Alertas; Equipo; Datos; Precios; Preguntas; Cierre). Conserva `export const prerender = false;` y el cerrojo `if (!systemVisible) return Astro.rewrite('/404');`.
- Componentes nuevos en `src/components/system/`, cada uno con su `<style>`: `ModuleIndex`, `CostFormula`, `AlertsTable`, `RolesTable`, `DataFacts`.
- `src/config/system.ts` (bloque `principal`): `costTerms`, `alerts`, `roles` y `roleMatrix`.
- `src/i18n/es.ts` (bloque `principal`): `es.system.home` con todos los textos de la maqueta (hero, módulos, las 7 secciones con sus detalles, fórmula, alertas, roles, datos, precios y las 7 preguntas; las preguntas reciben el nombre del sistema y los días de prueba).
- `e2e/dev-talleres.spec.ts`: flujo **M**.

## Decisiones

- **Íconos de las secciones:** `ModuleIcon` con `cost`, `orders`, `printers`, `filaments`, `stock`, `documents`, `reports`, `alerts`, `team`, `data` (lucide, `25 §14`). La maqueta usa en Costo el ícono de Productos y en Equipo el de Clientes; aquí van los de su clave.
- **«Comparar planes» en la línea de la nota de precios:** `PlanBand` pinta la nota en su propio `<p>` y no tiene lugar para la liga. Para que la liga quede en la misma línea que en la maqueta, la página pone la nota `display: inline` y la liga detrás, y el bloque toma el tamaño de la nota (14 px, `text-wrap: pretty`) mientras el encabezado y la banda recuperan el del cuerpo. Medido igual a la maqueta en los 4 anchos. Lo limpio sería un slot en `PlanBand` (abajo).
- **Precios:** solo mensual, sin `PeriodToggle` (`fase-9.md` 9.7: «sin control visible»), como la maqueta.
- **`.fig-doc`** (hoja de la cotización de máximo 560 px) va en el `<style>` de la página (`#documentos :global(.fig-doc)`), porque en la maqueta es regla de la página (`_talleres.css`), no de `_ui.css`. `UiQuote` tiene que poner `class="fig-doc"` en su `UiFrame`.
- **Alertas y roles:** el botón de cada alerta es un `<span class="act">` dibujado (la página describe el sistema; no es un botón real). En roles, la raya «—» va con `aria-hidden` y cada celda dice «sí» o «no» solo para lectores; «Administración» se vuelve «Admin.» en ≤ 760 px y el nombre completo queda para lectores.
- **JSON-LD `SoftwareApplication`** (`25 §10`) no se agregó: es «al encender» (`25 §13`).
- **Prueba de «Módulos»:** comprueba que la sección queda justo debajo de la barra (0–16 px) y que el título empieza debajo de su borde, en 390, 820 y 1440.

## Pendiente (`test.fixme` en `e2e/dev-talleres.spec.ts`)

1. **«en 390 la pantalla de Inicio va sin barra lateral»:** `UiHome` todavía es el marco provisional (sin `.ui-mtop` ni `.ui-side`). Quitar el `fixme` cuando el agente «inicio» integre su pantalla.
2. **«en celular el menú de la barra se cierra al elegir "Módulos"»:** ver la petición 1 de abajo.

## Lo que pido fuera de mis archivos

1. **`src/components/system/SystemNav.astro` (menú de celular):** al tocar «Módulos» dentro del `<details>` estando ya en `/talleres`, el menú se queda abierto encima de la sección (la navegación es al mismo documento, así que el `<details>` no se cierra). La maqueta lo cierra en `_talleres.js` (`$$('.pmenu a')…open = false`). Cambio propuesto: un `<script>` en `SystemNav` que arranque en `astro:page-load` y, con un `AbortController` que se aborta en `astro:before-swap`, escuche `click` en `.pmenu a` y haga `details.open = false`. Sin JavaScript sigue funcionando como hoy. Al hacerlo, quitar el segundo `test.fixme`. (Ojo con `25 §11`: la página tiene presupuesto de 6 KB de JS; esto son unos cientos de bytes.)
2. **`src/components/system/PlanBand.astro`:** un slot (o prop `noteExtra`) dentro de `<p class="plans-note">` para poner «Comparar planes» en la misma línea sin el truco de `display: inline` de la página. Cuando exista, quitar de `index.astro` las reglas `.price-band`.
3. **`src/components/site/Button.astro` / `button-variants.ts`:** el botón mide `px-6` (24 px a cada lado) y el de la maqueta 22 px; «Probar 14 días gratis» sale 2 px más ancho. No cambia ninguna altura ni salto de línea; anotado como diferencia aceptada.
4. **`UiQuote`:** poner `class="fig-doc"` en su `UiFrame` para que tome el ancho máximo de 560 px.

## Comparación con la maqueta

Con Playwright (Chromium), la página en `pnpm dev` contra `reference/mockups/talleres/talleres.html` con la misma Geist (la de Google Fonts se sirve desde `public/fonts/` en la prueba). Se midió cada sección, y dentro de ella título, frase, encabezado, columna de texto, detalles, fórmula, tablas, módulos, planes y preguntas; y capturas de cada parte que no es pantalla, lado a lado.

- Todo lo que no es pantalla del sistema mide **igual** en 360, 390, 820 y 1440 (mismas alturas al décimo de píxel y mismos saltos de línea); las capturas solo difieren por los íconos de lucide y por medio píxel de redondeo.
- Las secciones con pantalla (hero, las 7 de módulos) difieren solo por la altura de la pantalla: son **marcos provisionales** que otros agentes están dibujando. Altura de la sección menos altura del fondo lila = igual a la maqueta (p. ej. Costo en 360: 1451.8 contra 1451.9). **Las alturas de esas secciones se revisan al integrar las pantallas.**
- Sin scroll horizontal en los 4 anchos; el nombre en grande cabe en una línea en 360.

| Pantalla o página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Principal · hero (sin la pantalla) | igual | igual | igual | igual | Botón principal 2 px más ancho (`Button` px-6); `UiHome`/`UiFloats` provisionales |
| Principal · Módulos | igual | igual | igual | igual | Íconos de lucide (`25 §14`) |
| Principal · 7 secciones de módulos (texto, fórmula, detalles) | igual | igual | igual | igual | Altura total se revisa al integrar las pantallas |
| Principal · Alertas | igual | igual | igual | igual | En celular, filas apiladas con la acción a la derecha |
| Principal · Equipo | igual | igual | igual | igual | «Admin.» en celular |
| Principal · Datos | igual | igual | igual | igual | |
| Principal · Precios | igual | igual | igual | igual | «Comparar planes» en línea con la nota (ver decisiones) |
| Principal · Preguntas | igual | igual | igual | igual | |
| Principal · Cierre | igual | igual | igual | igual | |

## Pruebas

- `pnpm lint`, `pnpm typecheck` (0 errores, 0 avisos), `pnpm test` (56 archivos, 481 pruebas) y `pnpm security` (8/8) en verde.
- `e2e/dev-talleres.spec.ts` en admin-w390/820/1440: 12 pasan, 6 `fixme` (los 2 de arriba × 3 proyectos). WebKit no se puede correr aquí (se agrega en 9.11).
