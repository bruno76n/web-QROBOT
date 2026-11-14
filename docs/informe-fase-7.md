# Informe de la fase 7

## Resumen
Aprende ya se ve y se usa en local: portada, los 11 temas, las 116 respuestas publicadas y el glosario, iguales a las maquetas; tabla de filamentos con filtros, tabla de impresoras con ¿Cabe mi pieza?, calendario de mantenimiento y calculadora de costo; y el buscador, que encuentra al teclear, aguanta errores de dedo («petj» → PETG) y, sin resultados, ofrece preguntar por WhatsApp. Usa Meilisearch si está configurado y D1 si no. «Aprende» está en el menú y en el footer. No se publicó en producción (fase 8).

Antes de la fase se estabilizaron las pruebas del panel que fallaban a veces (ordenar con teclado, centrar la foto, volver a la lista): ya están en `main`.

## Pasos
| Paso | Estado | Notas |
|---|---|---|
| 7.1 Pintar el contenido | Listo | `Content`/`Node`/`Inline`/`Callout`/`Mark`; tablas con scroll y aviso de que siguen; código con «Copiar»; `tests/security/learn-injection.astro.test.ts` |
| 7.2 Páginas de tema y de respuesta | Listo | `src/pages/aprende/[...slug].astro`: migas, encabezado, «En esta página», relacionadas, preguntas con ancla, fuentes, llamado; chips que filtran el tema; 404 para lo oculto |
| 7.3 Portada y glosario | Listo | Portada con buscador grande, temas con conteo (glosario: términos), filamentos de un vistazo, más buscado y dato del día; glosario A–Z |
| 7.4 Datos interactivos | Listo | `FilamentTable`, `PrinterTable` + `FitTool`, `MaintenanceCalendar`, `CostCalculator`; lógica pura en `fit.ts`, `cost.ts`, `tables.ts` |
| 7.5 Buscador · servidor | Listo | `src/server/search.ts` + `search-index.ts`, `GET /api/aprende/buscar` (Zod, `SEARCH_LIMITER`, búsquedas sin resultado sin IP), `/aprende/buscar` sin JavaScript, `pnpm learn:sync` y `learn:import --sync` (local) |
| 7.6 Buscador · interfaz | Listo | Combobox accesible, 150 ms entre teclas, cancela la búsqueda anterior, ⌘K/Ctrl+K y «/», hoja a pantalla completa en celular, Q-404 sin resultados |
| 7.7 Índice de Meilisearch | Listo con el simulado | `pnpm learn:search-setup` crea el índice y las dos llaves; sin Meilisearch real aquí (ver «Bloqueado o dudoso») |
| 7.8 Menú, SEO, privacidad y revisión | Listo | Menú y footer, JSON-LD (`BreadcrumbList`, `Article`, `DefinedTermSet`), sitemap, línea de privacidad (`privacyUpdated` 2026-11-14), `target` de Safari 14, proyecto `webkit` condicional, presupuestos y Lighthouse |

## Pruebas
- **Vitest: 428** (unit, servidor y el proyecto nuevo `astro` para componentes). Nuevas: `fuzzy`, `tables`, `glossary`, búsqueda en D1 con «petj» y con `instr`, buscador del servidor con Meilisearch simulado (camino feliz, caído → D1, `400`, `429`, búsquedas sin resultado sin IP, `syncLearnIndex` con intercambio de índices), inyección al pintar.
- **Playwright público: 241** en 390, 820 y 1440, incluidos los flujos **H, I, J, K y L**, el teclado completo, la búsqueda sin JavaScript, la navegación inicio → Aprende → ficha → catálogo → Aprende sin errores, y 360 px (portada, filamentos, ¿Cabe mi pieza?, calculadora). axe sin errores serios en portada, tema, ficha, glosario y resultados.
- **Panel: 63/63** (con el header y el footer nuevos).
- **`pnpm security`: 5/5.** `pnpm lint` y `pnpm typecheck`: limpios.
- **`pnpm size`:** Aprende 9.9–11.3 KB al abrir (presupuesto 25), sin `requestIdleCallback(` ni *lookbehind*.
- **Lighthouse (celular):** `/aprende`, `/aprende/filamentos` y `/aprende/filamentos/pla` 100/100/100/100; el resto de la web igual que antes.

## Comparación con el mockup
Tabla completa en `docs/progreso.md › Aprende`. Todo igual salvo diferencias aceptadas (`21 §11`): header y footer reales de la web, dos cuadros cuando el contenido trae dos citas, sin foto de Q-404 en el artículo para clientes, resultados solo de páginas cuando responde D1 y la etiqueta «Dato curioso» más oscura por contraste.

## Decisiones tomadas
`docs/decisiones.md`: «Pruebas del panel estables» y «Fase 7: páginas y buscador de Aprende».

## Pendientes del dueño
- **Dónde corre Meilisearch** (Cloud o servidor propio, `22 §2`). Mientras tanto el buscador usa D1, que ya tolera errores de dedo en títulos y etiquetas.
- Anticipo y formas de pago, envíos, urgentes y personajes con licencia (`encargar/pago` y `encargar/personajes` siguen ocultas).

## Bloqueado o dudoso
- **Meilisearch real:** sin Docker y sin permiso para ejecutar el binario en este entorno; probado con un Meilisearch simulado. `pnpm learn:search-setup` sin probar.
- **WebKit (Safari):** no está instalado aquí y no se pueden instalar navegadores. El proyecto `webkit` se activa solo; en la Mac: `pnpm exec playwright install webkit` y `pnpm e2e`. Además, revisión a mano en iPhone y Safari antes de publicar (`24 §6.3`, fase 8).
- **Producción:** sin cambios. La migración `0007` y el contenido se cargan en la fase 8.

## Cómo probarlo
```bash
pnpm install
pnpm dev                       # http://localhost:4321/aprende (carga el contenido si la base está vacía)
pnpm learn:import --overwrite  # vuelve a cargar content/aprende/ en la base local
pnpm test && pnpm lint && pnpm typecheck && pnpm security
pnpm build && pnpm size && pnpm e2e && pnpm lhci
```
