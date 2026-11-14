# 22 · Buscador de Aprende (Meilisearch)

El buscador es lo principal de Aprende (`21`). Encuentra al teclear, tolera errores de dedo («petj» → PETG), entiende sinónimos («se despega» → adherencia) y filtra por tema. Lo hace **Meilisearch**; si Meilisearch no está configurado o no responde, busca en D1 con menos precisión, para que la página nunca se quede sin buscador.

## 1. Cómo se conecta

```
 Navegador ──GET /api/aprende/buscar?q=…──▶ Worker (Astro)
                                              │  Zod + límite de frecuencia
                                              │  MEILI_HOST + MEILI_SEARCH_KEY (secreto)
                                              ├──▶ Meilisearch  POST /indexes/learn/search
                                              │        (si falla o tarda > 1.5 s)
                                              └──▶ D1  searchLearnD1()  (`21 §9`)
 Panel / importador ──syncLearnIndex()──▶ Meilisearch (MEILI_WRITE_KEY)
```

- **El navegador nunca habla con Meilisearch.** Así la CSP sigue igual (`connect-src 'self'`, `13 §3`), ninguna llave sale al navegador y el Worker puede contar las búsquedas sin resultado.
- Meilisearch **no corre dentro de Cloudflare Workers**: necesita su propio servidor (§2).

## 2. Dónde corre

| Opción | Costo (noviembre de 2026) | Notas |
|---|---|---|
| **Meilisearch Cloud**, instancia XS (0.5 vCPU, 1 GB) | Desde unos 20 USD al mes con el disco mínimo (32 GiB); 14 días gratis sin tarjeta | Sin mantenimiento. Elegir la región más cercana a México (EE. UU.) |
| Servidor propio (VPS con Docker) | El motor es gratis (MIT); se paga el VPS | Hay que actualizar, respaldar y vigilar el servidor |

Lo decide el dueño (pendiente en `01`). Mientras no exista, todo funciona con la búsqueda en D1 (§8). El código no cambia entre una opción y otra: solo `MEILI_HOST` y las llaves.

Versión: la estable más reciente al construir; se anota en `decisiones.md`.

## 3. Variables, secretos y límite

| Nombre | Tipo | Dónde | Notas |
|---|---|---|---|
| `MEILI_HOST` | variable | `wrangler.jsonc` (`''` = sin Meilisearch) | Por ejemplo `https://ms-xxxx.meilisearch.io` |
| `MEILI_SEARCH_KEY` | secreto | `wrangler secret put` | Llave con solo `search` sobre el índice `learn` |
| `MEILI_WRITE_KEY` | secreto | `wrangler secret put` | Llave con `documents.add`, `documents.delete`, `indexes.create`, `indexes.get`, `indexes.swap`, `indexes.delete`, `settings.update` y `tasks.get` sobre `learn` y `learn_tmp` (`indexes.get` para saber si `learn` ya existe antes del intercambio) |
| `MEILI_MASTER_KEY` | solo en la terminal del dueño | Nunca en el repositorio ni en el Worker | La usa `pnpm learn:search-setup` para crear el índice y las dos llaves |
| `SEARCH_LIMITER` | binding de Rate Limiting | `wrangler.jsonc` | 60 búsquedas por minuto por IP (`namespace_id: "1002"`) |

En local van en `.dev.vars.local` (agregar las líneas comentadas a `.dev.vars.example`).

## 4. El índice `learn`

Un documento por cosa que se puede encontrar:

| Tipo (`type`) | id | `title` | `text` | `url` |
|---|---|---|---|---|
| `page` | `p_<pageId>` | Título de la página | `summary` | `/aprende/<slug>` |
| `faq` | `f_<faqId>` | La pregunta | La respuesta | `/aprende/<slug>#pregunta-<n>` |
| `term` | `t_<slug del término>` | Término (y su nombre en inglés) | Definición | `/aprende/glosario#<slug>` |
| `printer` | `i_<slug de marca y modelo>` | «Bambu Lab P1S» | «256 × 256 × 256 mm · cerrada» | `/aprende/maquinas/volumen-de-impresion#<slug>` |

Campos de todos: `id`, `type`, `title`, `text`, `body` (texto plano del cuerpo, hasta 2,000 caracteres; solo en `page`), `tags`, `topic`, `topicLabel`, `audience`, `pageId`, `url`, `order`.

Los arma una función pura, `buildSearchDocs()` en `src/lib/learn/search-docs.ts`, a partir de las filas de D1 (páginas publicadas, sus preguntas, el glosario y `impresoras`). Las páginas ocultas no entran.

## 5. Ajustes del índice

Se aplican con `pnpm learn:search-setup` y en cada sincronización completa:

