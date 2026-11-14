# 21 · Aprende

Sección de respuestas sobre impresión 3D: filamentos, máquinas, laminado, fallas, mantenimiento, diseño, acabado, seguridad, encargos y negocio. El contenido completo, con sus fuentes, está en `23`; el buscador en `22`.

## 1. Qué es

- Una **biblioteca de respuestas**, no un foro: no hay cuentas, comentarios ni preguntas públicas. Cada página contesta una duda concreta.
- **El buscador es lo principal** (`22`). Se escribe la duda o el problema y salen las respuestas al teclear.
- Para dos públicos: quien encarga una pieza (entiende materiales, tiempos y precio) y quien tiene impresora o taller (temperaturas, fallas, costos).
- Q-404 aparece aquí (cuadros de «Dato curioso» y «Truco», y el estado sin resultados), porque Aprende es parte del taller.
- El contenido vive en **D1** y se edita desde el panel (fase 8). La primera carga sale de los archivos de `content/aprende/` con `pnpm learn:import` (§8).

## 2. Rutas

| Ruta | Página | Se genera |
|---|---|---|
| `/aprende` | Portada | En el servidor (D1) |
| `/aprende/[tema]` | Página del tema | En el servidor; tema que no está en `src/config/learn.ts` → 404 |
| `/aprende/[tema]/[pagina]` | Ficha, artículo o problema | En el servidor; no existe o no está publicada → 404 |
| `/aprende/glosario` | Glosario | En el servidor |
| `/aprende/buscar?q=…&tema=…` | Resultados sin JavaScript | En el servidor, `noindex` (`22 §8`) |
| `/api/aprende/buscar` | JSON del buscador | Worker (`22 §7`) |
| `/admin/aprende` | Panel · Aprende | Isla del panel (fase 8) |

Archivos: `src/pages/aprende/index.astro`, `src/pages/aprende/buscar.astro` y `src/pages/aprende/[...slug].astro` (resuelve tema, página y glosario por el `slug` de `learn_pages`). Ningún tema puede llamarse `buscar`.

## 3. Temas

Fijos, en `src/config/learn.ts` (`09`: lo fijo no va en la base). El orden es el de la portada y el del filtro del buscador.

| id | Nombre | Frase de la portada |
|---|---|---|
| `filamentos` | Filamentos | PLA, PETG, TPU, ASA, nylon. Temperaturas, secado y cómo guardarlos. |
| `problemas` | Cuando algo sale mal | Primera capa que no pega, hilos, esquinas levantadas, boquilla tapada. |
| `maquinas` | Máquinas | Tipos de impresora, boquillas, placas, tamaño de impresión y cuál comprar. |
| `laminado` | Laminado | Altura de capa, paredes, relleno, soportes y orientación. |
| `mantenimiento` | Mantenimiento | Limpiar la cama, cambiar la boquilla, lubricar los ejes. |
| `modelos` | Modelos y diseño | Dónde conseguir modelos, licencias para vender y reglas de diseño. |
| `acabado` | Acabado | Quitar soportes, lijar, pintar y pegar. |
| `seguridad` | Seguridad | Ventilación, temperaturas, incendio y piezas para usos de riesgo. |
| `encargar` | Si vas a encargar una pieza | Qué mandar para cotizar, cuánto tarda y por qué cuesta más que su plástico. |
| `negocio` | Negocio | Costo de una pieza, precio, fallos e inventario de filamento. |
| `glosario` | Glosario | Palabras de impresión 3D en español y en inglés. |

## 4. Pantallas

Referencia visual: `reference/mockups/aprende/`, una maqueta por tipo de pantalla con el contenido real (lista en `24 §7`). Cómo se adapta cada parte a celular, tableta y escritorio, y qué cuidar en Safari: `24`. Diferencias ya decididas con las maquetas en §11.

### 4.1 Partes comunes

