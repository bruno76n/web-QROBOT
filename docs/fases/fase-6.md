# Fase 6 · Base de Aprende

**Objetivo:** todo lo que Aprende necesita debajo de las páginas: la lógica pura (Markdown seguro, ¿cabe mi pieza?, costo, contenido), las tablas en D1, el importador del contenido y las consultas.

**Al terminar existe:** en local, `pnpm learn:import` carga las 118 páginas, sus preguntas, las tablas de datos, las fuentes y la configuración del buscador en D1; las consultas devuelven cada página lista para pintarse. Todavía no hay páginas públicas.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-5.md` · `docs/progreso.md` (lo hecho después de la fase 5) · `docs/21-aprende.md` §1–3, §5, §7–9 · este archivo. En cada paso, solo lo que indica "Consultar". Crear la rama `fase-6` desde `main`.

---

## Pasos

### 6.1 Alcance, dependencias y decisiones
- **Hacer:** revisar que `01` ya tiene Aprende en el alcance, la decisión W17 y sus pendientes del dueño (los agregó el dueño). Instalar `mdast-util-from-markdown`, `micromark-extension-gfm`, `mdast-util-gfm`, `yaml` y `meilisearch`; registrar en `06` y `decisiones.md` por qué cada una (regla 2 de `CLAUDE.md`). Agregar `--lilac: #f1ecfd` a los tokens (`03 §2`, `global.css`).
- **Consultar:** `21 §1, §5`, `22 §1–2`, `06`.
- **Listo cuando:** `pnpm install` limpio, `pnpm audit --prod` sin altas ni críticas, documentos al día.

### 6.2 Lógica pura
- **Hacer:** en `src/lib/learn/`: `markdown.ts` (Markdown → `LearnNode[]` con lista blanca, ids de encabezados, `toc`, texto plano), `content.ts` (esquemas Zod de página, datos, fuentes y `buscador.json`; `learnUrl()`; `normalizeQuery()`; `expandSynonyms()`), `fit.ts`, `cost.ts`, `heat.ts` (nivel de calor por HDT), `search-docs.ts` (`buildSearchDocs()`, `splitHighlight()`). En `src/lib/whatsapp.ts`: `learnQuoteMessage()` y `learnMissMessage()`. Cada archivo con su prueba.
- **Consultar:** `21 §5–6`, `21 §15` (casos obligatorios), `22 §4, §7–8, §13`, `16 §4`.
- **Listo cuando:** todos los casos obligatorios pasan; cobertura de `src/lib/` ≥ 90 %.

### 6.3 Configuración y textos
- **Hacer:** `src/config/learn.ts` (11 temas de `21 §3` con id, nombre, frase y orden), `site.system = { enabled: false }` en `src/config/site.ts`, y `es.ts › learn` con los textos de `21 §10` y `22 §9`.
- **Consultar:** `21 §3, §4.6, §10`, `22 §9`, `05 §1`, `23 §1` (reglas de redacción).

### 6.4 Esquema y migración
- **Hacer:** las 5 tablas de `21 §7` con sus índices en `schema.ts` y la migración `0007`. Actualizar `09` (tablas, índices, `settings`) y `08` (carpetas nuevas: `content/`, `src/lib/learn/`, `src/components/learn/`).
- **Consultar:** `21 §7`, `09 §1–2`.
- **Listo cuando:** `pnpm db:migrate` crea todo en D1 local; prueba que inserta y lee una página con preguntas.

### 6.5 Importador
- **Hacer:** `scripts/learn-import.ts` y `pnpm learn:import` con `--if-empty`, `--overwrite`, `--prune`, `--remote --yes` y `--sync` (el `--sync` solo llama a `syncLearnIndex()`, que se construye en la fase 7: por ahora deja la opción y avisa «el buscador se sincroniza desde la fase 7»). `scripts/dev.mjs` corre `learn:import --if-empty`. Se niega a `--remote` sin `--yes`.
- **Consultar:** `21 §8`, `content/aprende/README.md`, `09 §4` (cómo la semilla escribe en D1 local), `17 §2–3`.
- **Prueba:** con archivos de prueba en `tests/fixtures/learn/`: primera carga, segunda sin cambios, página con `edited_in_panel` no se toca, `--overwrite`, error que dice archivo y campo, liga interna rota → aviso. Y la carga real de `content/aprende/` sin errores (118 páginas; las 2 de `published: false` cargadas pero ocultas).

### 6.6 Consultas
- **Hacer:** `src/server/queries/learn.ts` con las funciones de `21 §9` (incluida `searchLearnD1`, `22 §8`). Actualizar `10 §2`.
- **Consultar:** `21 §9`, `22 §8`, `10 §2`, `15 §5`.
- **Prueba:** página publicada con todo lo que pide; oculta → `null`; tema con y sin páginas; datos de las marcas `[[…]]`; búsqueda en D1 con sinónimo («se despega» encuentra la primera capa) y con filtro de tema; cada página en 3 consultas o menos.

---

## No hacer en esta fase
- Páginas públicas, buscador con Meilisearch, panel (fases 7 y 8).
- Cambiar el texto del contenido: si algo no pasa la validación, se corrige en `content/aprende/` y se anota en `decisiones.md`.
- Importar a producción.

## Cierre
- Todas las pruebas, `pnpm security` en verde.
- `docs/informe-fase-6.md` (plantilla en `20`), `docs/progreso.md` con una sección «Aprende».
