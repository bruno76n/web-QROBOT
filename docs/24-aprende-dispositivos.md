# 24 · Aprende · Dispositivos y navegadores

Cómo se adapta cada parte de Aprende al celular, la tableta y la computadora, y qué hay que cuidar para que todo (sobre todo los filtros y el buscador) funcione igual en Chrome y en Safari. Las maquetas de `reference/mockups/aprende/` ya siguen estas reglas: ante la duda, se mide ahí.

## 1. Anchos

| Nombre | Ancho | Se prueba en | Qué cambia |
|---|---|---|---|
| Celular chico | ≤ 480 px | 360 y 390 | El logo del header queda solo con la cabeza de Q-404 |
| Celular | ≤ 760 px | 390 y 430 | Una columna; tablas de datos como tarjetas; resultados del buscador a pantalla completa; chips en una fila que se desliza; header de 56 px |
| Tableta | 761–1099 px | 820 y 1024 | Una columna ancha; sin columna lateral; tabla de filamentos en tarjetas de 2 columnas |
| Escritorio | ≥ 1100 px | 1280 y 1440 | Columna lateral fija (índice y relacionadas); calculadora con resultado fijo a la derecha |
| Pantalla grande | ≥ 1440 px | 1920 | Nada nuevo: el contenido se queda en 1360 px de ancho máximo |

Los cortes 760 y 900 ya existen en la web (`--top` y la pestaña negra del header); Aprende suma 480, 820 (listas en dos columnas de texto) y 1100 (columna lateral).

Pruebas de Playwright: **390, 820 y 1440** (como el resto de la web, `16 §6`) y además **360** en la portada, la tabla de filamentos y ¿Cabe mi pieza?

## 2. Reglas generales

1. **Primero el celular** (`03 §1`): el CSS base es el de 390 px y se abre hacia escritorio con `min-width`. Las excepciones con `max-width` usan los cortes de §1.
2. **Margen lateral** `max(var(--gutter), env(safe-area-inset-left))` (y derecha): respeta la muesca del iPhone en horizontal. El `<meta name="viewport">` lleva `viewport-fit=cover`.
3. **Nada se sale de lado**: ninguna página tiene scroll horizontal en ningún ancho. Lo único que puede deslizarse de lado es: tablas dentro de su contenedor, filas de chips, letras del glosario y chips de temas del buscador. Todo hijo de grid o flex que tenga texto o tablas lleva `min-width: 0`.
4. **Objetivos táctiles de 44 px** como mínimo (`03 §7`): chips, interruptores, letras, botones de copiar, ligas de las migas y del índice. En pantallas táctiles (`@media (pointer: coarse)`) los chips pasan de 40 a 44 px.
5. **Campos con letra de 16 px o más** (17 px en Aprende). Con menos, Safari del iPhone hace zoom al tocar el campo.
6. **Teclado numérico**: medidas y montos con `inputmode="decimal"` (no `type="number"`). Se acepta coma o punto («24,7» = 24.7), porque el iPhone en español muestra coma.
7. **Hover solo donde hay mouse**: efectos y atajos de teclado (⌘K) dentro de `@media (hover: hover) and (pointer: fine)`. En táctil nada depende de pasar el dedo.
8. **Alto de pantalla**: nada usa `100vh` para cuadros que deben caber en la pantalla del celular (en Safari incluye la barra de direcciones). La hoja del buscador usa `position: fixed; inset: 0`.
9. **Movimiento reducido**: con `prefers-reduced-motion` no hay transiciones ni scroll suave.
10. **Zoom al 200 %**: ningún texto vive en cajas de alto fijo; todo se puede leer y usar con el texto al doble.
11. **Horizontal en celular** (alto ≤ 500 px): el header sigue fijo; la hoja del buscador ocupa toda la pantalla y su lista hace scroll.
12. **Imágenes**: Q-404 con `width` y `height` (sin saltos), `loading="lazy"` salvo en la portada, y `srcset` de 265 y 530 px.

## 3. Por componente

