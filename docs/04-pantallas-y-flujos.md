# 04 · Pantallas y flujos

Cada página, cada sección y qué pasa al tocar cada cosa. Los textos exactos están en `05`; el panel completo en `12`.

## 1. Mapa del sitio

| Ruta | Página | Se genera |
|---|---|---|
| `/` | Inicio | En el servidor, en cada visita (lee portada y productos de Navidad) |
| `/catalogo` | Catálogo, todas las categorías | En el servidor |
| `/catalogo/[categoria]` | Catálogo filtrado (`negocio`, `casa`, `navidad`) | En el servidor; categoría desconocida → 404 |
| `/producto/[slug]` | Página de producto | En el servidor; producto oculto o inexistente → 404 |
| `/privacidad` | Aviso de privacidad | Estática |
| `/404` | No encontrada (con Q-404) | Estática |
| `/admin` | Panel · Productos | Isla React, protegida |
| `/admin/portada` | Panel · Portada | Isla React, protegida |
| `/sitemap.xml`, `/robots.txt` | Para buscadores | En el servidor (`14 §3`) |

Todas las páginas públicas comparten **header** y **footer** (`03 §4`). En el header, "Navidad", "Ideas" y "Q-404" llevan a su sección del inicio (`/#navidad`, `/#ideas`, `/#q404`); "Catálogo" a `/catalogo`; **Cotizar** a `/#pedido`.

## 2. Inicio (`/`)

Orden fijo de secciones:

### 2.1 Hero
- Foto (o fotos) de la portada, elegidas en el panel (`12 §5`). Si hay varias, se turnan con desvanecido cada N segundos (ajuste de la portada). Si no hay ninguna, se usa la foto por defecto (`reference/hero/`).
- "Quick Robot" gigante en una línea, encima de la foto, con la cabeza de Q-404 al final.
- La foto de celular se usa en pantallas de 760 px o menos; si no hay, se usa la de escritorio recortada al centro.
- Sin botones ni frase de venta.

### 2.2 Navidad (`#navidad`)
- Contador hasta Nochebuena (24 de diciembre, 00:00 hora de Guadalajara): días, horas, minutos, segundos. El 24 de diciembre el contador se cambia por "Hoy es Nochebuena.".
- Línea de tiempo del 1 de octubre al 24 de diciembre: avance hasta hoy, la marca "Último día para pedir · [fecha]" y un Q-404 que camina en la posición de hoy.
- 4 tarjetas de regalo: los primeros 4 productos **publicados, de la categoría Navidad y marcados "Más pedido"**, por orden del catálogo. Cada una lleva foto, nombre, frase y "Desde $X", y abre su página de producto. *(En el mockup las tarjetas llenaban el pedido; en la web real abren el producto.)*
- Botón "Apartar un regalo →": link a `#pedido=navidad`, que llena el pedido con 1 · figura · una foto · antes de Navidad.
- Liga "Ver todo lo de Navidad →" a `/catalogo/navidad`.
- **Fuera de temporada** (del 25 de diciembre al 30 de septiembre) la sección no se muestra.

### 2.3 ¿Qué se te antoja? (`#ideas`)
- Componente externo (`11 §4`): 7 ideas con nombre, frase y foto. Contenido en `05 §3`.
- Al tocar una idea, **se llena el pedido** (§2.8) con la pieza, la cantidad sugerida y "con" de esa idea, y la página baja al pedido. Técnicamente cada idea es un link a `#pedido=<idea>`; el pedido escucha el cambio del `#` (así funciona con cualquier componente que acepte `href`).
- Texto "¿Quieres ver precios?" con liga "Abre el catálogo →".
- En escritorio la foto aparece al pasar el mouse; **en celular aparece la foto de la idea que está a la mitad de la pantalla mientras se hace scroll**.

### 2.4 Video (`#video`)
- Título y entrada, espacio 16:9 a lo ancho con la portada desenfocada y el botón "Dale play 0:30".
- Al tocar, se reproduce el timelapse en el mismo lugar (`<video>` con controles, `preload="none"`). Mientras `site.video.src` sea `null`, el botón está deshabilitado y dice (para lectores de pantalla) que todavía no hay video.
- Portada del video: la foto por defecto del hero, desenfocada (se genera en `scripts/build-assets.mjs`).
- Tres datos debajo: horas de impresión, segundos de video, 0.2 mm por capa.

### 2.5 Imprimiendo (`#imprimiendo`)
- Q-404 aparece capa por capa de abajo hacia arriba **según el scroll**; el contador "Capa N de 640" avanza con él. Al completarse: "Listo. Salió un Q-404." con liga "Conócelo →" a `#q404`.
- Con movimiento reducido se muestra completo.

### 2.6 Q-404 (`#q404`)
- "Q-404" gigante en morado, el render al centro y 5 notas que señalan partes (textos en `05 §3`).
- Chips con 6 combinaciones de color; al elegir una cambia el render (`assets/q404/`) y el link de "Quiero este Q-404", que abre WhatsApp con el mensaje de esa combinación.
- Debajo: "Desde $X · mide [alto] cm" con el precio del producto `q-404`.

### 2.7 Alberca (`#alberca`)
- "Q-404 no viene solo." y el botón **"No aprietes este botón"**.
- Al tocarlo caen Q-404 de todos los colores sobre toda la pantalla y se amontonan (física con `matter-js`). La capa no bloquea clics; el mouse o el dedo los empuja. Aparece abajo el botón "Vaciar los robots"; también se vacía con Escape y sola a los pocos segundos.
- Después del primer uso el botón dice "Te dije que no" y la nota "Te dije.".
- Con movimiento reducido: caen pocos y sin rebote, o se omite la animación.
- La librería se carga **solo al tocar el botón**.

