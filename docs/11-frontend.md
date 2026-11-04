# 11 · Frontend

## 1. Principios

1. **HTML primero.** Todo lo que se puede hacer en un `.astro` sin JavaScript, se hace así. Una isla solo cuando hay estado o interacción real (`07 §3`).
2. **Islas pequeñas y tardías.** `client:visible` por defecto; `client:load` solo arriba de la pantalla y con motivo.
3. **Librerías para lo resuelto** (`06`). Antes de escribir algo interactivo a mano, buscar en la lista.
4. **Textos en `src/i18n/es.ts`**, datos del negocio en `src/config/site.ts`. Un componente nunca lleva un texto o un número de teléfono escrito.
5. **Funciona sin JavaScript** lo esencial: ver productos, precios y pedir por WhatsApp (`04 §7`).
6. **Igual al mockup** en estructura, textos, tamaños y comportamiento, salvo las diferencias decididas (`02 §1`).

## 2. Piezas compartidas

| Componente | Tipo | Notas |
|---|---|---|
| `BaseLayout.astro` | Astro | `<head>` con SEO (`14`), fuente precargada, `ClientRouter`, header, footer, `<main>` |
| `Header.astro` | Astro + `<script>` | Pestaña negra al centro, Cotizar; el `<script>` pone la clase `over-hero` con `IntersectionObserver` (solo en el inicio) |
| `Footer.astro` | Astro | Nombre grande que **ocupa el ancho exacto** (ajuste con `fitty` o `textFit`, o con unidad `cqw`; nunca medir a mano con `getBoundingClientRect` en cada resize) |
| `Logo.astro` | Astro | Inserta `assets/logo-cabeza.svg` |
| `Picture.astro` | Astro | Recibe la foto (de `queries`) y pinta `<img>` con `srcset` de sus versiones, `sizes`, `width`/`height` (sin saltos), `loading="lazy"` salvo que se pida `priority` (hero, primera foto del producto: `fetchpriority="high"`) |
| `ProductCard.astro` | Astro | Foto cuadrada, nombre, frase, "Desde $X", etiqueta "Más pedido" |
| `Price.astro` | Astro | Usa `formatMoney` de `src/lib/money.ts` |
| `ui/*` | React | Generados con shadcn (`npx shadcn add …`) y ajustados a los tokens de `03` (radio 8 px en botones, 20 px en tarjetas) |

## 3. Secciones

| Sección | Implementación |
|---|---|
| Hero | `Hero.astro`. Una portada: `<picture>` con `<source media="(max-width:760px)">` para la de celular. Varias: isla `HeroSlides.tsx` con Embla + `embla-carousel-fade` + `embla-carousel-autoplay` (se pausa con movimiento reducido). El nombre gigante es HTML encima, con la cabeza en SVG al final; una sola línea a cualquier ancho (tamaño en `vw` como el mockup) |
| Navidad | `Navidad.astro` + `<script>` con la lógica de `src/lib/season.ts` (contador cada segundo, posición de hoy y de la fecha límite en la línea). No se pinta fuera de temporada |
| Ideas | `Ideas.astro` envuelve el componente externo (§4) y le pasa las 7 ideas de `src/config/ideas.ts` con `href = "#pedido=<id>"` |
| Video | `Video.astro`. Si `site.video.src` no es `null`, al tocar el botón cambia la portada por el `<video>` y lo reproduce; si es `null`, el botón queda deshabilitado con su `aria-label`. Portada: la foto por defecto del hero desenfocada (`public/brand/`). (En Workers no se puede revisar si un archivo existe, por eso es un dato de `site.ts`) |
| Imprimiendo | `Imprimiendo.astro` + `<script>` con `scroll()` de `motion`: el progreso del scroll mueve un `clip-path` sobre el render y el contador de capas |
| Q-404 | `Q404.astro` + `<script>` que cambia render y link al elegir chip (`src/config/q404.ts`) |
| Alberca | `Alberca.astro` + `<script>`: al tocar, `import('matter-js')`, crea un canvas fijo encima (sin recibir clics), los cuerpos usan los renders de `assets/q404/`; botón "Vaciar", Escape y vaciado automático; mensaje para lectores de pantalla |
| Pedido | `Pedido.astro` + isla `OrderComposer.tsx`: estado local, plurales con `src/lib/plural.ts`, mensaje con `src/lib/whatsapp.ts`; escucha `hashchange` para `#pedido=<idea>` y `#pedido=navidad` y llena los campos; los huecos crecen con el texto (`field-sizing: content` con respaldo de medir con un `span` oculto) |
| Catálogo | Páginas `.astro`; pestañas son links (`CategoryTabs.astro`) |
| Personalizador | `NameMaker.astro` con un `<script>` (sin React, para cumplir el presupuesto de `15 §2`): controles (forma, nombre, color), el link de WhatsApp (`src/lib/customizer.ts` y `src/lib/whatsapp.ts`) y una **vista fija** (SVG 2D de la forma con el nombre). Al tocar la vista o enfocarla, importa `maker3d.tsx`: R3F + drei `Text3D` con `public/fonts/geist-bold.typeface.json` (Geist Bold generada por `scripts/build-font.mjs`, con Ñ, Á, É, Í, Ó, Ú, Ü, A–Z, 0–9 y espacio), forma base (círculo con argolla, estrella, corazón) extruida, `OrbitControls` solo para girar (sin zoom ni desplazamiento), botones ← → para quien no puede arrastrar, y giro automático solo sin `prefers-reduced-motion`. Caracteres permitidos en el nombre: A–Z, Ñ, vocales con acento, Ü, 0–9 y espacio (lo demás se quita al escribir), hasta 10 |
| Galería de producto | `Gallery.astro` con `embla-carousel` (sin React) en un `<script>`: flechas, contador, miniaturas sincronizadas; el HTML ya trae todas las fotos |
| Opciones de producto | `ProductOptions.astro` + `<script>`: color, personalización, cantidad y link de WhatsApp. El HTML trae el link base (cantidad 1, primer color), así que funciona sin JavaScript |

