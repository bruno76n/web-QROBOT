# Notas del agente «Descargar» · fase 9, paso 9.8

Página `/talleres/descargar` (`docs/25 §7.3`) y `PlatformList`. Rama `fase-9-descargar`.

## Qué se hizo

- `src/pages/talleres/descargar.astro`: encabezado (`h1`, frase, botón principal según el equipo, línea de requisitos y `AppWindow shot="pedidos"` con `crop` y `priority`, más su precarga en `<Fragment slot="head">`), `PlatformList`, «Lo que suma la app», «Instalar» (Mac y Windows) y el `EndCta`. **Sin scripts propios.** Se conservan `prerender = false` y el cerrojo.
- El servidor llama a `detectPlatform(Astro.request.headers.get('user-agent'))` y agrega `Vary: User-Agent` con `Astro.response.headers.append` (el middleware copia las cabeceras de la respuesta, así que llega al navegador). El `User-Agent` no se guarda ni se registra.
- `src/components/system/PlatformList.astro` (prop `current: Platform`): las filas de `platforms` de `config/system.ts` con nombre, requisito (`downloads.*.minOs` para Mac y Windows; `es.system.download.platforms.{other,mobile}.req` para los otros), qué es y botón. La fila del equipo lleva la clase `on` (degradado lila) y «Para tu equipo». Cada `<li>` lleva su `id` (`mac`, `windows`, `other`, `mobile`) y la clase `anchor` (margen de ancla bajo la barra, de `system.css`).
- `e2e/dev-talleres-descargar.spec.ts` (flujo **P** de `25 §12`): con `User-Agent` de Mac, de Windows (Edge) y de iPhone revisa el botón principal (nombre accesible y `href`), la línea de requisitos, el segundo botón, que solo una fila lleve «Para tu equipo» y que sea la correcta, y que la respuesta traiga `Vary` con `User-Agent`. 9 de 9 en verde (390, 820, 1440).

## Decisiones

1. **Ligas.** Mientras `downloads.*.url` esté vacío, el botón principal y los de las filas de Mac y Windows van a `/talleres/descargar#mac` / `#windows` (con `url`, al archivo). «Abrir en el navegador» y «Abrir en el celular» van a `site.system.appUrl` con `rel="noopener"` (toda liga `http(s)` lleva `noopener`).
2. **Botón principal en celular u otro equipo** → `appUrl`. En la maqueta se queda con `href="#mac"` porque su script solo cambia el texto; se toma como descuido de la maqueta (el texto dice «Abrir en el navegador»).
3. **Segundo botón del encabezado** («Abrir en el navegador», `outline`): solo en Mac y Windows, como la maqueta (que esconde `[data-dl-alt]` en celular y otro). Va a `appUrl` (en la maqueta, `#other`).
4. **«Para tu equipo» solo se pinta en la fila del equipo** (la maqueta lo pone en las 4 filas con `hidden` y su script lo muestra). Mismo resultado sin JavaScript.
5. **Separación del encabezado.** En la maqueta `.s-ph .wrap { gap: 20px }` le gana a `.dl-top { gap: 36px; column-gap: 64px }` (más específica), así que lo que se ve es 20 px en las dos direcciones. Se copió lo que se ve (`gap: 20px`), medido igual en los 4 anchos.
6. **`sizes` de la captura**: `(min-width: 1100px) 700px, 100vw` (a la derecha ocupa 7 de 12 columnas, unos 707 px en 1440; abajo de 1100 va a todo lo ancho). `25 §11` solo fija los del hero y el recorrido; la precarga usa el mismo `srcset` y `sizes`. En la maqueta la imagen es `loading="lazy"`; aquí `priority` (es la imagen principal de la página, como pide el encargo).
7. **Pasos de «Instalar»**: Tailwind (preflight) quita los números de las `<ol>`; se devuelven con `list-style: decimal`. En celular la maqueta tiene el cuerpo en 17 px (`_base.css`: `@media (max-width: 760px) body { font-size: 17px }`) y la web en 18 px; como la lista hereda el tamaño, se le pone 17 px en ≤ 760 dentro de la página para que quede igual (con 18 px las líneas partían distinto y la sección crecía 95 px en 360).
8. **`data-dl-main`** en el botón principal: gancho para la prueba (el mismo nombre de la maqueta); no lo usa ningún script.
9. **iPad que se presenta como Mac** recibe «Descargar para Mac» (aceptado en `25 §5`: abajo están todas las opciones).

## Diferencias con la maqueta

| Qué | Por qué |
|---|---|
| Botones 2–4 px más anchos | `Button.astro` (padding de 24 px contra 22 de la maqueta). Decidido para toda la web |
| El botón lo elige el servidor | `25 §14` |
| Ligas a `appUrl` y a `/talleres/descargar#…` en lugar de `#other`, `#mobile`, `#mac` | `25 §14` y decisiones 1–3 |
| Header de la web y barra del producto | Los de la web (`SystemLayout`) |

Ninguna diferencia de alto: todas las secciones miden lo mismo que la maqueta en 360, 390, 820 y 1440 con los cuatro `User-Agent` (Mac, Windows, iPhone y Linux/otro), sin scroll horizontal. axe sin violaciones en 390 y 1440.

## Pido fuera de mis archivos

- **Nada obligatorio.**
- (Para el integrador, opcional) `docs/25 §11`: agregar los `sizes` de la captura de Descargar: `(min-width: 1100px) 700px, 100vw`.
- (Para el integrador) El cuerpo de la web en celular es de 18 px y el de las maquetas de 17 px (`reference/mockups/_base.css`, línea 52). Aquí se corrigió localmente en la única pieza que hereda el tamaño (`.steps2 ol`); si otras páginas de talleres ven lo mismo, quizá conviene una regla común en `src/styles/system.css`: `@media (max-width: 760px) { .system { font-size: 17px; } }`.
- (Para el integrador) `25 §12` pide los flujos en Chromium y WebKit; `playwright.admin.config.ts` solo tiene Chromium y aquí no se puede instalar WebKit. La página no tiene scripts, así que el riesgo en Safari es solo de CSS (no usa `aspect-ratio`, `:has`, `inset` ni `gap` en flex).

## Comparación para `progreso.md`

Con `User-Agent` de Mac en la web y en la maqueta (la maqueta elige con JavaScript el mismo botón); también revisado con Windows, iPhone y Linux.

| Página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| `/talleres/descargar` | igual | igual | igual | igual | Botón principal por `User-Agent` en el servidor (`Vary: User-Agent`); botones 2–4 px más anchos (`Button.astro`) |
