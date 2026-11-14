# 20 · Plan de construcción

El mapa general. **El detalle de cada fase está en su propio archivo** (`docs/fases/fase-N.md`): qué pasos, qué documentos y secciones consultar en cada uno, qué no hacer y cómo saber que quedó bien.

Se trabaja **una fase a la vez**, en modo autónomo (`CLAUDE.md`). Cada fase en su rama `fase-N`, un commit por paso, y al cerrar: `docs/informe-fase-N.md` y `docs/progreso.md` al día.

| Fase | Qué se hace | Qué existe al terminar | Archivo |
|---|---|---|---|
| **1 · Base** | Proyecto Astro con React, Tailwind, shadcn, Geist y tokens; layout con header y footer; herramientas de calidad (lint, pruebas, `pnpm security`, `pnpm size`); D1 y R2 configurados en local; CI; primer despliegue | Una página de inicio con header y footer iguales al mockup, publicada en Cloudflare (o lista para publicarse si faltan credenciales) | [`fases/fase-1.md`](fases/fase-1.md) |
| **2 · Datos y panel** | Esquema y migraciones; semilla; lógica pura (`src/lib/`); consultas y acciones; subida de fotos con recorte y versiones; Access y `requireAdmin`; panel completo (Productos y Portada) | El dueño entra al panel, sube un producto con fotos centradas, lo publica, lo ordena y cambia la portada | [`fases/fase-2.md`](fases/fase-2.md) |
| **3 · Catálogo y producto** | Páginas públicas de catálogo, categorías y producto con datos reales; galería; opciones y WhatsApp; personalizador 3D; SEO, compartir y sitemap; 404 y error | Flujos A, C, D, F y G pasan; cada producto se comparte con su foto | [`fases/fase-3.md`](fases/fase-3.md) |
| **4 · Inicio** | Hero con portadas del panel, Navidad, Ideas (con el componente externo o su reemplazo), Video, Imprimiendo, Q-404, Alberca, Pedido | El inicio completo igual al mockup; flujos B y E pasan | [`fases/fase-4.md`](fases/fase-4.md) |
| **5 · Pulido y lanzamiento** | Toques a WhatsApp, aviso de privacidad, rendimiento y accesibilidad con metas, revisión visual completa, contenido real disponible, **integración de componentes externos**, revisión de seguridad, dominio y lanzamiento | La web pública en el dominio, con metas de `15` cumplidas y lista de pendientes del dueño | [`fases/fase-5.md`](fases/fase-5.md) |
| **6 · Base de Aprende** | Lógica pura (Markdown seguro, ¿cabe mi pieza?, costo, contenido), tablas en D1 (migración `0007`), importador de `content/aprende/`, consultas | El contenido de Aprende cargado en D1 local y listo para pintarse | [`fases/fase-6.md`](fases/fase-6.md) |
| **7 · Páginas y buscador de Aprende** | Portada, temas, páginas, glosario, tablas con filtros, ¿Cabe mi pieza?, calculadora, buscador (Meilisearch con respaldo en D1), menú, SEO, privacidad | Aprende completo en local; flujos H–L pasan | [`fases/fase-7.md`](fases/fase-7.md) |
| **8 · Panel de Aprende y publicación** | Pestaña Aprende del panel (editar, preguntas, publicar, buscador, búsquedas sin resultado) y publicación | Aprende en el dominio, editable desde el panel | [`fases/fase-8.md`](fases/fase-8.md) |
| **9 · Para talleres (oculta)** | Lógica pura (cerrojo, planes, plataforma, barras), piezas compartidas con Aprende (preguntas, tokens), cerrojo en middleware y páginas, pantallas del sistema en HTML, principal, precios y descargar, llamado de Aprende y sitemap condicionados, despliegue con el interruptor apagado | Las 3 páginas completas en `pnpm dev`; en el dominio responden 404 y nada las enlaza | [`fases/fase-9.md`](fases/fase-9.md) |

## Por qué este orden

- **El panel antes que las páginas públicas:** así el catálogo se construye con productos y fotos de verdad (o la semilla pasada por el mismo proceso), no con datos inventados en los componentes.
- **El inicio después del catálogo:** el inicio usa precios y productos (Navidad, Q-404) y el componente de fotos ya probado.
- **Los componentes externos al final:** el dueño puede darlos antes, a la mitad o al final; nunca detienen la construcción (`11 §4`).
- **Para talleres (9) después de Aprende:** reutiliza las preguntas, los tokens y el llamado de Aprende; se publica oculta para que el día que salga el sistema solo haya que encenderla (`25 §13`).
- **Aprende (6–8) después del lanzamiento:** es una sección nueva sobre la web ya publicada; primero la base y el contenido, luego lo que se ve y al final el panel, para que el panel edite páginas que ya existen.
- **Desplegar desde la fase 1:** los problemas de Cloudflare (adaptador, bindings, CSP) salen al principio y no el día del lanzamiento.

## Reglas para todas las fases

1. Leer `CLAUDE.md`, el informe de la fase anterior y el archivo de la fase. **Solo** los documentos que el archivo de la fase indica en cada paso.
2. Lógica pura en `src/lib/` con su prueba **antes** que la pantalla que la usa.
3. Cada acción del panel con su prueba (camino feliz, cada error, fallo a la mitad).
4. Cada pantalla comparada con el mockup en 390, 820 y 1440.
5. Nada fuera del alcance de `01`; ideas nuevas en "Después" de `01`.
6. Textos solo en `src/i18n/es.ts`; datos del negocio solo en `src/config/site.ts`.
7. Un cambio de comportamiento actualiza su documento en el mismo commit.
8. Dependencia nueva que no esté en `06` → anotarla en `docs/decisiones.md`.

## Plantilla del informe (`docs/informe-fase-N.md`)

```
# Informe de la fase N

## Resumen
Dos o tres frases: qué quedó funcionando.

## Pasos
| Paso | Estado | Commit | Notas |

## Pruebas
- Unitarias y de servidor: cuántas, cobertura frente a 16 §4.
- Seguridad: resultado de pnpm security.
- Flujos de Playwright: cuáles pasan.
- Rendimiento: Lighthouse y pnpm size frente a 15.

## Comparación con el mockup
Tabla página/sección × (390 / 820 / 1440): igual / diferencia aceptada (motivo) / pendiente.

## Decisiones tomadas
Enlaces a docs/decisiones.md.

## Pendientes del dueño
Datos, credenciales o componentes que faltan, con el valor provisional que se usó.

## Bloqueado o dudoso
Qué quedó sin hacer y por qué.

## Cómo probarlo
Comandos o pasos exactos.
```
