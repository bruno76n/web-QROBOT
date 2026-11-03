# 07 · Arquitectura

## 1. Cómo funciona Astro (las islas)

Cada página se arma **en el servidor** y llega al navegador como **HTML terminado**: textos, fotos, links. Esa parte no carga JavaScript.

Las **islas** son los pedazos interactivos dentro de la página. Son componentes de React que llevan una instrucción de cuándo "despertar":

| Directiva | Cuándo carga | Se usa para |
|---|---|---|
| `client:load` | Al abrir la página | Lo que se ve arriba y se usa de inmediato |
| `client:visible` | Cuando la sección entra a la pantalla | Casi todas las islas del inicio y el personalizador |
| `client:idle` | Cuando el navegador queda libre | Cosas secundarias |
| `client:only="react"` | Solo en el navegador, nunca en el servidor | El panel |

Para comportamientos pequeños que no necesitan React (cambiar el header al pasar el hero, el contador, la impresión al hacer scroll), se usa un `<script>` normal dentro del componente `.astro`. Astro lo empaqueta y lo carga **una sola vez**: con View Transitions, el script no vuelve a correr al navegar. Por eso todo `<script>` de página se escribe así: arranca en el evento `astro:page-load` (busca sus elementos; si no están, no hace nada) y limpia lo suyo (intervalos, observadores, canvas, listeners) en `astro:before-swap`. Se prueba navegando inicio → catálogo → inicio.

**Diferencia con Next.js:** Next trata todo el sitio como una aplicación de React y manda React a todas las páginas. Astro trata el sitio como páginas con partes interactivas y solo manda React donde hay islas. Para un catálogo que se abre desde un link en un celular con datos móviles, eso es lo que más pesa (`15`).

**Limitaciones que se aceptan:**
- Cambiar de página recarga la página. Se usan las **View Transitions** de Astro (`<ClientRouter />`) para que se vea suave.
- Las islas no comparten estado de React entre sí. Si dos islas necesitan hablarse, se usa **nanostores**; para el inicio basta el `#` de la URL (`04 §2.3`).

## 2. Piezas

```
                       Navegador
        ┌──────────────────┴───────────────────┐
        │                                      │
  [dominio]/…                           img.[dominio]/…
        │                                      │
 ┌──────▼──────────────────────────┐   ┌───────▼────────┐
 │ Cloudflare Access: /admin*,     │   │ R2 (público,   │
 │ /_actions/admin.*, /api/admin/* │   │  solo lectura) │
 └──────┬──────────────────────────┘   └───────▲────────┘
        │                                      │ put / delete
 ┌──────▼──────────────────────────────────────┴──────────┐
 │ Worker: Astro                                           │
 │  • páginas públicas (se arman en cada visita)           │
 │  • Astro Actions del panel (requireAdmin primero)       │
 │  • /api/admin/upload  (sube versiones de foto a R2)     │
 │  • /api/click         (cuenta toques a WhatsApp, `18`)  │
 │  • archivos estáticos con hash (JS, CSS, fuente)        │
 └──────┬──────────────────────────────────────────────────┘
        │ Drizzle
 ┌──────▼───────┐
 │ D1 (SQLite)  │  productos, fotos, portada, ajustes, toques
 └──────────────┘
```

- **Las fotos no pasan por el Worker al mostrarse.** Se sirven directo de R2 en un subdominio (`img.[dominio]`) con caché de un año: cada versión tiene un nombre único y nunca cambia.
- **El panel** es una isla React que llama Astro Actions. Las fotos se suben por `/api/admin/upload`, que también exige ser administrador.

## 3. Qué es cada parte del sitio

| Parte | Tipo | Carga |
|---|---|---|
| Header, footer, textos, tarjetas, ficha del producto | HTML (`.astro`) | — |
| Cambio del header al pasar el hero | `<script>` | Al abrir |
| Portada que se turna (si hay más de una foto) | Isla React con Embla | `client:idle` |
| Contador y línea de Navidad | `<script>` | Al abrir |
| ¿Qué se te antoja? | Isla: componente externo (`11 §4`) | `client:visible` |
| Video | HTML + `<script>` pequeño | — |
| Imprimiendo | `<script>` con `motion` (`scroll()`) | Al abrir |
| Q-404 (cambiar colores) | `<script>` | Al abrir |
| Alberca | `<script>` que importa `matter-js` al tocar el botón | Al tocar |
| Pedido | Isla React | `client:visible` |
| Personalizador 3D | Isla React (three + R3F) | `client:visible` |
| Galería del producto | Isla React con Embla | `client:visible` |
| Opciones del producto (color, cantidad, personalización → link) | Isla React | `client:load` |
| Panel | Isla React grande | `client:only="react"` |