### 2.8 Pedido (`#pedido`)
- Una conversación estilo WhatsApp: burbuja de Quick Robot ("Hola, aquí Quick Robot. ¿Qué te imprimimos?") y la respuesta del cliente con huecos morados para llenar: nombre, cantidad, pieza, "con", cuándo; más "Detalles opcionales".
- El plural de la pieza cambia con la cantidad. Los huecos crecen con lo que se escribe.
- Botón "Mandar por WhatsApp" que abre `wa.me` con el mensaje armado (`05 §5`). Nada se envía hasta que la persona le da enviar en WhatsApp.

### 2.9 Footer
"Quick Robot" grande, WhatsApp, Facebook, Instagram, © y liga al aviso de privacidad.

## 3. Catálogo (`/catalogo` y `/catalogo/[categoria]`)

1. Título "Elige uno. O cincuenta." y entrada.
2. Aviso "Mientras más pidas, menos pagas por pieza." (sin tabla de descuentos).
3. **Personalizador "Escríbele su nombre."**: forma (llavero, estrella, corazón), nombre (hasta 10 letras, en mayúsculas), color (7: morado, verde, negro, lila, rojo, azul, blanco — los de `src/config/colors.ts`); primero una vista fija y, al tocarla, la vista 3D que se gira arrastrando (`11 §3`); precio "Desde $45 c/u" y botón "Pedir por WhatsApp" con el mensaje de `05 §5` (desactivado mientras no haya nombre).
4. Pestañas: Todos · Para tu negocio · Para la casa · Navidad. Cada una es una ruta real (`/catalogo/negocio`…), no un filtro con JavaScript.
5. Cuadrícula de tarjetas (productos publicados de esa categoría, por orden del catálogo). Etiqueta "Más pedido" si está marcado.
6. "¿No ves lo que buscas?…" con botón "Cotizar algo distinto" → `/#pedido`.
7. Nota al pie: "Precios de referencia; el final te lo confirmamos por WhatsApp."

Catálogo vacío (nada publicado en esa categoría): mensaje corto y liga a "Todos".

## 4. Producto (`/producto/[slug]`)

1. Migas: Catálogo / categoría principal (de las categorías del producto, la que va primero en `src/config/categories.ts`).
2. **Galería:** foto grande cuadrada, flechas, contador "1 / N", miniaturas; se desliza con el dedo (Embla).
3. Nombre, frase corta, etiquetas de categoría.
4. "Desde **$X** por pieza" y la nota del precio.
5. Selector de color (solo si el producto tiene colores), con el nombre del color elegido.
6. Campo de personalización (solo si "Se personaliza"), con la pregunta que definió el dueño.
7. Cantidad (− número +).
8. Botón verde "Pedir por WhatsApp" y debajo "Se abre WhatsApp con tu mensaje listo. No pagas nada todavía."
9. Ficha: tamaño, material, tiempo de entrega (solo las filas con dato).
10. Descripción (párrafos separados por línea en blanco; texto plano).
11. "También te puede gustar": hasta 4 productos publicados que compartan categoría.

El mensaje de WhatsApp se actualiza con color, personalización y cantidad (`05 §5`) e incluye el link del producto.

## 5. Página 404

Q-404 de cuerpo completo, título "Error 404: página no encontrada." (le queda al nombre), una línea y botones "Ir al inicio" y "Ver el catálogo". Mismo header y footer.

## 6. Flujos de punta a punta

Se prueban con Playwright (`16 §4`).

| Flujo | Pasos | Resultado esperado |
|---|---|---|
| **A · Pedir un producto** | Inicio → Catálogo → tarjeta → elegir color, escribir personalización, cantidad 3 → Pedir por WhatsApp | El link abre `wa.me/<número>` con el mensaje exacto de `05 §5`, con color, personalización, cantidad en plural y el link del producto |
| **B · Pedir desde una idea** | Inicio → tocar "Servilleteros" en ¿Qué se te antoja? | La página baja al pedido; cantidad 20, pieza "servilleteros", con "mi logo"; el link de WhatsApp lleva ese mensaje |
| **C · Nombre en 3D** | Catálogo → personalizador → estrella, "SOFI", verde | El link dice "una estrella verde que diga “SOFI”" |
| **D · Subir un producto** | Panel → Nuevo → subir 2 fotos, centrar la primera, llenar datos, publicar | Aparece en el catálogo y en su página con la foto recortada como se eligió |
| **E · Cambiar la portada** | Panel → Portada → subir foto de escritorio y de celular, centrar, guardar | El inicio muestra la nueva foto en 1440 y la de celular en 390 |
| **F · Ocultar y reordenar** | Panel → ocultar un producto y arrastrar otro al primer lugar | El oculto da 404 en su página y no sale en el catálogo; el otro sale primero |
| **G · Compartir** | Abrir `/producto/macetas` como lo haría WhatsApp (leer las etiquetas `og:`) | Título, descripción, imagen 1200 × 630 y precio correctos (`14`) |

## 7. Estados especiales

| Situación | Qué se ve |
|---|---|
| Producto sin descripción, tamaño, etc. | Esa parte no se muestra |
| Producto sin colores | No hay selector de color y el mensaje no dice color |
| Error del servidor en una página pública | Página de error simple con Q-404 y "Intentar de nuevo" (sin detalles técnicos) |
| Foto que no carga | Fondo `--soft` del tamaño de la foto (sin saltos de diseño) |
| Sin JavaScript | Todo el contenido y los links de WhatsApp de cada producto siguen funcionando (con el mensaje base); solo se pierden las islas |
