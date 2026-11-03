# 02 · Referencias

Todo el material de referencia vive en `reference/` y `assets/`. **No se modifica** y **no se copia tal cual**: es la guía de cómo se ve y cómo se comporta la web. El código real se escribe con el stack de `06`.

## 1. Mockups (`reference/mockups/`)

Cuatro páginas HTML que se abren directo en el navegador (guardan los productos de ejemplo en el propio navegador).

| Archivo | Qué es | Qué se toma |
|---|---|---|
| `index.html` | Inicio | Orden de secciones, textos, tamaños, el hero con el nombre gigante, Navidad, el video, la impresión al hacer scroll, Q-404, la alberca, el pedido por WhatsApp, header y footer |
| `catalogo.html` | Catálogo | Título, aviso de precios por cantidad, personalizador de nombre en 3D, pestañas por categoría, tarjetas, "¿No ves lo que buscas?" |
| `producto.html` | Página de producto | Galería, precio desde, colores, personalización, cantidad, botón de WhatsApp, ficha, descripción, relacionados. **Contiene los 14 productos de ejemplo** (`window.QR_SEED`) |
| `admin.html` | Panel | Pestañas Productos y Portada, lista con búsqueda y filtros, editor con todos los campos, subir y ordenar fotos, portada con vista previa |

**Cuando un documento y el mockup no coinciden:** manda el documento (el mockup se hizo antes de decidir el stack). Cuando un documento no dice nada: manda el mockup.

**Diferencias ya decididas respecto al mockup:**

| En el mockup | En la web real | Por qué |
|---|---|---|
| Rutas con `#` (`producto.html#macetas`) | Rutas normales (`/producto/macetas`, `/catalogo/navidad`) | Cada página debe existir para Google y al compartir |
| Productos guardados en el navegador | Base D1 en Cloudflare | Es una web pública |
| Fotos subidas tal cual, comprimidas | Fotos con recorte elegido por el dueño y varios tamaños | `12 §3`, `15` |
| Panel sin contraseña | Panel protegido con Cloudflare Access | `13` |
| "Cargar respaldo" y "Volver a los productos de ejemplo" | Solo "Descargar respaldo" | Evitar borrar el catálogo real por accidente |
| Selector de tipografía en la esquina | No existe | Era para comparar fuentes; se quedó Geist |
| Fotos del Q-404 en la página del producto | Renders finales: en la semilla son `reference/seed-photos/q-404-1…6.webp` (copias de `assets/q404/`) | Las del mockup son de un diseño anterior |
| "¿Qué se te antoja?" hecho a mano | Componente externo de 21st.dev | `11 §4` |
| Sin página 404 | Página 404 con Q-404 | `04 §5` |
| Las 4 tarjetas de Navidad llenaban el pedido | Son productos reales (Navidad + "Más pedido") y abren su página | Precios reales y una página que se puede compartir (`04 §2.2`) |
| Navidad siempre visible | Solo del 1 de octubre al 24 de diciembre | `04 §2.2` |

## 2. Marca y mascota (`assets/`)

| Archivo | Uso |
|---|---|
| `assets/logo-cabeza.svg` | Cabeza de Q-404: logo del header, footer, favicon y el final del nombre gigante del hero |
| `assets/q404/q404-<colores>.webp` | Renders finales de Q-404 en 6 combinaciones (530 × 840, fondo transparente): sección Q-404, alberca de robots, producto Q-404 |

**Q-404 (diseño final):** cabeza verde con ojos grandes separados ("cara de menso"), antena con bolita morada, torso morado liso con "Q-404" en relieve del mismo morado, brazos y piernas negros, manos y pies verdes, pies de bloque. No se rediseña en la web; se usan los renders.

## 3. Fotos de ejemplo (`reference/seed-photos/`)

Una o varias fotos por producto de ejemplo, con el nombre `<slug>-<n>.webp`. Son renders provisionales y de baja resolución: sirven para la **semilla de desarrollo** y para probar el panel. Se reemplazan por fotos reales desde el panel.

## 4. Componentes externos

Los da el dueño (de 21st.dev). Lista, contrato y reglas en `11 §4`. Por ahora:

| Componente | Sección | Estado |
|---|---|---|
| Interactive Hover Links | "¿Qué se te antoja?" (inicio) | El dueño ya tiene el código; se pondrá en `src/components/external/` |

## 5. Sistema interno (otro proyecto)

La documentación del sistema de producción y costos (`docs/` del otro proyecto) **no aplica aquí**, salvo como antecedente de estilo de trabajo (modo autónomo, informes por fase, decisiones registradas). Nada de esta web depende de él.
