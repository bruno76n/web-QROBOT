# Notas del agente «Principal» · fase 9, paso 9.6

Página principal de Para talleres (`/talleres`, `25 §7.1`).

## Archivos

- `src/pages/talleres/index.astro`: las 12 secciones en el orden de `25 §7.1`, con la precarga de la captura del hero en `<Fragment slot="head">`.
- `src/components/system/MoneySplit.astro`: barra SVG de «De cada $100» (anchos con `splitSegments`/`pct`, montos de `moneyOnBar` escritos en la barra, `role="img"` con `barLabel`) y leyenda.
- `src/components/system/FeatureTour.astro` + `src/scripts/system-tour.ts`: recorrido.
- `src/components/system/Flow.astro`: del archivo a la entrega.
- `src/components/system/RolesTable.astro`: qué ve cada rol (con un script chico para el desvanecido del borde derecho).
- `e2e/dev-talleres-principal.spec.ts`: flujos **M** y **O**.

## Decisiones

1. **Recorrido sin JavaScript:** se ven **todos los temas abiertos**, uno debajo de otro (acordeón abierto, también en escritorio). El servidor pinta todos los botones con `aria-expanded="true"` y ningún panel `hidden`; el script deja abierto solo el primero y marca el recorrido con `data-ready`, y solo con esa marca se aplica el diseño de pestañas de escritorio. Así nada queda inaccesible. Como el recorrido está lejos del primer pantallazo, el cambio al cargar no se ve (no cuenta para CLS).
2. **↑ ↓** mueven el foco entre temas en cualquier ancho y dan la vuelta (como `_talleres.js`); no abren el tema (eso es con Enter o Espacio). En escritorio, tocar el tema abierto lo deja abierto; en celular y tableta lo cierra. Al pasar a escritorio con todo cerrado se abre el primero.
3. **Barritas de los pasos** (50 % del anticipo, 62 % de la placa): constantes en `Flow.astro` (son el ejemplo, no datos del negocio), escritas como atributos del SVG.
4. **Montos sobre la barra de $100:** en blanco sobre las partes oscuras (`mat`, `com`, `gan`) y en tinta sobre las claras; hoy solo se escriben `gas` ($43, tinta) y `gan` ($38, blanco), como la maqueta. Redondeados al peso; la leyenda y el `aria-label` llevan centavos (`formatPesos`).
5. **Foto del taller:** `sizes="(max-width: 1099px) 100vw, 660px"` (en escritorio ocupa 6/11 de 1232 px). Punto de interés `80% 72%` con regla `[data-shot="taller"]`.
6. **Hero:** `sizes` y precarga con `(max-width: 760px) 100vw, 1232px` (`25 §11`), los dos iguales para que la precarga sirva.
7. **«Tu pieza»** (título de la calculadora) a `1.17em`, el tamaño que le da la maqueta al `h3` (sin regla propia, toma el del navegador). Regla local en la página, con `:global`.
8. **Encabezado de Preguntas:** `Faqs wide` pinta `header.sec-h` pero sus estilos son de `SectionHead` (con ámbito). Mientras no se resuelva (ver «Pedidos»), la página envuelve `Faqs` en `<div class="faqs">` y le da a ese `.sec-h` los mismos estilos.
9. **Sin JSON-LD** `SoftwareApplication` todavía: `25 §10` lo pide al encender.

## Diferencias con la maqueta

| Qué | Maqueta | Web | Por qué |
|---|---|---|---|
| Pestaña abierta del recorrido en escritorio | Muestra «−» a la derecha | Sin signo | En la maqueta es un efecto de especificidad (`[aria-expanded=true] b::after` gana a `content: none`); en escritorio la pestaña no se cierra, el «−» confunde |
| Línea del paso 5 en escritorio | Banda gris de 18 px a la derecha del 5 | Línea de 2 px | En la maqueta la regla de celular (`height: 18px` del último paso) se cuela en escritorio; la intención es la línea de 2 px |
| «Tus datos» en 360 y 390 | 774 px | 816 / 788 px | La maqueta pone el cuerpo a 17 px en celular y `system.css` no; con el cambio pedido abajo queda igual (comprobado) |
| Calculadora: valores de inicio | `3.00`, `1.00` | `3`, `1` | Componente compartido de Aprende (no es mío); 1 px de alto |
| Botones | 22 px de relleno lateral | 24 px | `Button.astro` compartido |
| Precios e historia | — | ±1–2 px | Redondeo de texto del componente compartido `PlanBand` y de `text-wrap` |

## Pedidos fuera de mis archivos

1. **`src/styles/system.css`** — agregar (la maqueta tiene `body { font-size: 17px }` a ≤ 760 px):
   ```css
   @media (max-width: 760px) {
     .system {
       font-size: 17px;
     }
   }
   ```
   Con eso «Tus datos» y el resto quedan iguales a la maqueta en 360 y 390 (lo probé inyectando la regla: todas las secciones con el mismo alto). Afecta también a Precios y Descargar, que la maqueta pinta igual.
2. **`src/components/site/Faqs.astro`** (con `wide`) — darle estilos a su `header.sec-h` (los de `SectionHead`: `display: grid; gap: 16px; margin-bottom: clamp(32px, 4.4vw, 60px); max-width: 860px`), o mover `.sec-h` a `system.css`. Después quitar de `index.astro` el `<div class="faqs">` y su regla `.faqs :global(.sec-h)`.
3. **`e2e/`** — `fase-9.md` nombra `e2e/dev-talleres.spec.ts`; mi spec es `e2e/dev-talleres-principal.spec.ts` para no chocar con otros agentes. El integrador puede juntarlos.
4. **`docs/decisiones.md`** — anotar la decisión 1 (recorrido sin JavaScript: todos abiertos; `data-ready` activa las pestañas) y las dos correcciones de la maqueta (signo «−» y línea del paso 5).
5. **`docs/progreso.md`** — la fila de abajo.

## Comparación con la maqueta

Alto de cada sección (`getBoundingClientRect`) y capturas por sección contra `reference/mockups/talleres/talleres.html`, en Chromium. Sin scroll horizontal en ningún ancho (`scrollWidth` = ancho). Sin JavaScript (Chromium, 390 y 1440): los 5 temas abiertos, sin scroll horizontal.

| Página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| `/talleres` | diferencia aceptada | diferencia aceptada | igual | igual | 360/390: «Tus datos» +42/+14 px por la letra del cuerpo (18 vs 17 px; pedido 1 en `system.css`, con él igual). Calculadora, historia y precios ±1–2 px (componentes compartidos). Sin «−» en la pestaña abierta y línea del paso 5 de 2 px (correcciones de la maqueta) |

## Pruebas

- `pnpm lint`, `pnpm typecheck` (0 errores), `pnpm test` (56 archivos, 487 pruebas) y `pnpm security` (7/7) en verde.
- `e2e/dev-talleres-principal.spec.ts` con `pnpm dev`: **M** escritorio (1440) y celular (390), **O** (1440) en verde; los demás proyectos se saltan.
- WebKit no se pudo correr aquí (no está instalado); el script no usa nada de la lista de `24 §5` (`matchMedia` con `addListener` de respaldo, sin `innerHTML`, sin `requestIdleCallback`).
