# Notas del agente «editor» · fase 8, paso 8.2 (lista y editor de Aprende)

## Qué quedó

- Pestaña **Aprende** en la barra del panel y página `/admin/aprende` (`AdminApp view="learn"`, isla `client:only`).
- **Lista** (`learn/LearnList.tsx`): buscar por título o dirección, filtro por tema (lista de `src/config/learn.ts`) y por estado (Todas · Publicadas · Ocultas · Editadas aquí). Cada fila: título, «Tema · Tipo», «Editada aquí» si aplica, y el **interruptor de publicar** (doc 12 §5c). La selección vive en `?p=<id>` (mismo `useUrlSelection` de Productos).
- **Editor** (`learn/LearnForm.tsx`): dirección, tema y tipo solo se muestran; Publicada (interruptor rápido); Lo básico (Título, Subtítulo, En corto); Cuerpo con «Texto | Vista previa»; Preguntas (agregar, quitar, ordenar con dnd-kit, también con teclado); Etiquetas, Relacionadas y Fuentes; Llamado al final (botón y texto). Barra fija: Guardar y «Ver página ↗».
- **Vista previa** (`learn/LearnPreview.tsx`): usa `parseMarkdown` de `src/lib/learn/markdown.ts` y pinta el árbol con elementos de React (sin `dangerouslySetInnerHTML`): títulos, párrafos, negritas, cursivas, código, ligas (en otra pestaña), listas, tablas, bloques de código, recuadros (Dato curioso, Truco, Cuidado), citas y marcas `[[…]]` como un recuadro con su nombre. Una marca que no existe sale como recuadro rojo «Este bloque no existe: [[…]]».
- Prueba `e2e/admin-learn.spec.ts` (390, 820, 1440, 15 pruebas) y `learn/form.test.ts` (Vitest).

## Decisiones (anotar en `docs/decisiones.md` al fusionar)

1. **El interruptor «Publicada» guarda solo, aparte de «Guardar»** (`admin.setLearnPublished`), en la fila y en el editor. Se mueve al momento (escribe el estado en la caché de la lista y de la página) y regresa si el servidor falla. «Guardar» manda el estado de publicada que hay en ese momento, así que nunca lo deshace. Por eso `published` no forma parte del formulario ni marca «Sin guardar».
2. **Validación:** el formulario usa `learnPageInputSchema` sin `id` ni `published` (`learnFormSchema` en `learn/form.ts`) con un mapa de errores en español (`learnFormError`: obligatorio, máximo de caracteres, «Caben hasta N.», y si no «Revisa los campos marcados.»). Los errores del servidor se ponen junto a su campo: `UNKNOWN_BLOCK` bajo el Cuerpo (y vuelve a «Texto»), `UNKNOWN_RELATED` bajo Relacionadas, `VALIDATION` en el campo que nombre; además del aviso con `errorText`. `search: 'failed'` muestra `SEARCH_NOT_UPDATED` como advertencia (al guardar y con el interruptor).
3. **Relacionadas y Fuentes** se eligen con una lista de lo elegido (cada una con «Quitar») y un selector para agregar otra; con 48 fuentes y 118 páginas, casillas como las de categorías no caben. El orden es el de elección. Una relacionada que ya no existe se marca en rojo con «ya no existe». Las relacionadas no se arrastran (no lo pide el doc).
4. **Etiquetas** como fichas con «×» y un campo: Enter, coma o salir del campo la agrega; vacías y repetidas (sin importar mayúsculas) no.
5. **Vista previa** en el mismo recuadro del Cuerpo con un selector «Texto | Vista previa» (sirve igual en el celular). Se carga aparte (`React.lazy`) porque trae el convertidor de Markdown.
6. **«Ver página ↗»** solo si la página está publicada, como en Productos (oculta da 404). La portada de Aprende (slug vacío) liga a `/aprende`.
7. **Bloque del buscador** (`LearnSearchPanel`, del agente «buscador»): montado en la columna de la lista, debajo de la lista, en el mismo scroll (`.learn-scroll`), para que se vea también en el celular (allí `.main` se oculta sin página abierta). Si el buscador lo quiere en otro lugar, se mueve en `LearnList.tsx`.
8. Las llamadas y los hooks de esta pestaña viven en `src/components/admin/learn/api.ts` (no en `lib/api.ts` ni `lib/queries.ts`, que no son de este agente).
9. Nombres de tipo en el panel: Portada, Tema, Ficha, Artículo, Problema, Glosario. La portada de Aprende (sin tema) dice «Aprende» como tema.

## Pedidos fuera de mis archivos

1. **Barra del panel en 390 px (ya pasaba antes):** con tres pestañas la barra mide 634 px y la página se desplaza de lado; con «Aprende» mide 722 px. Propuesta para `src/styles/admin.css` (sección de celular):
   ```css
   @media (max-width: 860px) {
     .bar { gap: 8px; padding: 0 10px; }
     .views { flex: 1 1 auto; min-width: 0; overflow-x: auto; margin-left: 0; }
     .views .vbtn { padding: 0 10px; flex: 0 0 auto; }
     .bar > a.b.ghost { display: none; } /* «Ver catálogo ↗»: el nombre de la marca ya liga al catálogo */
   }
   @media (max-width: 480px) {
     .brand { font-size: 0; gap: 0; } /* solo la cabeza de Q-404 */
   }
   ```
2. **Texto de la pestaña:** está en `es.admin.learn.editor.tab` porque `es.admin.tabs` no es de este bloque. Al fusionar se puede mover a `es.admin.tabs.learn` y cambiar `AdminShell.tsx` (una línea).
3. **Docs:** `docs/12 §1` debe decir «pestañas Productos, Categorías, Portada y Aprende»; `docs/12 §5c` puede sumar lo de las decisiones 1, 3 y 7.
4. `e2e/admin-a11y.spec.ts` podría sumar `/admin/aprende`; mientras, `admin-learn.spec.ts` corre axe en la lista con el editor abierto y en la vista previa.
5. `useUrlSelection.ts` dice «selected product» en su comentario; ahora también sirve a Aprende («selected item»).

## Comprobado

- `pnpm lint` (0 avisos), `pnpm typecheck` (0 errores), `pnpm test` (550), `pnpm security` (8/8).
- `admin-learn.spec.ts` + `admin-a11y.spec.ts` + `admin-products.spec.ts` en 390, 820 y 1440: 51/51.
- La prueba recarga `content/aprende/` (`tsx scripts/learn-import.ts --overwrite`) antes y después; después de correrla, `learn-import` dice 118 sin cambios y 0 editadas en el panel.
- Capturas en 390, 820 y 1440 (lista, editor, vista previa, preguntas, llamado).