| Componente | Celular (≤ 760) | Tableta (761–1099) | Escritorio (≥ 1100) |
|---|---|---|---|
| **Header** | 56 px de alto. Logo · Catálogo · Aprende · Cotizar en una fila (≤ 480: logo sin nombre; Cotizar sin flecha; sobre la portada, solo el botón de Instagram, sin «Visita nuestras redes:») | 68 px. A ≤ 900 la pestaña negra se vuelve ligas normales | 68 px, pestaña negra al centro |
| **Barra del buscador** (páginas internas) | Bajo el header, todo el ancho, 52 px de alto. Sin atajos de teclado | Igual, hasta 720 px de ancho | Igual, con ⌘K a la derecha del campo |
| **Buscador grande** (portada) | 62 px de alto | 76 px | 76 px, hasta 860 px de ancho |
| **Resultados del buscador** | **Hoja a pantalla completa**: campo arriba con «Cerrar», chips de tema, lista con scroll propio; la página de atrás no se mueve (`html.lock`) | Lista bajo el campo, máximo 70 % del alto de la pantalla | Igual que tableta |
| **Encabezado de página** | `h1` de 36 px; «En corto» a todo lo ancho | `h1` crece con el ancho (`clamp`) | `h1` hasta 72 px; «En corto» hasta 760 px |
| **En esta página** | Plegable (`<details>`) arriba del contenido; se cierra al tocar una liga | Igual | En la columna derecha, fija al hacer scroll |
| **También te puede servir** | Al final, después de las preguntas | Igual | Columna derecha, bajo el índice |
| **Texto** | 17 px; líneas de 68 caracteres como máximo | 18 px | 18 px |
| **Tablas del contenido** | Scroll de lado dentro de su caja; si tienen 3 columnas o más, la primera columna se queda fija; aviso de que siguen a la derecha (se desvanece el borde derecho) | Scroll de lado si hace falta | Completas |
| **Chips de filtro** | Una sola fila que se desliza, con el primer chip alineado al margen | Varias filas | Varias filas |
| **Lista de respuestas del tema** | Título arriba, frase abajo | Desde 820 px: título a la izquierda, frase a la derecha | Igual que 820 |
| **Tabla de filamentos** | Una tarjeta por material (nombre arriba; datos en dos columnas) | Tarjetas en 2 columnas | Tabla completa |
| **Tabla de impresoras** | Una tarjeta por impresora | Tabla sin Volumen ni Notas | Tabla completa |
| **¿Cabe mi pieza?** | Ancho, fondo y alto en una fila de 3; cm/mm abajo | Los 4 en una fila | Igual que tableta |
| **Calendario de mantenimiento** | Un bloque debajo de otro | Desde 820 px: periodo a la izquierda, tareas a la derecha | Igual |
| **Calculadora** | Campos en una columna; **barra fija abajo** con el costo y «Ver detalle» | Campos en dos columnas; resultado debajo | Campos en dos columnas; resultado fijo a la derecha |
| **Glosario** | Letras en una fila que se desliza, fija bajo el header | Letras en varias filas, fijas bajo el header | Igual |
| **Cuadros de Q-404** | Q-404 de 52 px | 72 px | 72 px |
| **Dato curioso de la portada** | Q-404 de 76 px | 120 px | 120 px |
| **Temas de la portada** | Una columna | Una columna | Dos columnas |
| **Llamado (WhatsApp)** | Texto arriba, botón a todo lo ancho | Texto y botón en una fila | Igual |
| **Nota de maqueta** | (Solo maquetas) a todo lo ancho abajo | Esquina inferior derecha | Igual |

**Tablas que se vuelven tarjetas.** Safari quita el significado de tabla a los lectores de pantalla cuando una tabla cambia su `display` con CSS. Por eso la `<table>` lleva `role="table"` (y sus filas y celdas, `role="row"` y `role="cell"` si se cambian a bloques), y cada celda lleva `data-label` con el nombre de su columna, que se muestra encima del dato en la tarjeta.

## 4. Navegadores

| Navegador | Soporte |
|---|---|
| Chrome, Edge (las 2 últimas versiones) | Completo |
| Firefox (las 2 últimas) | Completo |
| **Safari 16.4 o más nuevo** (iOS 16.4 o más nuevo) | **Completo**. Es lo mínimo que pide Tailwind CSS 4, con el que está hecha toda la web |
| Safari 14 a 16.3 | **Funcional**: filtros, buscador, ¿Cabe mi pieza? y calculadora funcionan; el diseño puede verse incompleto (Tailwind 4 usa capas de CSS y funciones que esos Safari no entienden). Afecta a toda la web, no solo a Aprende |
| Safari 13 o anterior, Internet Explorer | No se prueba |

Para que los scripts sí corran desde Safari 14, en `astro.config.mjs`: `vite: { build: { target: ['chrome87', 'edge88', 'firefox78', 'safari14'] } }` (Vite 7 rechaza `es2020` junto a navegadores: ya lo cubren). Vite 7 compila por defecto para Safari 16 en adelante. Si `pnpm size` se pasa del presupuesto por esto, se anota en `decisiones.md` y se usa `safari15`.

## 5. Reglas para que los filtros funcionen en Safari

Los filtros, el buscador y las herramientas son `<script>` sin React (`21 §6`). Para que funcionen igual en Chrome y en Safari 14 o más nuevo:

| No usar (o usar con reemplazo) | Problema en Safari | Qué hacer |
|---|---|---|
| **`requestIdleCallback`** | **No existe en Safari** (ninguna versión, ni en iPhone ni en Mac). Next.js lo usa por dentro con un reemplazo; si un filtro lo llama directo, en Chrome funciona y en Safari se rompe | `const ric = window.requestIdleCallback?.bind(window) ?? ((cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1));` |
| `AbortSignal.timeout(ms)` | Llega en Safari 16 | `AbortController` + `setTimeout(() => ctrl.abort(), ms)` |
| `Array.prototype.at`, `structuredClone`, `Object.hasOwn`, `Array.prototype.findLast`, `toSorted` | Llegan en Safari 15.4 o 16 | `arr[arr.length - 1]`, `JSON.parse(JSON.stringify(x))`, `Object.prototype.hasOwnProperty.call` |
| Expresiones regulares con *lookbehind* (`(?<=…)`, `(?<!…)`) | Antes de Safari 16.4 **todo el script deja de cargar** (error de sintaxis), no solo esa línea | Reescribir sin *lookbehind*. Revisar también las librerías que se agreguen |
| `mediaQueryList.addEventListener('change')` | Llega en Safari 14 | `if (mq.addEventListener) … else mq.addListener(…)` |
| Fechas en texto como `'2026-11-13 10:00'` | Safari devuelve `Invalid Date` (filtros por fecha que no filtran nada) | ISO con `T` (`'2026-11-13T10:00'`) o números |
| `new Intl.Segmenter`, `color-mix()`, `:has()` en CSS de lógica | Llegan en Safari 14.1, 16.2 y 15.4 | No se usan en Aprende |
| `<dialog>`, `inert`, `popover` | Llegan en Safari 15.4, 15.5 y 17 | La hoja del buscador es un `div` con `role="listbox"` y manejo de foco propio |
| `:focus-visible` | Llega en Safari 15.4 | Regla `:focus` antes y `:focus:not(:focus-visible)` después (como las maquetas) |
| `gap` en flexbox | Llega en Safari 14.1 | En Safari 14.0 los chips quedan pegados; se acepta (Tailwind ya lo usa en toda la web) |
| `backdrop-filter` | Necesita `-webkit-backdrop-filter` antes de Safari 18 | Ambos prefijos (o no usarlo) |
| `position: sticky` en celdas de tabla | Funciona desde Safari 13 con `position: -webkit-sticky` antes | Declarar ambas |
| `overflow: hidden` en `<body>` para bloquear el scroll | En iPhone la página de atrás todavía puede moverse con el dedo | La hoja del buscador es `position: fixed; inset: 0` con su propio scroll y `overscroll-behavior: contain`; el fondo lleva `overflow: hidden` en `<html>` |
| `navigator.clipboard.writeText` | Solo con un toque del usuario y en HTTPS | Llamarlo dentro del `click`; si falla, seleccionar el texto (`document.execCommand('copy')` como último recurso) |
| Eventos de teclado con `keyCode` | Obsoleto | `event.key` |

Además, en todos los scripts de Aprende:
- Arrancar en `astro:page-load` y limpiar en `astro:before-swap` (`07 §1`): con View Transitions, un filtro que no se limpia deja de responder al volver a la página, en cualquier navegador.
- Datos de las filas en atributos `data-*` y filtros que solo ponen `hidden`; nada de volver a armar el HTML con `innerHTML` (`13 §6`).
- Nada de `?.` ni `??` en los scripts sin compilar de las maquetas; en el código de la web sí se pueden usar (Vite los compila según §4).

## 6. Pruebas en Safari

1. **Playwright con WebKit**: agregar un proyecto `webkit` (iPhone 13, 390 px) en `playwright.config.ts` y correr ahí los flujos de Aprende **H a L** (`21 §15`), además de Chromium. WebKit de Playwright es el motor de Safari.
2. **ES-Check o el build**: `pnpm build` con el `target` de §4; una prueba busca en `dist/` que no queden `requestIdleCallback(` sin reemplazo ni expresiones con `(?<=` / `(?<!`.
3. **A mano antes de publicar** (informe de la fase 8): en un iPhone real y en Safari de Mac, abrir `/aprende`, buscar «petj», filtrar filamentos (Exterior y sol + Mi impresora es abierta → solo PETG), ¿Cabe mi pieza? con 25 × 10 × 5 cm y la calculadora con el ejemplo ($21.04).

## 7. Maquetas

| Archivo | Muestra |
|---|---|
| `index.html` | Lista de maquetas |
| `portada.html` | Portada con el buscador funcionando (prueba «petj», «se despega», «p1s», «xyz») |
| `tema.html` | Tema con chips que filtran sus respuestas |
| `tema-con-tabla.html` | Filamentos: tabla, chips, interruptores y tarjetas |
| `mantenimiento.html` | Tema con calendario filtrable |
| `ficha.html` | Ficha de material (PLA) |
| `problema.html` | Problema con revisión de 3 minutos |
| `articulo-clientes.html` | Artículo para clientes (por qué cuesta más que su plástico) |
| `impresoras.html` | Volumen de impresión y ¿Cabe mi pieza? |
| `calculadora.html` | Calculadora de costo |
| `glosario.html` | Glosario A–Z |
| `buscar.html` | Resultados y estado sin resultados (`?q=xyz`) |

Se generan con el contenido real de `content/aprende/` (`_datos.js`, `_aprende.css`, `_aprende.js`). Se abren desde la carpeta del proyecto, porque el logo y Q-404 se leen de `assets/`. Sus scripts siguen §5 y están revisados con ES-Check (ES2017).