La página de producto también tiene un link de WhatsApp **en el HTML** con el mensaje base (cantidad 1, primer color), para que funcione aunque la isla no cargue.

## 4. Cómo se generan las páginas

- **Públicas:** se arman en el servidor en cada visita leyendo D1 (unas pocas consultas de milisegundos). No hay caché de HTML que limpiar: lo que se guarda en el panel se ve al recargar.
- **Estáticas** (`/privacidad`, `/404`): se generan al compilar (`export const prerender = true`).
- **Archivos con hash** (JS, CSS, fuente): caché de un año.
- **Fotos**: caché de un año (`Cache-Control: public, max-age=31536000, immutable`).
- **HTML público**: `Cache-Control: public, max-age=0, must-revalidate`.

Si algún día el tráfico lo pide, se agrega caché del HTML en el borde; hoy no hace falta (`15 §1`).

## 5. Guardar en el panel

D1 **no tiene transacciones interactivas**; las escrituras que van juntas se mandan en un solo `db.batch([...])`, que se aplica completo o nada.

**Guardar un producto con fotos nuevas:**
1. El dueño elige fotos y las centra. El navegador genera las versiones de cada foto (`12 §3`).
2. Cada foto se sube a `/api/admin/upload`: el servidor valida, guarda las versiones en R2 y crea la fila de la foto con estado `pending`. Responde el id.
3. Al guardar el producto, la acción `saveProduct` valida todo con Zod y, en un solo `batch`, actualiza el producto, sus categorías y colores, y marca sus fotos como `attached` con su orden.
4. Si el dueño se va sin guardar, las fotos quedan `pending`. Al abrir el panel se borran (de D1 y de R2) las `pending` de más de 24 horas.

**Borrar un producto:** un `batch` borra el producto y sus filas (sus fotos incluidas); después se borran de R2 los prefijos `ph/<photoId>/` de esas fotos. Si R2 falla, el error se registra y los archivos huérfanos no afectan a nadie (no hay fila que los muestre); `pnpm r2:orphans` los lista y borra (`17 §5`).

## 6. Fronteras que no se cruzan

Se verifican con ESLint (`no-restricted-imports`) donde se puede.

1. **Solo `src/server/` toca la base y R2.** Páginas y componentes llaman funciones de `src/server/queries/` (lectura) o acciones de `src/actions/` (escritura). Ningún componente importa `drizzle` ni el binding de D1.
2. **Toda acción del panel empieza con `requireAdmin(context)`** (`13 §2`). Las acciones públicas no existen, salvo `/api/click`, que solo cuenta.
3. **La lógica pura vive en `src/lib/`** (mensajes de WhatsApp, formato de dinero, cálculo de recorte, reglas para publicar, plurales). No importa nada de Astro, Cloudflare ni React: se prueba con Vitest sin nada más.
4. **Los componentes externos viven solo en `src/components/external/`** y no se editan más que para el cambio anotado en `11 §4`. Una sección los envuelve y les pasa los datos.
5. **Los textos viven en `src/i18n/es.ts`** (los de productos, en la base).
6. **Los datos del negocio viven en `src/config/site.ts`** (número de WhatsApp, redes, dominio, fecha límite de Navidad). Nunca escritos en componentes.
7. **Nada de `set:html` ni `dangerouslySetInnerHTML`** con datos de la base. La descripción se divide en párrafos y se pinta como texto.

## 7. Después: conexión con el sistema interno

Cuando el sistema de producción exista, podrá publicar un producto a la web llamando un endpoint protegido con un token (`/api/sync/products`). El esquema de `09` ya tiene lo necesario (slug único, precio en centavos). No se construye ahora.
