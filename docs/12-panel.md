# 12 · Panel de administración

Referencia visual y de comportamiento: `reference/mockups/admin.html`. Rutas `/admin` (Productos) y `/admin/portada` (Portada), protegidas (`13`). Una persona lo usa (el dueño), desde la compu o el celular.

## 1. Estructura

- **Barra superior:** "Quick Robot", pestañas **Productos**, **Categorías** y **Portada**, "Ver catálogo ↗" y menú **•••** (Descargar respaldo).
- Al abrir: se llama `admin.cleanupPending` en segundo plano.
- Si hay cambios sin guardar y se intenta salir, cambiar de producto o de pestaña: "Tienes cambios sin guardar. ¿Salir sin guardar?" (Salir / Seguir editando).

## 2. Productos (`/admin`)

**Lista (izquierda en escritorio, pantalla propia en celular)**
- Buscar por nombre.
- Filtro: Todos · Publicados · Ocultos.
- Cada fila: asa ⋮⋮ para arrastrar, foto, nombre, precio, estado (Publicado / Oculto).
- Arrastrar cambia el orden del catálogo (`@dnd-kit/sortable`; también con teclado). Se guarda al soltar (`admin.reorderProducts`). Con búsqueda o filtro activos, arrastrar se desactiva y se dice por qué.
- "+ Nuevo" abre un producto vacío.
- La selección vive en la URL (`/admin?p=<id>`) para poder recargar o compartir el enlace.

**Editor (derecha en escritorio)** — mismos bloques que el mockup:

| Bloque | Campos |
|---|---|
| **Fotos** | Subir (§3), miniaturas ordenables (la primera es la portada de la tarjeta), por foto: "Centrar", "Texto alternativo", "Quitar" (se borra al guardar) |
| **Lo básico** | Nombre · Frase corta · Precio desde (por pieza) · Nota del precio · Dónde aparece (categorías, casillas) |
| **Página del producto** | Descripción · Tamaño · Material · Tiempo de entrega · Colores que ofreces (puntos de color, seleccionables y ordenables) · Cómo se dice uno · Cómo se dicen varios |
| **Opciones** | Se personaliza (interruptor) → ¿Qué le preguntas al cliente? · Más pedido (interruptor) · Publicado (interruptor; desactivado con la lista de lo que falta si no se puede publicar, `09 §3`) |
| **Acciones** | Guardar · Ver página ↗ (si está publicado) · Duplicar · Eliminar (con confirmación) |

Formulario con **react-hook-form + Zod** (mismo esquema que el servidor, `src/lib/schemas.ts`). Errores junto a cada campo. "Guardar" muestra "Guardando…" y al terminar el aviso "Guardado" (sonner). Si el servidor rechaza, el aviso dice el texto del código (§7) y nada se pierde del formulario.

## 3. Fotos: subir y centrar

Lo mismo para productos y portada; cambia la forma del recorte.

| Uso | Forma (`aspect`) | Versiones (ancho) | Extra |
|---|---|---|---|
| Producto | 1:1 | 400, 800, 1200 | `og.jpg` 1200 × 630 (foto cuadrada de 630 centrada sobre `--soft`) |
| Portada · escritorio | 16:9 | 1200, 2400 | Guía rayada donde va el nombre gigante |
| Portada · celular | 3:4 | 600, 1200 | Guía rayada donde va el nombre |

**Pasos**
1. **Elegir:** `react-dropzone` (arrastrar o tocar para elegir; en celular abre fotos o cámara). Acepta JPG, PNG, WEBP, HEIC/HEIF, hasta 25 MB cada una. Varias a la vez para productos (hasta completar 10).
2. **Convertir si hace falta:** si es HEIC, `heic2any` → JPG (se carga solo en ese caso). Se respeta la orientación EXIF.
3. **Preparar el original:** `browser-image-compression` lo deja en máximo 4000 px de lado largo, calidad 0.9. Es lo que se guarda para volver a centrar después.
4. **Centrar:** diálogo con `react-easy-crop` en la forma de la tabla. Se arrastra para mover y se hace zoom (rueda, pellizco o deslizador, de 1× a 4×). **En fotos de producto el zoom también puede alejar** (hasta que la foto completa quepa en el cuadro, con aire alrededor): así un producto alto o ancho se ve entero y el recorte deja márgenes vacíos (transparentes en las versiones; la vista previa de redes los rellena de gris claro). La portada no admite márgenes. Botones "Listo" y "Cancelar". Al subir varias fotos de producto, cada una entra **centrada automáticamente** (recorte centrado más grande posible) y se puede ajustar después con "Centrar".
5. **Generar versiones:** con `canvas`, a partir del original y el recorte, en los anchos de la tabla, WebP calidad 0.82 (`src/lib/crop.ts` calcula las medidas; prueba unitaria). **Nunca se agranda:**
   - Se generan los anchos de la tabla que sean menores o iguales al ancho del recorte.
   - Si el recorte es más angosto que el ancho más chico, se genera **una sola versión del ancho del recorte** (por ejemplo, `300`).
   - Los anchos generados se guardan en `photos.widths`.
   - `og.jpg`: lienzo de 1200 × 630 color `--soft` con la foto centrada a 630 px de alto, o a su tamaño si es menor (sin agrandar).
   - Aviso "La foto es chica; puede verse borrosa en pantallas grandes." (se permite guardar) si el recorte mide menos de **800 px** (producto), **1600 px** (portada de escritorio) o **900 px** (portada de celular).
