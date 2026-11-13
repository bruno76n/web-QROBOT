# Fase 8 · Panel de Aprende y publicación

**Objetivo:** que el dueño edite Aprende desde el panel, vea qué busca la gente sin encontrarlo y actualice el buscador; y publicar Aprende en `quickrobot.centerdiv.mx`.

**Al terminar existe:** la pestaña **Aprende** del panel (lista, editor, preguntas, publicar, buscador y búsquedas sin resultado) y Aprende en producción con su contenido y su buscador.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-7.md` · `docs/12-panel.md` §1–2, §7–8 · este archivo. En cada paso, solo lo que indica "Consultar". Rama `fase-8` desde `main` con la fase 7 fusionada.

---

## Pasos

### 8.1 Acciones del panel
- **Hacer:** en `src/actions/admin/learn.ts`:

| Acción | Entrada | Hace | Errores |
|---|---|---|---|
| `admin.listLearnPages` | — | Todas las páginas: slug, título, tema, tipo, publicada, editada en el panel | — |
| `admin.getLearnPage` | `{ id }` | Página completa con `body_md` y preguntas | `NOT_FOUND` |
| `admin.saveLearnPage` | `title`, `subtitle`, `summary`, `body_md`, `tags`, `related`, `sources`, `faqs[]` en orden, `published`, `cta`, `ctaText` | Valida con el esquema de `content.ts`, convierte el Markdown (`markdown.ts`), arma `search_text`, marca `edited_in_panel`, todo en un `batch`; después actualiza esa página en Meilisearch (`22 §6`) | `VALIDATION`, `NOT_FOUND`, `UNKNOWN_RELATED` (`details.slugs`), `UNKNOWN_BLOCK` (marca `[[…]]` desconocida) |
| `admin.setLearnPublished` | `{ id, published }` | Interruptor rápido | `NOT_FOUND` |
| `admin.learnSearchMisses` | `{ days }` | Búsquedas sin resultado, sumadas y ordenadas | — |
| `admin.syncLearnIndex` | — | `syncLearnIndex()` completo | `SEARCH_UNAVAILABLE` |

  El `slug`, el tema y el tipo no se editan en el panel (se cambian en `content/aprende/`). Crear y borrar páginas tampoco (se hace con archivos e importador). Textos de los códigos nuevos en `es.ts`. Actualizar `10 §3, §5` y `12`.
- **Consultar:** `10 §3, §5`, `13 §2`, `21 §7–8`, `22 §6, §10`.
- **Prueba:** por acción: camino feliz y cada error; `tests/security/auth.test.ts` suma las acciones nuevas (sin token → `401`, también con entrada inválida).

### 8.2 Panel · lista y editor
- **Hacer:** pestaña **Aprende** en `AdminShell` y `/admin/aprende` (isla `client:only`). Lista con búsqueda, filtro por tema y por estado (Publicadas · Ocultas · Editadas aquí), selección en la URL (`?p=<id>`). Editor con react-hook-form + Zod: Título, Subtítulo, En corto, Cuerpo (área de texto con vista previa que usa el mismo árbol de `markdown.ts`, pintado por `LearnPreview.tsx` sin `dangerouslySetInnerHTML`), Etiquetas, Relacionadas (lista de páginas), Fuentes, Preguntas (agregar, quitar y ordenar con dnd-kit), Llamado, Publicado. Botones Guardar y «Ver página ↗». Aviso de cambios sin guardar como en Productos.
- **Consultar:** `12 §1–2, §7–8`, `21 §5`, `reference/mockups/admin.html` (mismo aspecto que Productos).
- **Listo cuando:** en 390, 820 y 1440; en celular, lista y editor en pantallas separadas como Productos.

### 8.3 Panel · buscador
- **Hacer:** en la misma pestaña, bloque «Buscador» y «Búsquedas sin resultado (30 días)» de `22 §10`.
- **Consultar:** `22 §10`, `18`.

### 8.4 Producción
- **Hacer** (con credenciales; si faltan, dejar la lista exacta en el informe y seguir):
  1. `wrangler.jsonc`: `SEARCH_LIMITER` y `MEILI_HOST` con el valor que dé el dueño.
  2. Si hay Meilisearch: `pnpm learn:search-setup` (el dueño pone `MEILI_MASTER_KEY` en su terminal) y `wrangler secret put MEILI_SEARCH_KEY` / `MEILI_WRITE_KEY`.
  3. `wrangler d1 migrations apply quick-robot-web --remote` (migración `0007`).
  4. `pnpm learn:import --remote --yes --sync` (solo agrega páginas; no borra nada).
  5. `pnpm build && pnpm exec wrangler deploy`.
  6. Revisar en vivo: `/aprende`, un tema, una ficha, el glosario, una búsqueda con resultado y una sin resultado, `/admin/aprende` pide entrar (Access ya cubre `/admin*`; comprobarlo), el sitemap.
  7. `17 §8` con lo que se creó y la fecha.
- **Consultar:** `17`, `22 §2–3, §6`.

### 8.5 Cierre
- **Hacer:** `docs/informe-fase-8.md` con **pendientes del dueño** (Meilisearch si falta, decisiones de `content/aprende/README.md`, fotos de fallas) y **pasos manuales**: mandar el sitemap otra vez en Search Console, revisar las búsquedas sin resultado cada semana para escribir respuestas nuevas.

---

## No hacer en esta fase
- Crear o borrar páginas desde el panel, editar tablas de datos, fotos de fallas, «¿Te sirvió?» (`21 §16`).
- Mostrar llamados a Quick Cerebro.

## Cierre
- Todas las pruebas, `pnpm security` en verde; `informe-fase-8.md` y `progreso.md` al día.