| Parte | Dónde | Qué lleva |
|---|---|---|
| Buscador | Arriba, en todas las páginas de Aprende | Campo compacto que abre los resultados (`22 §9`). En la portada es grande |
| Migas | Arriba | Aprende › Tema › Página (componente `Breadcrumbs` que ya existe) |
| Título | `h1` | `title` |
| Subtítulo | Bajo el `h1` | `subtitle` y «Revisado en {mes} de {año}» (`reviewed`) |
| En corto | Recuadro lila (`--lilac` nuevo, `#f1ecfd`) | `summary`; es lo que sale en el buscador |
| Chips | Bajo «En corto» | Solo en temas con `chips` y en las tablas de datos (§6) |
| Cuerpo | Centro | Markdown de la página (§5) |
| En esta página | Columna derecha en escritorio (≥ 1100 px); arriba y plegada en celular | Los `h2` del cuerpo, con liga a su ancla |
| Preguntas | Al final | `<details>` por pregunta (`faqs`), con ancla `#pregunta-N` |
| También te puede servir | Columna derecha o final | `related` (3 o 4 ligas con título y tema) |
| Fuentes | Al final, letra chica | `sources` con nombre y liga (otra pestaña) |
| Llamado | Último bloque | Según `cta` (§4.6) |

### 4.2 Portada (`/aprende`)

1. Titular «¿Se despegó? ¿Se tapó? ¿Salieron hilos?» (`h1`), el `summary` debajo y el buscador grande con sugerencias (`suggestions` de la página `index`). Atajos ⌘K / Ctrl+K y «/».
2. **Temas**: lista con nombre, frase (§3) y número de páginas publicadas de cada tema. Título del bloque: «Temas».
3. **Filamentos de un vistazo**: PLA, PETG, ABS, ASA, TPU y PC con boquilla, cama y calor que aguanta (de `learn_datasets › filamentos`). Liga «Tabla completa» a `/aprende/filamentos`.
4. **Más buscado**: las 6 ligas de `featured`. Más adelante puede salir de las búsquedas reales; hoy es fija.
5. **Dato curioso**: uno de `learn_datasets › datos-curiosos`, elegido por el día del año (así el HTML es el mismo todo el día).
6. Preguntas de la página `index` y el llamado de WhatsApp.

### 4.3 Página de tema (`/aprende/[tema]`)

1. Encabezado común. 2. Cuerpo del tema (algunos traen tabla de datos o lista). 3. **Páginas del tema**: lista con título y `summary`, en orden (`order`). Si el tema tiene `chips`, los chips filtran esta lista por el campo `filters` de cada página (script, sin recargar; «Todas» por defecto). 4. Preguntas, llamado.

Sin páginas publicadas: «Todavía no hay respuestas en este tema.» con liga a WhatsApp.

### 4.4 Ficha, artículo y problema (`/aprende/[tema]/[pagina]`)

Encabezado común, cuerpo, columna «En esta página» y «También te puede servir», preguntas, fuentes y llamado. Los problemas (`kind = problem`) llevan además, arriba del cuerpo, la línea «Revisión de 3 minutos» con liga a `/aprende/problemas` (cama limpia, filamento seco, placa y material correctos).

### 4.5 Glosario (`/aprende/glosario`)

Letras A–Z arriba (las que tienen términos son ligas; las demás, grises). Cada término: nombre, nombre en inglés entre paréntesis, definición y liga «Ver más» a su página. Ancla por término (`#volumen-de-impresion`).

### 4.6 Llamados (`cta`)

| `cta` | Muestra |
|---|---|
| `whatsapp` | «¿Necesitas una pieza? Dinos qué necesitas y te decimos material, precio y fecha.» + botón verde «Cotizar por WhatsApp». Si la página trae `ctaText`, ese texto reemplaza la frase |
| `system` | Llamado a Para talleres con `ctaText` y botón a `/talleres`. **Solo con `systemVisible`** (`25 §2`): mientras el sistema no salga no se muestra nada |
| `none` | Nada |

El mensaje de WhatsApp sale de `src/lib/whatsapp.ts` (`learnQuoteMessage(title)`: «Hola, vi «{título}» en su página y quiero cotizar una pieza.»).

## 5. Contenido en Markdown

El cuerpo de cada página es Markdown con tablas (GFM). **No se usa `set:html`**: el Markdown se convierte a un árbol propio y Astro lo pinta con componentes.