6. **Subir:** `POST /api/admin/upload` (`10 §4`) con barra de progreso por foto. Si falla, la miniatura muestra "No se subió · Reintentar".
7. **Volver a centrar** una foto guardada: abre el recortador con el original y el recorte actual; al aceptar, se generan y suben versiones nuevas; se aplican al guardar.

## 4. Vista del recorte (lo que verá la gente)

Junto al recortador, una vista previa pequeña de cómo queda: la tarjeta del catálogo (producto) o el hero con el nombre gigante encima (portada), para que el dueño vea si el nombre tapa algo.

## 5. Portada (`/admin/portada`)

Como el mockup:
- **Así se ve:** vista previa a escala del hero con "Quick Robot" encima y la franja rayada (zona que el nombre tapa).
- **Fotos:** hasta 6 portadas. Cada una tiene foto de escritorio (obligatoria) y de celular (opcional; si no hay, se usa la de escritorio recortada al centro). Por foto: Cambiar, Centrar, Quitar. Se ordenan arrastrando.
- **Cambio entre fotos:** 4, 6, 8 o 12 segundos (solo aplica con más de una).
- Botones: **Guardar portada** · Ver inicio ↗ · **Volver a la foto original** (confirma y llama `admin.resetHero`).
- Indicador "Sin guardar" cuando hay cambios.

## 5b. Categorías (`/admin/categorias`)

- Lista de categorías con **Agregar** (el nombre genera la dirección `/catalogo/<id>`), **Renombrar** (la dirección no cambia), **Borrar** (confirma) y orden por arrastre (`admin.createCategory`, `renameCategory`, `reorderCategories`, `deleteCategory`).
- **Navidad** no tiene "Borrar": la temporada depende de ella.
- Borrar se rechaza si un producto publicado se quedaría sin categoría; el mensaje lista cuáles.
- En la ficha del producto, "Dónde aparece" muestra estas categorías, en este orden. El orden decide la categoría principal (migas).

## 5c. Aprende (`/admin/aprende`, fase 8)

Edita las páginas de Aprende que ya existen (crear y borrar páginas se hace con los archivos de `content/aprende/` y el importador, `21 §8`). Acciones (`10 §3`):

- **Lista:** `admin.listLearnPages` trae todas las páginas (publicadas u ocultas) con título, tema, tipo, si está publicada y si se editó aquí. El interruptor de cada fila usa `admin.setLearnPublished`: muestra u oculta la página en Aprende y en el buscador al momento.
- **Editor:** `admin.getLearnPage` trae el Markdown, las listas, las preguntas en orden y las fuentes que se pueden citar. «Guardar» llama `admin.saveLearnPage` con los campos editables (título, subtítulo, en corto, cuerpo, etiquetas, relacionadas, fuentes, preguntas, llamado y publicado). El servidor convierte el Markdown, rehace el texto de búsqueda y marca la página como **editada aquí**: desde entonces el importador ya no la toca, salvo con `--overwrite`. La dirección, el tema y el tipo no se editan.
- **Errores al guardar:** una relacionada que ya no existe (`UNKNOWN_RELATED`, nombra cuáles), un bloque `[[…]]` que no existe (`UNKNOWN_BLOCK`, nombra cuál) o una fuente que no existe (`VALIDATION`). Si se guardó pero el buscador no se pudo actualizar, la respuesta es éxito con `search: 'failed'` y el panel muestra «Se guardó, pero el buscador no se actualizó. Toca «Actualizar buscador» en un rato.».
- **Buscador y búsquedas sin resultado** (`22 §10`): `admin.learnSearchMisses` da las búsquedas sin resultado de los últimos días (de más a menos) y el estado del buscador (si hay Meilisearch, última sincronización y documentos); «Actualizar buscador» llama `admin.syncLearnIndex` (`SEARCH_UNAVAILABLE` si Meilisearch no responde).

## 6. Clics a WhatsApp (fase 5)

En la pestaña Productos, encima de la lista, una línea: "Últimos 30 días: N toques a WhatsApp". En cada fila, el número de toques de ese producto. En la portada no aplica. Detalle en `18`.

## 7. Textos del panel

Van en `src/i18n/es.ts` bajo `admin`. Del mockup, más los nuevos:

- Encabezados: "Productos", "Portada", "Ver catálogo ↗", "Descargar respaldo" ("Todos los productos en un archivo .json").
- Lista: "Buscar", "+ Nuevo", "Todos", "Publicados", "Ocultos", "Arrastra ⋮⋮ para cambiar el orden en el catálogo.", "Para ordenar, quita la búsqueda y el filtro.", "Elige un producto", "o crea uno nuevo con “+ Nuevo”."
- Fotos: "Fotos", "La primera es la portada. Arrástralas para cambiar el orden.", "Arrastra fotos aquí", "o haz clic para elegirlas", "JPG, PNG, WEBP o fotos del iPhone · hasta 10 fotos", "Centrar", "Texto alternativo", "Quitar", "Listo", "Cancelar", "Mueve la foto y acércala hasta que quede como quieres.", "La foto es chica; puede verse borrosa en pantallas grandes.", "No se subió · Reintentar".
- Campos: "Lo básico", "Lo que se ve en la tarjeta del catálogo.", "Nombre", "Frase corta", "Precio desde (por pieza)", "Nota del precio", "Dónde aparece", "Página del producto", "Lo que ve la gente al abrirlo.", "Descripción", "Tamaño", "Material", "Tiempo de entrega", "Tamaño a medida (a cotizar)", "Colores que ofreces", "Si no eliges ninguno, la página no muestra selector de color.", "Cómo se dice uno", "Cómo se dicen varios", "Para el mensaje de WhatsApp: “Hola, me interesa: 10 llaveros en morado”.", "Se personaliza", "Muestra un campo para que escriban el nombre, el logo o lo que pida.", "¿Qué le preguntas al cliente?", "Más pedido", "Le pone la etiqueta “Más pedido” en el catálogo y lo puede mostrar en Navidad.", "Publicado", "Si está apagado, nadie lo ve en el catálogo."
- Acciones: "Guardar", "Guardando…", "Guardado", "Sin guardar", "Ver página ↗", "Duplicar", "Eliminar", "¿Eliminar este producto?", "También se borran sus fotos. No se puede deshacer.", "Sí, eliminar", "No".
- La dirección del producto (`/producto/<slug>`) **no se edita en el panel**: se genera del nombre y se queda fija desde la primera publicación (`docs/09 §3`).
- Para publicar falta: "Para publicarlo falta: {lista}" con: "una foto", "una categoría", "el precio desde", "el nombre".
- Portada: los del mockup ("Portada del inicio", "Las fotos grandes de arriba de la página. Si subes varias, se van turnando solas.", "Así se ve", "El nombre gigante va abajo, encima de la foto: deja esa parte de la foto libre (la franja rayada).", "Para computadora: horizontal, 2400 × 1350 px. Para celular (opcional): vertical, 1200 × 1600 px. Si no subes la de celular, se usa la horizontal recortada.", "Cada foto que subas es una portada nueva · hasta 6", "Cambio entre fotos", "Cambiar cada", "4 segundos", "6 segundos", "8 segundos", "12 segundos", "Solo aplica si hay más de una foto.", "Guardar portada", "Ver inicio ↗", "Volver a la foto original").
- Errores por código (`10 §5`):

| Código | Texto |
|---|---|
| `UNAUTHORIZED` | Tu sesión terminó. Vuelve a entrar. |
| `VALIDATION` | Revisa los campos marcados. |
| `NOT_FOUND` | Ese producto ya no existe. |
| `SLUG_TAKEN` | Esa dirección ya la usa otro producto. |
| `CANNOT_PUBLISH` | Para publicarlo falta: {lista}. |
| `TOO_MANY_PHOTOS` | Caben hasta 10 fotos por producto. |
| `TOO_MANY_SLIDES` | Caben hasta 6 portadas. |
| `PHOTO_NOT_FOUND` | Una foto no se encontró. Vuelve a subirla. |
| `UNKNOWN_RELATED` | Estas páginas relacionadas ya no existen: {lista}. Quítalas de la lista. |
| `UNKNOWN_BLOCK` | El cuerpo usa un bloque que no existe: {marcas}. Revisa lo que escribiste entre [[ ]]. |
| `SEARCH_UNAVAILABLE` | El buscador no respondió. Intenta de nuevo en un rato. |
| `FILE_TYPE` | Esa foto no se puede usar. Sube JPG, PNG, WEBP o una foto del iPhone. |
| `FILE_TOO_LARGE` | La foto pesa demasiado (máximo 25 MB). |
| `INTERNAL` | Algo salió mal. Intenta de nuevo. (Código: {errorId}) |
| Sin conexión | No hay conexión. Tus cambios siguen aquí; intenta guardar de nuevo. |

## 8. Celular

El panel también se usa desde el teléfono (subir la foto recién tomada). En ≤ 760 px: la lista es una pantalla y el editor otra (con "←" para volver); el recortador ocupa toda la pantalla y funciona con pellizco; los botones de guardar quedan fijos abajo.
