# Quick Robot · Web pública · Documentación

Muestrario con precios y página por producto; los pedidos van por WhatsApp. Con panel para subir productos y cambiar la portada. Proyecto aparte del sistema interno de producción.

## Documentos

| Documento | Para qué sirve |
|---|---|
| [01 · Idea y decisiones](01-idea-y-decisiones.md) | Qué es, para quién, alcance, decisiones (W1–W16), **pendientes del dueño** y "Después" |
| [02 · Referencias](02-referencias.md) | Mockups, marca, fotos de ejemplo; **qué cambia respecto al mockup** |
| [03 · Diseño](03-diseno.md) | Principios, tokens, tipografía, componentes visuales |
| [04 · Pantallas y flujos](04-pantallas-y-flujos.md) | Cada página y sección, qué pasa al tocar cada cosa, flujos A–G |
| [05 · Textos y contenido](05-textos-y-contenido.md) | Reglas de redacción, todos los textos, ideas, productos de ejemplo, mensajes de WhatsApp |
| [06 · Stack y librerías](06-stack-y-librerias.md) | Cada herramienta y librería, y por qué |
| [07 · Arquitectura](07-arquitectura.md) | Cómo funciona Astro, piezas, qué es isla y qué no, cómo se guarda, fronteras |
| [08 · Estructura de carpetas](08-estructura-de-carpetas.md) | Árbol del proyecto y nombres |
| [09 · Modelo de datos](09-modelo-de-datos.md) | Tablas, fotos en R2, reglas para publicar, semilla, respaldo |
| [10 · Backend](10-backend.md) | Consultas, acciones, subida de fotos, códigos de error, configuración |
| [11 · Frontend](11-frontend.md) | Principios, componentes, secciones, **componentes externos (§4)** |
| [12 · Panel](12-panel.md) | Productos, fotos (subir y centrar), portada, textos del panel |
| [13 · Seguridad](13-seguridad.md) | OWASP Top 10:2025 aplicado, `pnpm security` |
| [14 · SEO y compartir](14-seo-y-compartir.md) | Etiquetas, imagen al compartir, JSON-LD, sitemap |
| [15 · Rendimiento e imágenes](15-rendimiento-e-imagenes.md) | Metas, presupuestos de JS, tamaños de foto, límites |
| [16 · Convenciones y pruebas](16-convenciones-y-pruebas.md) | Nombres, git, tipos de prueba, casos obligatorios, "terminado", comandos |
| [17 · Despliegue](17-despliegue.md) | Cloudflare, variables, entornos, CI, respaldo, lo que necesita del dueño |
| [18 · Analítica](18-analitica.md) | Visitas y toques a WhatsApp |
| [19 · Legal](19-legal.md) | Datos que trata la web, aviso de privacidad |
| [20 · Plan de construcción](20-plan-de-construccion.md) | **Las fases (1–9)** y la plantilla de informe |
| [21 · Aprende](21-aprende.md) | Sección de respuestas: rutas, temas, pantallas, Markdown seguro, datos interactivos, tablas, importador |
| [22 · Buscador](22-buscador.md) | Meilisearch detrás del Worker, índice, sincronización, respaldo en D1, interfaz |
| [23 · Aprende · Contenido](23-aprende-contenido.md) | Investigación y texto de cada página, reglas de redacción, datos curiosos, sinónimos, fuentes |
| [24 · Aprende · Dispositivos y navegadores](24-aprende-dispositivos.md) | Celular, tableta y escritorio por componente; Safari y Chrome; reglas para que los filtros funcionen en Safari |
| [25 · Para talleres](25-talleres.md) | Página de venta del sistema para talleres: oculta hasta que el sistema salga, rutas, datos, componentes que se reutilizan, pantallas del sistema en HTML, pruebas, cómo encenderla |
| [fases/](fases/) | **Un archivo por fase** con pasos, qué consultar y cuándo está listo |
| [prompts](prompts.md) | Un prompt por fase, cómo integrar componentes después, qué hacer entre fases |
| [continuar en local](continuar-en-local.md) | **Empieza aquí para seguir:** cómo arrancar, probar y dónde cambiar cada dato |
| [pendientes en local](pendientes-en-local.md) | **Lo que falta hacer en la Mac:** publicar Aprende, probar en Safari, decisiones del dueño |
| [decisiones](decisiones.md) · [progreso](progreso.md) | Los llena Claude Code mientras construye |

`CLAUDE.md`, en la raíz, resume las reglas para quien programe.

## Material de referencia

| Carpeta | Qué es |
|---|---|
| `reference/mockups/` | Las 4 páginas HTML del mockup (inicio, catálogo, producto, panel) |
| `reference/seed-photos/` | Fotos de ejemplo de los 14 productos (para la semilla) |
| `reference/hero/` | Portada por defecto (escritorio y celular) |
| `reference/mockups/aprende/` | Maquetas de Aprende: una por tipo de pantalla (`index.html`) |
| `reference/mockups/talleres/` | Maquetas de Para talleres: principal, precios y descargar (`index.html`), con las pantallas del sistema dibujadas en HTML |
| `reference/mockups/_base.css`, `_base.js` | Base compartida de las maquetas de Aprende y Para talleres (header, footer, botones, tablas, preguntas) |
| `content/aprende/` | Contenido de Aprende para importar (`21 §8`) |
| `assets/` | Logo (cabeza de Q-404), renders finales de Q-404, fotos de las ideas |

## Por dónde empezar

- **Para entender el plan:** `01` → `02` → `07` → `20`.
- **Para construir:** preparar la carpeta (`prompts.md §0`) y pegar el prompt de la fase 1.
- **Para consultar un tema:** páginas → `04` · textos → `05` · datos → `09` · servidor → `10` · interfaz → `11` · panel → `12` · seguridad → `13` · Aprende → `21`, `22`, `23` · Para talleres → `25`.