```json
{
  "searchableAttributes": ["title", "tags", "text", "body"],
  "filterableAttributes": ["topic", "type", "audience", "pageId"],
  "sortableAttributes": ["order"],
  "displayedAttributes": ["id", "type", "title", "text", "url", "topic", "topicLabel"],
  "localizedAttributes": [{ "attributePatterns": ["*"], "locales": ["spa"] }],
  "synonyms": "← content/aprende/buscador.json › synonyms",
  "stopWords": "← content/aprende/buscador.json › stopWords",
  "typoTolerance": { "enabled": true, "minWordSizeForTypos": { "oneTypo": 4, "twoTypos": 8 } },
  "pagination": { "maxTotalHits": 50 }
}
```

Los sinónimos de `buscador.json` son de un sentido («se despega» → «adhesion», «primera capa»); al aplicarlos se mandan tal cual (Meilisearch acepta sinónimos de un sentido).

## 6. Sincronizar el índice

`syncLearnIndex()` (`src/server/search.ts`), con `MEILI_WRITE_KEY`:

1. Lee de D1 y arma los documentos (`buildSearchDocs`).
2. Crea `learn_tmp`, le pone los ajustes de §5, carga los documentos y espera sus tareas.
3. Intercambia `learn_tmp` con `learn` (`swap-indexes`) y borra el viejo. Así nunca hay un momento con el índice vacío.
4. Guarda en `settings`: `learn_index_synced_at` (fecha) y `learn_index_docs` (cantidad).

Cuándo corre:
- `pnpm learn:sync` (local o `--remote`) y `pnpm learn:import --sync`.
- Botón «Actualizar buscador» del panel (fase 8).
- Al guardar una página en el panel o usar su interruptor de publicar: solo esa página (`updateLearnPageIndex`, en `src/server/search-index.ts`: borra por filtro `pageId = …` y agrega sus documentos; una página oculta solo se borra), sin `swap`. Si Meilisearch falla, la página queda guardada y la acción responde éxito con `search: 'failed'`; el panel avisa que se actualice el buscador.

Sin `MEILI_HOST` no hace nada y lo dice (`{ ok: true, skipped: true }`).

## 7. Buscar (`GET /api/aprende/buscar`)

`src/pages/api/aprende/buscar.ts`:

1. **Límite** con `SEARCH_LIMITER` (llave = IP, que no se guarda). Si se pasa: `429`.
2. **Entrada** con Zod: `q` de 1 a 80 caracteres después de quitar espacios; `tema` vacío o un id de `src/config/learn.ts`. Si no: `400`.
3. **Meilisearch** (si hay `MEILI_HOST`): `POST /indexes/learn/search` con `limit: 8`, filtro `topic = "<tema>"` si viene, `attributesToHighlight: ["title", "text"]`, `attributesToCrop: ["text"]`, `cropLength: 24`, marcas de resaltado `\u0001` y `\u0002`, y tiempo máximo de 1.5 s (`AbortSignal.timeout`).
4. **Si falla o tarda:** `searchLearnD1()` (§8) y se registra en los logs del Worker (sin la búsqueda completa: solo su largo).
5. **Respuesta:**

```json
{
  "query": "petj",
  "total": 3,
  "source": "meili",
  "hits": [
    {
      "type": "page",
      "url": "/aprende/filamentos/petg",
      "topicLabel": "Filamentos",
      "title": [{ "t": "PETG", "m": true }],
      "text": [{ "t": "Aguanta más golpes que el PLA…", "m": false }]
    }
  ]
}
```

   El resaltado llega partido en segmentos (`{ t: texto, m: resaltado }`) por la función pura `splitHighlight()`; el navegador los pinta con nodos de texto y `<mark>`, **nunca con `innerHTML`**.
6. **Sin resultados** y `q` de 3 caracteres o más: suma 1 en `learn_search_misses` del día con la búsqueda normalizada (minúsculas, sin acentos, espacios simples, máximo 80). Se hace sin bloquear la respuesta (`waitUntil` del contexto de Cloudflare, según la versión del adaptador).
7. Cabeceras: `Cache-Control: public, max-age=60`. Errores: `{ ok: false, code }` sin detalles técnicos.

## 8. Búsqueda en D1 (respaldo y desarrollo)

`searchLearnD1(query, topic?)` en `src/server/queries/learn.ts`:

1. Normaliza la búsqueda (como §7.6) y la parte en palabras; quita las de `stopWords`.
2. Agrega los sinónimos de `buscador.json` (`expandSynonyms()`, pura, en `src/lib/learn/content.ts`).
3. Busca cada palabra dentro de `learn_pages.search_text` (título, subtítulo, `summary`, `tags` y preguntas, ya normalizados al importar o guardar) de las páginas publicadas, con `instr()`: D1 limita los patrones de `LIKE` a 50 bytes y `instr` no necesita escapar `%` ni `_`.
4. Si eso no encuentra nada, compara las palabras de 4 letras o más con los títulos y etiquetas de todas las páginas publicadas, con la misma tolerancia que Meilisearch (1 error desde 4 letras, 2 desde 8; `src/lib/learn/fuzzy.ts`). Así «petj» encuentra PETG aunque no haya Meilisearch.
5. Ordena: palabra en el título > en `tags` > en el resto; empate por `sort_order`. Máximo 8. Las palabras buscadas se resaltan en el título y la frase (`highlightWords`).

Solo encuentra páginas (no preguntas sueltas, términos ni impresoras: eso lo agrega Meilisearch). La página `/aprende/buscar?q=` (sin JavaScript) usa la misma función que el endpoint: Meilisearch si hay, si no D1.

## 9. Interfaz

`src/components/learn/Search.astro` + su `<script>` (sin React).

- **Campo** con `role="combobox"`, `aria-expanded`, `aria-controls` y lista de resultados `role="listbox"` (patrón de combobox de WAI-ARIA). Dentro de un `<form action="/aprende/buscar">`: sin JavaScript, Enter lleva a la página de resultados.
- Busca desde **2 caracteres**, con 150 ms de espera entre teclas; cancela la búsqueda anterior (`AbortController`).
- Teclado: ↑ ↓ para moverse, Enter abre, Esc cierra. **⌘K / Ctrl+K** y **«/»** enfocan el buscador desde cualquier página de Aprende.
- Chips de tema dentro del panel de resultados: «Todo» + los temas (§3 de `21`).
- Cada resultado: tipo («Página», «Pregunta», «Término», «Impresora»), título con resaltado, frase y tema.

| Estado | Muestra |
|---|---|
| Buscando | «Buscando…» (sin parpadeo: aparece después de 300 ms) |
| Sin resultados | Q-404 + «404: no encontramos «{q}». Prueba con otras palabras.», los temas y «¿Lo preguntamos por ti?» → WhatsApp con «Hola, busqué «{q}» en Aprende y no encontré la respuesta.» (`src/lib/whatsapp.ts › learnMissMessage`) |
| Error o `429` | «No pudimos buscar. Intenta de nuevo.» |
| Resultados | «{n} resultados» (para lectores de pantalla, `aria-live="polite"`) |

Textos en `es.ts › learn.search`.

## 10. Panel

En `/admin/aprende` (fase 8, `12`):
- «Buscador»: fecha de la última sincronización, cantidad de documentos y botón «Actualizar buscador» (`admin.syncLearnIndex`). Sin `MEILI_HOST`: «El buscador usa la base de datos. Configura Meilisearch para que tolere errores de dedo.»
- «Búsquedas sin resultado (30 días)»: búsqueda y veces, de más a menos (`admin.learnSearchMisses`). Sirve para decidir qué respuesta escribir.

## 11. Privacidad

Las búsquedas sin resultado se guardan como texto, **sin nada que identifique a quien buscó** (ni IP ni fecha exacta: solo el día). El aviso de privacidad (`19 §2`, `es.ts › privacy`) suma esa línea y cambia `site.privacyUpdated`.

## 12. Desarrollo local

- Sin `MEILI_HOST`: busca en D1. Es lo normal en `pnpm dev`.
- Con Meilisearch local (opcional): `docker run -p 7700:7700 -e MEILI_MASTER_KEY=dev getmeili/meilisearch:<versión>`, y en `.dev.vars.local`: `MEILI_HOST=http://localhost:7700` y las llaves que imprime `pnpm learn:search-setup`.
- Las pruebas usan un `fetch` simulado para Meilisearch; no necesitan Docker.

## 13. Pruebas

| Qué | Casos |
|---|---|
| `buildSearchDocs` | Página oculta no entra; una pregunta por documento con su ancla; glosario e impresoras con su `url`; `body` recortado a 2,000 |
| `splitHighlight` | Sin marcas; una marca; varias; marca al inicio y al final; texto con `<script>` sale como texto |
| `normalizeQuery`, `expandSynonyms` | Acentos, mayúsculas, espacios; «se despega» agrega «adhesion» |
| Endpoint | Camino feliz (Meilisearch simulado); Meilisearch caído → `source: "d1"`; `q` vacía o de 81 caracteres → `400`; `tema` desconocido → `400`; sin resultados suma en `learn_search_misses` y no guarda IP; `429` con el limitador |
| `syncLearnIndex` | Arma, carga e intercambia; sin `MEILI_HOST` → `skipped` |
| Seguridad (`13 §10`) | Agregar el endpoint a `click.test.ts` o a uno propio: no guarda IP, límite, entrada inválida |
| Flujos | H y L de `21 §15` |