## 4. Componentes externos (21st.dev)

El dueño entrega algunos componentes ya hechos. **No se construyen.** Para que la construcción autónoma no se detenga:

### Lista

| Componente | Archivo esperado | Sección | Datos que recibe | Cambio obligatorio |
|---|---|---|---|---|
| Interactive Hover Links | `src/components/external/HoverLinks.tsx` (o el nombre que traiga; se registra) | Ideas (`04 §2.3`) | `items: { title, description, image, href }[]` | En pantallas táctiles (`(hover: none)` o ≤ 760 px), mostrar la foto de la fila **que esté más cerca de la mitad vertical de la pantalla mientras se hace scroll**; en escritorio queda igual (con mouse) |

Si el dueño agrega otro, se añade una fila aquí con las mismas columnas.

### Reglas

1. **Si el archivo existe** en `src/components/external/` al llegar a su sección: se usa tal cual. Solo se permite: ajustar imports (alias `@/`, `cn`), instalar sus dependencias (registrarlas en `decisiones.md`), adaptar sus props a los datos (con un envoltorio en `components/sections/`, no editándolo) y aplicar el **cambio obligatorio** de la tabla.
2. **Si no existe:** se crea `src/components/external/<Nombre>.placeholder.tsx`, un reemplazo **sencillo** que recibe exactamente los mismos datos (para Ideas: una lista de links con nombre y frase, y la foto a la derecha en escritorio). Se anota en `docs/progreso.md` como "pendiente de componente externo" y **se sigue**.
3. El envoltorio de la sección importa desde `src/components/external/index.ts`, que exporta el real si existe o el reemplazo si no. Cambiar uno por otro es tocar una sola línea.
4. **Último paso de la fase 5** (`fases/fase-5.md`): integrar los componentes que ya estén, aplicar su cambio obligatorio, probar en 390, 820 y 1440, y borrar los reemplazos que ya no se usen. Los que sigan faltando quedan en el informe final como pendientes, **sin detener la fase**.
5. Un componente externo no puede romper las reglas de seguridad (`13`): nada de `dangerouslySetInnerHTML` con datos, nada de cargar scripts de otros dominios. Si trae algo así, se corrige en el envoltorio o se registra el cambio.

## 5. Panel

Isla grande; detalle en `12`. Usa shadcn/ui, TanStack Query sobre las **acciones de lectura** (`actions.admin.listProducts`, `getProduct`, `getHero`, `clickStats`) y acciones de escritura (`10 §3`), todas a través de un solo ayudante (`src/components/admin/lib/call.ts`) que traduce errores a códigos (`10 §5`, `13 §2` punto 5); sonner para avisos.

## 6. Navegación y estados

- `ClientRouter` de Astro para transiciones suaves entre páginas; las islas se vuelven a montar al navegar (probar que Embla y el personalizador limpian sus efectos al salir).
- Los `<script>` de las páginas arrancan en `astro:page-load` y limpian en `astro:before-swap` (`07 §1`); sin eso, el contador, el header, Imprimiendo, Q-404 y la alberca dejan de funcionar después de navegar.
- Links al inicio con `#` hacen scroll suave (respeta movimiento reducido).
- Error en una isla: se muestra el contenido base de esa sección (por ejemplo, la galería deja ver la primera foto), nunca la página en blanco. Cada isla va dentro de un `ErrorBoundary`.

## 7. Accesibilidad

- Semántica: un `h1` por página (en el inicio, el nombre gigante), secciones con `aria-labelledby`.
- Navegación por teclado completa (galería, chips de color, cantidad, pedido, personalizador sin depender del arrastre).
- `prefers-reduced-motion`: sin autoplay de portada, sin animación de scroll, alberca reducida, robot de Navidad quieto.
- Pruebas con axe en las páginas públicas y en el panel (`16 §4`).
