# 01 · Idea y decisiones

## Qué es

La web pública de **Quick Robot**, un taller de impresión 3D en Guadalajara. Es un **muestrario con precios**: la gente ve lo que se puede imprimir, abre la página de cada producto con fotos, colores y "precio desde", y pide por **WhatsApp** con el mensaje ya escrito.

**No es una tienda.** No hay carrito, pagos, cuentas de clientes ni inventario. El precio final siempre se confirma por WhatsApp.

Tiene un **panel** (`/admin`) para que el dueño suba y edite productos, centre sus fotos y cambie las fotos de la portada sin tocar código.

## Para quién

| Quién | Qué busca | Qué hace en la web |
|---|---|---|
| Dueños de negocios (taquerías, restaurantes, cafés) | Servilleteros, números de mesa, porta QR, llaveros con su logo | Abre el producto, pide por WhatsApp |
| Papás y mamás | Figuras, adornos, "el personaje que no encuentro en ninguna tienda" | Navega Navidad y "Para la casa" |
| Quien busca un regalo | Algo con nombre, con una foto o único | Productos con nombre, "Tú en miniatura" |

Casi todos llegan desde el **celular**, por un link compartido en WhatsApp o en un grupo de Facebook. La web se diseña primero para el teléfono.

## Qué tiene que lograr

1. Que abra **al instante** desde un link de WhatsApp (ver `15`).
2. Que en pocos segundos se entienda qué hacemos y cuánto cuesta más o menos.
3. Que pedir sea **un toque**: el mensaje de WhatsApp sale escrito.
4. Que Quick Robot se vea como **marca** (con su mascota, Q-404) y no como un taller genérico.
5. Que el dueño actualice el catálogo y la portada solo, desde el panel.

## Alcance

**Sí entra**
- Inicio con sus secciones (ver `04 §2`).
- Catálogo por categorías y página por producto.
- Panel: productos (fotos con recorte, datos, colores, publicar, ordenar) y portada (fotos del hero).
- Página 404 con Q-404, aviso de privacidad.
- Imagen y texto al compartir cada producto (WhatsApp, Facebook).
- Conteo de toques al botón de WhatsApp por producto (ver `18`).

**No entra (por ahora)** — se anota en "Después" si sale la idea:
- Carrito, pagos, cuentas de clientes, inventario.
- Cotizador automático o descuentos por cantidad fijos (el dueño no quiere amarrarse a un descuento).
- Blog, reseñas, chat propio, API de WhatsApp.
- Varios idiomas, modo oscuro.
- Conexión con el sistema interno (ver "Después").
- Personalizador de nombre en 3D (estuvo en el catálogo; el dueño lo quitó el 2026-11-10).

## Decisiones tomadas

| # | Decisión | Dónde |
|---|---|---|
| W1 | Muestrario con "precio desde", sin tienda; todo pedido termina en WhatsApp | este documento |
| W2 | Proyecto **aparte** del sistema interno (decisión D14 del sistema) con su propio repositorio | `07` |
| W3 | **Astro** con islas de **React**; nada de Next.js | `06`, `07` |
| W4 | Todo en **Cloudflare**: Workers (alojamiento), D1 (base), R2 (fotos), Access (entrar al panel) | `06`, `17` |
| W5 | **Drizzle** para la base y **Zod** para validar; mismas herramientas que el sistema | `06`, `10` |
| W6 | **Tailwind + shadcn/ui**, tipografía **Geist**, solo modo claro | `03`, `11` |
| W7 | **Se usan librerías para todo** lo que ya está resuelto (subir, recortar, comprimir y ordenar fotos, carruseles, formularios, física, 3D). No se programa a mano lo que una librería mantenida ya hace bien | `06` |
| W8 | Los **componentes externos** (21st.dev) que da el dueño **no se construyen**: se deja un hueco con un reemplazo sencillo y se integran al final | `11 §4` |
| W9 | Cada foto guarda el **original y el recorte** elegido; las versiones de cada tamaño se generan en el navegador al guardar | `09`, `12`, `15` |
| W10 | El panel se protege con **Cloudflare Access** y, además, el servidor verifica el token en cada operación del panel | `13` |
| W11 | Las páginas se generan en el servidor en cada visita leyendo D1; las fotos se sirven desde R2 con caché permanente | `07`, `15` |
| W12 | Código, nombres y comentarios en **inglés**; todo lo que ve la persona en **español** y en un solo lugar | `16` |
| W13 | Datos del negocio (WhatsApp, redes, fecha límite de Navidad, video) en `src/config/site.ts`, no regados en el código | `08`, `10 §6` |
| W14 | El mockup HTML es **referencia de diseño y comportamiento**, no código a copiar | `02` |
| W15 | Construcción **autónoma** por fases, una carpeta de instrucciones por fase | `20`, `fases/` |
| W16 | Los textos de la web hablan de **tú**, invitan y no describen; nada genérico | `05 §1` |

## Pendientes del dueño

Datos que todavía no existen. Mientras falten, Claude Code usa el **valor provisional** y lo anota en `progreso.md`; nada de esto detiene la construcción.

| Dato | Valor provisional | Dónde se usa |
|---|---|---|
| Dominio | `quickrobot.example` | `17`, `14` |
| Fecha límite de Navidad | 12 de diciembre | Sección Navidad |
| Precios reales | Los del mockup (`05 §4`) | Semilla |
| Fotos reales de productos | Renders y fotos de `reference/seed-photos/` | Semilla |
| Alto del Q-404 | `[alto] cm` | Producto Q-404 |
| Video del timelapse | Entregado (`public/media/timelapse.mp4`, se reproduce a 0.5×); sin video (`src = null`) el botón queda deshabilitado sobre la portada | Sección "Así nace cada pieza" |
| Domicilio para el aviso de privacidad | `[domicilio]` | `19` |
| Componentes de 21st.dev | Reemplazo sencillo | `11 §4` |

## Después (ideas fuera de alcance)

- Que el **sistema interno** publique productos a la web con un botón (endpoint con token). La web no necesita cambiar para eso.
- Pestaña "Ajustes" en el panel para WhatsApp, redes y fecha límite (hoy viven en `src/config/site.ts`).
- Importar un respaldo desde el panel (hoy solo se descarga).
- Zoom en las fotos del producto.
- Reseñas o fotos de clientes.