1. **Al importar o guardar** (nunca en cada visita, por el CPU del Worker): `src/lib/learn/markdown.ts` convierte el texto con `mdast-util-from-markdown` + `micromark-extension-gfm` + `mdast-util-gfm` y lo pasa por una **lista blanca** que produce `LearnNode[]` (JSON). Se guarda en `learn_pages.body_ast`.
2. **Al mostrar:** `src/components/learn/Content.astro` recorre el árbol con `Node.astro` (recursivo).

| Markdown | Se pinta como | Reglas |
|---|---|---|
| `## Título`, `### Título` | `h2`, `h3` con `id` (slug del texto) | `#` y `####` o más se bajan/suben a `h2`/`h3` |
| Párrafo, **negrita**, *cursiva*, `código` | `p`, `strong`, `em`, `code` | |
| Listas (con y sin número) | `ul`, `ol` | |
| Tabla | `table` dentro de un contenedor con scroll horizontal | Primera fila = encabezado |
| Liga | `a` | Solo `/aprende/…`, `/catalogo…`, `/producto/…`, `#…` y `https://`. Las externas abren en otra pestaña con `rel="noopener"`. Cualquier otra (`javascript:`, `data:`, `http:`) se pinta como texto |
| Bloque de código | `pre` + botón «Copiar» | Sin resaltado de sintaxis |
| `> **Dato curioso.** …` | Cuadro verde con Q-404 (render de 265 px) | Lo mismo para `**Truco.**` (lila) |
| `> **Cuidado.** …` | Cuadro amarillo sin Q-404 | |
| Otra cita | `blockquote` normal | |
| `[[tabla:filamentos]]`, `[[tabla:impresoras]]`, `[[tabla:mantenimiento]]` | Tabla de datos con filtros (§6) | Párrafo que solo contiene la marca |
| `[[cabe-mi-pieza]]` | Herramienta ¿Cabe mi pieza? (§6.2) | |
| `[[calculadora-costo]]` | Calculadora de costo (§6.4) | |
| HTML, imágenes, notas al pie, casillas | Se descartan (el HTML queda como texto) | |

`markdown.ts` también da: la lista de `h2` para «En esta página» y el texto plano para el buscador (`22 §4`).

## 6. Datos interactivos

Viven en `learn_datasets` (JSON) y se pintan en HTML; los filtros son un `<script>` por componente (arranca en `astro:page-load`, limpia en `astro:before-swap`). Sin React.

### 6.1 Tabla de filamentos (`filamentos`)
- Chips de una elección (Todos · Decoración · Uso diario · Exterior y sol · Calor · Flexible · Piezas mecánicas · Soportes) y tres interruptores, según `chips` y `toggles` del JSON: «Mi impresora es abierta» oculta los de `printer = enclosed` (ABS, ASA, PC, nylon, PET-CF: Bambu Lab no recomienda imprimirlos en abierta; el PETG es `enclosed-better` y sí se queda), «Uso AMS» oculta los que no entran al AMS y «Solo boquilla de latón» oculta los que piden endurecida.
- Columnas en escritorio: Material (liga a su ficha) · Usos · Boquilla · Cama · Calor que aguanta (con su nivel de `heatLevels`) · Golpes · Secado · Impresora (Abierta o cerrada · Mejor cerrada · Cerrada) · Endurecida · AMS. En tableta, tarjetas en 2 columnas; en celular, una tarjeta por material (`24 §3`).
- Sin resultados: «Ningún filamento cumple todo eso. Quita un filtro.»

### 6.2 Tabla de impresoras y ¿Cabe mi pieza? (`impresoras`)
- Chips de tamaño, selector de marca, interruptor «Solo cerradas» y orden por volumen.
- **¿Cabe mi pieza?**: ancho, fondo y alto con selector mm/cm. Al escribir, cada fila marca «Cabe de pie», «Cabe acostada» o nada, y arriba: «Cabe en N de M impresoras». Lógica pura en `src/lib/learn/fit.ts`: medida útil = ancho − 2 × `fitMarginMm` y fondo − 2 × `fitMarginMm` (5 mm por lado; el alto no lleva margen). La pieza cabe si alguna de sus 6 posiciones entra. «De pie» = con el alto que se escribió (girarla 90° sobre la cama sigue siendo de pie); «acostada» = otra medida queda como alto. No se calcula la diagonal.

