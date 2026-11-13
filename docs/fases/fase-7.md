# Fase 7 · Páginas y buscador de Aprende

**Objetivo:** las páginas públicas de Aprende y el buscador funcionando: con Meilisearch si está configurado y con D1 si no.

**Al terminar existe:** `/aprende`, cada tema, cada página y el glosario, iguales a las maquetas donde las hay; tablas con filtros, ¿Cabe mi pieza? y calculadora; el buscador encuentra al teclear y, sin resultados, ofrece preguntar por WhatsApp. «Aprende» está en el menú.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-6.md` · `docs/21-aprende.md` · `docs/22-buscador.md` · este archivo. En cada paso, solo lo que indica "Consultar". Rama `fase-7` desde `main` con la fase 6 fusionada.

---

## Pasos

### 7.1 Pintar el contenido
- **Hacer:** `src/components/learn/Content.astro` y `Node.astro` (recursivo) para `LearnNode`, `Callout.astro` (Dato curioso, Truco, Cuidado; Q-404 de `public/brand/q404/`), bloque de código con «Copiar», contenedor de tablas con scroll. Las marcas `[[…]]` reciben su componente (en este paso, un hueco con el nombre; se llenan en 7.4).
- **Consultar:** `21 §5`, `13 §6`, `03 §2–4`.
- **Prueba:** `tests/security/learn-injection.test.ts` (`21 §14`): el HTML sale como texto y las ligas prohibidas sin `href`.

### 7.2 Páginas de tema y de respuesta
- **Hacer:** `src/pages/aprende/[...slug].astro` con: migas, encabezado (título, subtítulo, revisado, «En corto»), cuerpo, «En esta página», «También te puede servir», preguntas con anclas, fuentes y llamado según `cta` (con `site.system.enabled`). Página de tema con la lista de sus páginas y chips que la filtran (`<script>`). 404 para lo que no existe o está oculto.
- **Consultar:** `21 §2, §4.1, §4.3–4.4, §4.6`, `reference/mockups/aprende/aprende-filamentos.html` y `aprende-pieza.html`, `04 §7` (estados), `07 §1` (scripts y View Transitions).
- **Listo cuando:** comparado con las maquetas en 390, 820 y 1440; filas en `progreso.md` (las páginas sin maqueta: «igual (sin maqueta)» como la 404).

### 7.3 Portada y glosario
- **Hacer:** `src/pages/aprende/index.astro` (`21 §4.2`; el buscador todavía como formulario que lleva a `/aprende/buscar`) y el glosario (`21 §4.5`).
- **Consultar:** `21 §4.2, §4.5`, `reference/mockups/aprende/aprende.html`.

### 7.4 Datos interactivos
- **Hacer:** `FilamentTable.astro`, `PrinterTable.astro` con ¿Cabe mi pieza? (`fit.ts`), `MaintenanceCalendar.astro` y `CostCalculator.astro` (`cost.ts`), cada uno con su `<script>`; conectarlos a las marcas `[[…]]` de 7.1.
- **Consultar:** `21 §6`, `content/aprende/datos/*.json`, `reference/mockups/aprende/aprende-filamentos.html` (filtros y tarjetas en celular), `15 §2`.
- **Prueba (Playwright):** flujos I, J y K de `21 §15`.

### 7.5 Buscador · servidor
- **Hacer:** `src/server/search.ts` (Meilisearch con el SDK `meilisearch`, tiempo máximo, respaldo en D1, `syncLearnIndex()`), `src/pages/api/aprende/buscar.ts`, `SEARCH_LIMITER` en `wrangler.jsonc` y `env.d.ts`, `MEILI_HOST` en `wrangler.jsonc` (vacío), líneas comentadas en `.dev.vars.example`, conteo de búsquedas sin resultado, `src/pages/aprende/buscar.astro` (sin JavaScript, `noindex`). `pnpm learn:sync` y la opción `--sync` del importador.
- **Consultar:** `22 §3–8, §11`, `13 §4`, `10 §7` (patrón de `/api/click`).
- **Si el SDK `meilisearch` no corre en Workers:** llamar a la API REST con `fetch` (mismas rutas de `22 §6–7`) y anotarlo en `decisiones.md`.
- **Prueba:** los casos de `22 §13` (endpoint, `syncLearnIndex`, seguridad) con Meilisearch simulado; `e2e/urls.ts` suma las rutas nuevas para `headers.spec.ts`.

### 7.6 Buscador · interfaz
- **Hacer:** `src/components/learn/Search.astro` y su `<script>` (`22 §9`): combobox accesible, espera entre teclas, cancelación, ⌘K y «/», chips de tema, resaltado con nodos de texto, estados (buscando, sin resultados con Q-404 y WhatsApp, error). En la portada, grande; en las demás páginas de Aprende, compacto arriba.
- **Consultar:** `22 §9`, `reference/mockups/aprende/aprende.html` (panel de resultados y estado 404), `03 §7`.
- **Prueba (Playwright):** flujos H y L de `21 §15`; teclado completo (abrir con ⌘K, bajar con ↓, abrir con Enter).

### 7.7 Índice de Meilisearch
- **Hacer:** `scripts/learn-search-setup.ts` (`pnpm learn:search-setup`): con `MEILI_HOST` y `MEILI_MASTER_KEY` de la terminal, crea el índice `learn`, aplica los ajustes de `22 §5` y crea las llaves de búsqueda y de escritura (las imprime una vez para guardarlas como secretos). Probar contra un Meilisearch local si hay Docker; si no, solo con el simulado y anotarlo.
- **Consultar:** `22 §2–6, §12`.
- **Si no hay Meilisearch todavía:** no es parada. Todo funciona con D1; anotar en `progreso.md` «Buscador en D1 hasta que el dueño elija dónde corre Meilisearch (`22 §2`)».

### 7.8 Menú, SEO, privacidad y revisión
- **Hacer:** «Aprende» en `es.header.nav` (y en el footer); etiquetas y JSON-LD de `21 §12`; sitemap; línea de privacidad de `22 §11` con `site.privacyUpdated` nuevo; `18` (búsquedas sin resultado como métrica) y `19` al día; `04 §1` (rutas nuevas); `15 §2` (presupuesto de Aprende) y `lighthouserc.json` con las 3 URLs de `21 §13`.
- **Consultar:** `21 §12–13`, `14`, `19 §2`, `22 §11`.
- **Listo cuando:** flujos H–L pasan; axe sin errores serios en portada, tema, ficha, glosario y resultados; `pnpm size` y Lighthouse cumplen; navegar inicio → Aprende → ficha → catálogo → Aprende sin errores de scripts (View Transitions).

---

## No hacer en esta fase
- Panel de Aprende (fase 8).
- Publicar en producción (fase 8).
- Llamados a Quick Cerebro visibles (`site.system.enabled` sigue en `false`).

## Cierre
- Todas las pruebas, `pnpm security` en verde.
- `docs/informe-fase-7.md` y `progreso.md` con cada página de Aprende en 390, 820 y 1440.
