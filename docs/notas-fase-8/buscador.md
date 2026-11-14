# Notas · agente «buscador» (fase 8, paso 8.3)

Bloque «Buscador» y «Búsquedas sin resultado (30 días)» de la pestaña Aprende del panel (`22 §10`, `12 §5c`, `18 §2b`).

## Qué quedó

- `src/components/admin/learn/LearnSearchPanel.tsx` (`export default`, sin props): dos cajas `.box` seguidas.
  - **Buscador:** con Meilisearch, «Última actualización: 14 de noviembre de 2026, 10:32 · 124 documentos.» (o «Todavía no se ha actualizado…» si nunca se sincronizó) y el botón «Actualizar buscador» en `b pri` con una nota corta al lado. Sin Meilisearch, el texto de `22 §10` («El buscador usa la base de datos. Configura Meilisearch para que tolere errores de dedo.») y el botón en `b` (secundario).
  - El botón llama `admin.syncLearnIndex`: mientras corre dice «Actualizando…» y se desactiva (`aria-busy`); éxito → toast «Buscador actualizado: N documentos.»; `skipped` → toast neutro «No hacía falta: el buscador ya lee la base de datos.»; error → `toast.error(errorText(res))` (`SEARCH_UNAVAILABLE` ya tiene texto en `es.admin.errors`). Después recarga el estado.
  - **Búsquedas sin resultado (30 días):** lista `ol.list > li.it` con la búsqueda y «N veces» / «1 vez», en el orden que da el servidor (de más a menos, empates por orden alfabético). Vacía: «Nadie se quedó sin respuesta en los últimos 30 días. Cuando alguien busque algo que no está, aparece aquí.»
  - Cargando: esqueletos `.sk`; si falla la carga, el texto de `errorText` del error (nunca el técnico).
- `src/lib/learn/search-admin.ts` (+ prueba): `formatSyncedAt(iso, timeZone)` → «14 de noviembre de 2026, 10:32», en la zona del negocio (`site.timeZone`), reloj de 24 h; armado con `formatToParts` para no depender del «a las» que pone cada versión de ICU. Fecha ilegible → `null` (se muestra como «Todavía no se ha actualizado…»).
- Textos en `es.admin.learn.search` (entre mis marcas).
- Prueba `e2e/admin-learn-search.spec.ts` (390, 820, 1440): búsquedas sin resultado por `GET /api/aprende/buscar` aparecen con sus veces y de más a menos; sin Meilisearch el bloque lo dice y el botón responde `skipped`; axe sin errores serios. Antes y después borra de la D1 **local** solo sus propias búsquedas (prefijo `zzq`, con `wrangler d1 execute DB --local`), para que no se acumulen más allá de las 100 filas que muestra el panel.

## Decisiones

1. **Sin Meilisearch el botón se ve, pero secundario**, y al tocarlo avisa que no hacía falta (`skipped`). `22 §10` no dice si se esconde; así el bloque explica el caso y el botón «responde» sin error (lo pide la prueba del encargo).
2. **Sin botón para copiar cada búsqueda:** ni `22 §10` ni `12 §5c` lo piden (regla «nada fuera de `docs/01`»). El texto se puede seleccionar; las largas se cortan con «…» y muestran completo en `title`.
3. **Sin aviso de «se muestran las 100 más buscadas»:** el límite vive en `src/server/queries/learn.ts` (`searchMissesLimit`) y el panel no lo puede importar; con pocas búsquedas no hace falta.
4. **Privacidad (`22 §11`, `18 §2b`):** solo se muestra la búsqueda y sus veces sumadas; nada de días ni de quién.
5. La llamada a las acciones va directa con `callAction(() => actions.admin.…)` y una llave de caché propia (`['learnSearch', 30]`), porque `lib/api.ts` y `lib/queries.ts` no son míos.

## Pedidos para integrar (fuera de mis archivos)

1. **Vista de la pestaña** (agente «editor»): montar `<LearnSearchPanel />` dentro de `AdminApp` (que da el `QueryClientProvider` y el `Toaster` de sonner), en la columna `.ed` de la vista de Aprende, donde el mockup de la pestaña lo ponga (sin página elegida, en lugar del vacío «Elige…», o abajo de la lista). No necesita props.
2. **Borrar** `src/pages/dev/admin-learn-search.astro` y `src/components/admin/learn/LearnSearchDevApp.tsx` (solo existen para probar el bloque suelto).
3. **Cambiar la prueba** `e2e/admin-learn-search.spec.ts`: `PAGE` → la dirección real de la pestaña (p. ej. `/admin/aprende`), y si la vista abre otra cosa primero, llegar al bloque antes de `open()`. Lo demás sigue igual.
4. Opcional: si `lib/api.ts` suma `learnSearchMisses` / `syncLearnIndex`, cambiar mis dos `callAction(() => actions.admin.…)` por `api.…`, y mover la llave a `keys` de `lib/queries.ts`.