### 6.3 Calendario de mantenimiento (`mantenimiento`)
Chips por periodo; cada bloque con su lista de tareas.

### 6.4 Calculadora de costo
En `negocio/costo`. El componente es compartido con Para talleres: `src/components/site/CostCalculator.astro` (`25 §6`). Lógica en `src/lib/cost.ts` con la fórmula de `23 › negocio/costo`:

| Entrada | Por defecto (ejemplo) |
|---|---|
| Gramos | 25 |
| Precio del rollo y su peso | $450 por 1,000 g |
| Purga | 5 % |
| Horas | 1.5 |
| Consumo de la impresora | 150 W |
| Precio del kWh | $3.00 |
| Precio de la impresora y horas de vida | $20,000 · 5,000 h |
| Mantenimiento por hora | $1.00 |
| Extras | $0 |
| Fallos | 5 % |

Salida: material, electricidad, máquina, extras, subtotal y **costo** (con centavos, `$21.04`). Se recalcula al escribir. Nada se guarda ni se manda al servidor.

## 7. Datos en D1

Migración `0007`. Detalle de columnas en `09` (se agrega en la fase 6).

| Tabla | Qué guarda |
|---|---|
| `learn_pages` | Una fila por página: `id`, `slug` (único; `''` = portada), `kind` (`home` · `section` · `sheet` · `article` · `problem` · `glossary`), `topic`, `title`, `subtitle`, `summary`, `body_md`, `body_ast` (JSON), `toc` (JSON), `search_text` (texto normalizado para la búsqueda en D1), `filters`, `chips`, `tags`, `related`, `sources`, `extra` (JSON: `featured`, `suggestions`, `terms`), `audience` (`all` · `shops` · `clients`), `cta`, `cta_text`, `published`, `sort_order`, `reviewed`, `edited_in_panel`, `created_at`, `updated_at` |
| `learn_faqs` | Preguntas: `id`, `page_id` (borrado en cascada), `position`, `question`, `answer` |
| `learn_datasets` | Tablas de datos: `key` (`filamentos`, `impresoras`, `mantenimiento`, `datos-curiosos`, `buscador`), `data` (JSON), `updated_at` |
| `learn_sources` | Fuentes: `id`, `name`, `url` (nula si no tiene liga) |
| `learn_search_misses` | Búsquedas sin resultado: `day`, `query` (normalizada), `count`; PK (`day`, `query`); se suma con `ON CONFLICT` como `whatsapp_clicks` |

Índices: `learn_pages(slug)` único · `learn_pages(topic, published, sort_order)` · `learn_faqs(page_id, position)` · `learn_search_misses(day)`.

`settings` suma `learn_index_synced_at` y `learn_index_docs` (`22 §6`).

## 8. Importar el contenido (`pnpm learn:import`)

`scripts/learn-import.ts` lee `content/aprende/` (`paginas/**/*.md`, `datos/*.json`, `fuentes.json`, `buscador.json`; formato en `content/aprende/README.md`).

1. Valida cada archivo con Zod (`src/lib/learn/content.ts`): campos obligatorios, `topic` de `src/config/learn.ts`, `related` y `sources` que existan, marcas `[[…]]` conocidas, ligas internas que existan (si no, aviso). Un error detiene todo y dice archivo y campo.
2. Convierte cada cuerpo con `markdown.ts` (§5) y arma `search_text`.
3. Escribe en un solo `batch` por tabla: inserta las páginas nuevas y actualiza las existentes **salvo las que tienen `edited_in_panel = true`** (se listan como «no se tocó»). Con `--overwrite` también las reemplaza. Nunca borra páginas que no estén en los archivos, salvo con `--prune`.
4. Datos, fuentes y buscador: reemplaza las filas por las de los archivos.
5. Imprime un resumen: nuevas, actualizadas, no tocadas, avisos.

Destino: **local** por defecto (como la semilla, con `getPlatformProxy`). Con `--remote --yes` genera `.wrangler/learn-import.sql` y lo aplica con `wrangler d1 execute quick-robot-web --remote --file` (`17`). `pnpm dev` corre `learn:import --if-empty`. Con `--sync`, al terminar actualiza el índice del buscador (`22 §6`).

