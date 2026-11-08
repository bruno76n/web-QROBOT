# 03 · Diseño

La web se ve **minimalista y de marca**, no de juguete: fondo blanco, mucho espacio, tipografía grande y apretada, líneas finas y color solo donde importa. Los valores salen del mockup (`reference/mockups/index.html`); si algo no está aquí, se mide en el mockup.

## 1. Principios

1. **El producto es el protagonista.** Fotos grandes sobre fondo gris muy claro; nada compite con ellas.
2. **Color de marca en pocos lugares.** Morado y verde (los de Bambu Lab) aparecen en el logo, en Q-404, en los campos para llenar y en el botón de WhatsApp. El resto es negro, gris y blanco.
3. **Sin aspecto infantil.** Nada de botones redondos tipo pastilla, sombras gruesas, contornos negros gruesos ni tipografías de juguete. La personalidad la pone Q-404, no la interfaz.
4. **Primero el celular.** Todo se diseña a 390 px y se abre hacia escritorio.
5. **Movimiento con intención.** Las animaciones explican algo (la impresión capa por capa, el robot que camina hacia la fecha límite) y respetan `prefers-reduced-motion`.

## 2. Tokens

Se declaran como variables CSS y en el tema de Tailwind (`src/styles/global.css`).

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#121214` | Texto principal, botones principales, pestaña del menú |
| `--ink-2` | `#6a6a73` | Texto secundario |
| `--line` | `#e7e7ec` | Bordes y separadores |
| `--soft` | `#f6f6f8` | Fondo de fotos de producto, tarjetas, chat del pedido |
| `--purple` | `#6b3fd4` | Marca; campos para llenar; foco; selección de texto |
| `--green` | `#00ae42` | Marca; botón de WhatsApp (texto `--ink` encima) |
| `--green-l` | `#e3f5e9` | Burbuja del mensaje propio en el pedido |
| `--top` | `68px` | Alto del header |
| `--gutter` | `clamp(20px, 4.5vw, 64px)` | Margen lateral |
| Ancho máximo | `1360px` | Contenido (`.wrap`) |

**Colores de producto** (puntos de color en el selector), en `src/config/colors.ts`:

| id | hex | id | hex |
|---|---|---|---|
| morado | `#6b3fd4` | azul | `#2f6fe0` |
| verde | `#00ae42` | amarillo | `#ffc21a` |
| negro | `#1c1c22` | naranja | `#ff7a30` |
| blanco | `#f3f3f6` | rosa | `#ff8fb3` |
| lila | `#b49af5` | gris | `#9b9ba5` |
| rojo | `#e5352b` | café | `#a8683c` |

## 3. Tipografía

**Solo Geist** (paquete `geist` o `@fontsource-variable/geist`, servida desde el propio sitio, sin Google Fonts).

| Uso | Tamaño | Peso | Interletrado |
|---|---|---|---|
| Cuerpo | 18 px / 1.55 | 400 | normal |
| Títulos de sección (h2) | `clamp(36px, 4.6vw, 68px)` / 1.02 | 600 | −0.04em, `text-wrap: balance` |
| Nombre gigante del hero | `13.4vw`, una sola línea | 600 | −0.068em, interlínea 0.82 |
| Título de tarjeta | 19 px | 600 | −0.015em |
| Texto secundario | 15 px / 1.45 | 400 | — |
| Botón | 16 px | 500 | — |
| Menú | 15 px | 400 | — |

## 4. Componentes visuales

- **Botón principal:** rectángulo negro, esquinas de 8 px, alto mínimo 50 px, flecha `→` que se mueve 4 px al pasar el mouse. Variante verde para WhatsApp. **Nunca** completamente redondo.
- **Header:** blanco y fijo arriba. A la izquierda el logo (cabeza de Q-404 + "Quick Robot"); mientras se ve el hero, en su lugar aparece "Impresión 3D · Guadalajara" y el logo entra al pasar el hero. Al centro, una **pestaña negra** colgando del borde superior (esquinas inferiores de 16 px) con Navidad, Ideas, Catálogo y Q-404. A la derecha, el botón **Cotizar**. En pantallas de menos de 900 px la pestaña se oculta y quedan logo y Cotizar.
- **Doble filete:** dos líneas de 2 px, morada arriba y verde abajo, de 44 px de ancho. Marca los inicios de sección.
- **Tarjeta de producto:** foto cuadrada sobre `--soft` con esquinas de 20 px, nombre, frase corta y "Desde $X".
- **Campos para llenar** (pedido y personalización): texto morado con subrayado morado de 1.5 px, sin caja.
- **Foco:** contorno morado de 2 px a 3 px de distancia en todo lo que se puede tocar.

## 5. Secciones con diseño propio

Detalle de comportamiento en `04 §2`. Lo visual:

| Sección | Diseño |
|---|---|
| Hero | Foto a todo el ancho (alto `max(520px, min(56.25vw, 100svh − header))`), y abajo, encima de la foto, **"Quick Robot" en una sola línea** a todo lo ancho, con la cabeza de Q-404 al final del texto. En celular se usa la foto vertical |
| Navidad | Compacta: contador en mosaicos (días, horas, min, seg), línea de tiempo del 1 de octubre al 24 de diciembre con un Q-404 caminando y la marca de la fecha límite; 4 tarjetas de regalo |
| ¿Qué se te antoja? | Lista grande de ideas; al pasar el mouse (o al hacer scroll en celular) aparece la foto inclinada (componente externo) |
| Video | Espacio 16:9 ancho con la portada desenfocada, botón "Dale play 0:14" y tres datos (horas de impresión, segundos de video, 0.2 mm por capa) |
| Imprimiendo | Q-404 que se "imprime" capa por capa al hacer scroll, con contador de capas |
| Q-404 | "Q-404" gigante en morado, el robot al centro y notas que señalan sus partes con líneas finas; chips de colores debajo |
| Alberca | Texto centrado y el botón "No aprietes este botón" |
| Pedido | Conversación estilo WhatsApp sobre fondo `--soft`, con los huecos para llenar en morado |
| Footer | "Quick Robot" grande, contacto y redes |

## 6. Responsivo

Anchos de prueba: **390** (celular), **820** (tableta), **1440** (escritorio). Sin desbordes horizontales en ninguno. Lo que en escritorio depende del mouse (hover) tiene equivalente táctil.

## 7. Accesibilidad

Contraste AA, foco visible, imágenes con `alt` (las decorativas con `alt=""`), objetivos táctiles de al menos 44 px, `prefers-reduced-motion` desactiva animaciones de scroll, la alberca y el robot caminando. Detalle de pruebas en `16`.