## 9. Consultas (`src/server/queries/learn.ts`)

| Función | Devuelve | La usa |
|---|---|---|
| `getLearnHome()` | Página `index`, temas con conteo, filas de filamentos de un vistazo, dato del día | Portada |
| `getLearnTopic(topic)` | Página del tema y sus páginas publicadas (título, `summary`, `filters`, slug) | Tema |
| `getLearnPage(slug)` | Página publicada con preguntas, relacionadas (título y tema), fuentes y los datos que pidan sus marcas `[[…]]`; `null` si no existe o está oculta | Página, glosario |
| `listLearnSitemap()` | Slugs publicados con `updated_at` | Sitemap |
| `searchLearnD1(query, topic?)` | Resultados de la búsqueda sin Meilisearch (`22 §8`) | Buscador |

Una página hace como máximo 3 consultas (página, preguntas, relacionadas y datos en un `batch`).

## 10. Textos

Van en `src/i18n/es.ts › learn`. Los de las páginas, en la base. Reglas de redacción del contenido en `23 §1` (palabras neutras, títulos con sustantivo directo). Textos de la interfaz:

| Clave | Texto |
|---|---|
| `home.headline` | ¿Se despegó? ¿Se tapó? ¿Salieron hilos? |
| `searchPlaceholder` | Busca un material, un problema o una pregunta |
| `searchShort` | Buscar en Aprende |
| `topics` | Temas |
| `pagesCount` | {n} respuestas · 1 respuesta |
| `glance` · `glanceAll` | Filamentos de un vistazo · Tabla completa |
| `featured` | Más buscado |
| `summary` | En corto |
| `onThisPage` | En esta página |
| `related` | También te puede servir |
| `faq` | Preguntas |
| `sources` | Fuentes |
| `reviewed` | Revisado en {mes} de {año} |
| `fact` · `tip` · `careful` | Dato curioso · Truco · Cuidado |
| `copy` · `copied` | Copiar · Copiado |
| `quickCheck` | Revisión de 3 minutos |
| `emptyTopic` | Todavía no hay respuestas en este tema. |
| `cta.text` · `cta.button` | ¿Necesitas una pieza? Dinos qué necesitas y te decimos material, precio y fecha. · Cotizar por WhatsApp |
| `fit.*` | ¿Cabe mi pieza? · Ancho · Fondo · Alto · mm · cm · Cabe de pie · Cabe acostada · Cabe en {n} de {m} impresoras · No cabe en ninguna: se divide en partes |
| `cost.*` | Etiquetas de §6.4 · Costo · Subtotal |
| `noResultsTable` | Ningún filamento cumple todo eso. Quita un filtro. |
| Buscador | `22 §9` |

## 11. Diferencias con las maquetas

Las maquetas (`reference/mockups/aprende/`) ya tienen el header de la web (Catálogo · Aprende), Q-404 real, los 11 temas y el contenido de `content/aprende/`. Lo que cambia en la web:

| Maqueta | Web |
|---|---|
| El buscador busca en una lista dentro del navegador (`_datos.js`) | Busca en `/api/aprende/buscar` (`22`); el aspecto y el comportamiento son los mismos |
| `buscar.html` arma los resultados con JavaScript leyendo `?q=` | `/aprende/buscar` los arma en el servidor (funciona sin JavaScript) |
| El dato curioso de la portada es siempre el primero | Uno por día (§4.2) |
| Header fijo (`position: fixed`) | El header de la web (`sticky`), como ya está |
| Footer resumido | El footer real de la web |
| Ligas a páginas sin maqueta llevan a `#sin-maqueta-…` | Ligas reales |
| Recuadros amarillos | Notas de la maqueta; no se construyen |
| Dos citas seguidas («Dato curioso» y «Truco») en un solo cuadro | Un cuadro por cita, como están en el contenido (§5) |
| `articulo-clientes.html`: foto de Q-404 junto a «Q-404 por dentro» | Sin foto: el cuerpo no lleva imágenes (§5) |
| `buscar.html` con preguntas, términos e impresoras en los resultados | Con Meilisearch, igual; con el respaldo en D1, solo páginas (`22 §8`) |
| Etiqueta «Dato curioso» en verde `#00873a` sobre menta | Verde más oscuro (`--green-dd`): el de la maqueta no llega a 4.5:1 de contraste |
| «¿Tienes taller?» y llamados a Quick Cerebro | No aparecen en las maquetas; en la web quedan ocultos hasta que salga el sistema (`site.system.enabled`) |

## 12. SEO

- `<title>`: «{título} · Aprende · Quick Robot» (portada: «Aprende · Quick Robot»). `description`: `summary`. Imagen al compartir: la de marca.
- JSON-LD: `BreadcrumbList` en todas; `Article` (`headline`, `description`, `dateModified` = `updated_at`, `inLanguage: es-MX`, `author` y `publisher` = Quick Robot) en fichas, artículos y problemas; `DefinedTermSet` en el glosario.
- Sitemap: `/aprende`, cada tema, cada página publicada (`lastmod = updated_at`) y el glosario. `/aprende/buscar` no va y lleva `noindex`.

## 13. Rendimiento

- JS al abrir en páginas de Aprende: **≤ 25 KB** (como el catálogo; `15 §2`). Buscador, filtros, ¿Cabe mi pieza? y calculadora son `<script>` sin React.
- Lighthouse ≥ 90 en `/aprende`, `/aprende/filamentos` y `/aprende/filamentos/pla`.
- Sin conversión de Markdown en cada visita (§5). Máximo 3 consultas por página.

## 14. Seguridad

- Nada de `set:html` (§5): el árbol solo tiene nodos de la lista blanca y las ligas pasan por la regla de §5.
- Prueba de inyección: un cuerpo con `<script>`, `<img onerror>`, `[x](javascript:alert(1))` y `[x](data:text/html,…)` se guarda y se muestra como texto o sin liga.
- El buscador es la única entrada pública nueva (`22 §7`): Zod, límite de frecuencia, sin guardar nada de la persona.

## 15. Pruebas

| Qué | Casos obligatorios |
|---|---|
| `markdown.ts` | Encabezados con `id` y sin repetir; tabla GFM; los tres cuadros; marca `[[tabla:…]]` sola en su párrafo (y como texto si va con más texto); ligas permitidas y prohibidas; HTML como texto; `toc` y texto plano |
| `fit.ts` | En 256 × 256 × 256: 200 × 100 × 50 → de pie; 100 × 200 × 50 → de pie (girada); 246 × 100 × 50 → de pie; 247 × 100 × 50 → acostada (247 queda de alto); 300 × 20 × 20 → no cabe; 0 o negativo → entrada inválida |
| `cost.ts` | Ejemplo de `23 › negocio/costo` → $21.04 exacto; fallos 0 %; fallos 99 % no divide entre 0 (máximo 90 %) |
| `content.ts` | Archivo válido; tema desconocido; `related` inexistente; marca `[[…]]` desconocida |
| Importador | Primera carga; segunda sin cambios; página editada en el panel no se toca; `--overwrite`; error con archivo y campo |
| Consultas | Página oculta → `null`; tema con y sin páginas; datos de las marcas |
| Flujos (Playwright) | **H** buscar «petj» y abrir PETG · **I** filtrar filamentos (Exterior y sol + impresora abierta → sin ASA) · **J** ¿Cabe mi pieza? 30 × 30 × 30 cm → «Cabe en N de M» · **K** calculadora con el ejemplo → $21.04 · **L** búsqueda sin resultados → Q-404 y liga de WhatsApp con la búsqueda |
| Accesibilidad y rendimiento | axe sin errores serios en portada, tema, ficha, glosario y resultados; `pnpm size` y Lighthouse de §13 |

## 16. Después

- Fotos de cada falla en los problemas (reusar las fotos de R2 con `owner_type = learn`).
- «¿Te sirvió esta respuesta?» con contador por página.
- Editar las tablas de datos desde el panel (hoy se cambian en `content/aprende/datos/` y se importan).
- Llamados a Para talleres: se construyen en la fase 9 y se ven cuando el sistema salga (`25 §13`).
