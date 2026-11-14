# Notas · agente «precios» · paso 9.8 (Precios)

Página `/talleres/precios` (`25 §7.2`) contra `reference/mockups/talleres/precios.html`.

## Qué se hizo

- `src/pages/talleres/precios.astro`: encabezado (`h1` «Precios», frase, `PeriodToggle`) → `PlanBand headingLevel={2}` → Prueba y Precio de fundador (`site.system.trialDays`, `founderSeats`) → Comparación (`SectionHead` + `CompareTable`, banda gris) → Pago (`Faqs` con `side`, `headingClass="t-h2"`, `headingId="pay-h"`, 5 preguntas) → `EndCta`. Conserva `export const prerender = false;` y el cerrojo `if (!systemVisible) return Astro.rewrite('/404');`.
- `src/components/system/PeriodToggle.astro` (`.seg`, `role="group"`, `aria-pressed`) y su script `src/scripts/system-period.ts`: arranca en `astro:page-load`, limpia en `astro:before-swap` con `AbortController`; al cambiar el periodo solo copia `data-{monthly|yearly}-{amount|per|note}` de cada `[data-plan-price]` a su `b`, su `span` y su `.price-yr` (`textContent`). `PlanBand` no se tocó.
- `src/components/system/CompareTable.astro`: columnas = `site.system.plans` (nombres de `es.system.plans`), la del recomendado resaltada (`hl`); filas de `compareGroups` (mi bloque de `config/system.ts`): límites con `limitLabel` y «Ilimitadas»/«Ilimitados»; ✓ (lucide `check`) con «Incluido» y «—» con «No incluido» para lectores; las filas de Equipo se marcan solo en los planes con `roles`; la fila de Soporte por plan (—, «Sí», «Prioritario»). `caption` para lectores con los nombres de los planes.
- Textos en `es.system.pricing` (mi bloque); filas de la comparación en `config/system.ts` (mi bloque: `CompareLimit`, `CompareRow`, `compareGroups`).
- Pruebas: `tests/system-compare.test.ts` (cada fila de límite usa un límite que existe en los planes —con `dataProblems`—, cada grupo y fila tiene texto y ninguna se repite, Soporte nombra todos los planes, hay plan con roles, el `caption`) y `e2e/dev-talleres-precios.spec.ts` (flujo **N**: Anual → $1,490 y «Equivale a $124 al mes», Mensual → $149 y «o $1,490 al año»; sin JavaScript se ve $149 y «o $1,490 al año»; ida a `/talleres` por el nombre de la barra y vuelta por «Precios» de la barra —en celular dentro del menú— sin recarga completa, y el periodo sigue funcionando).

## Decisiones

- **Sin JavaScript el selector se ve** (como en la maqueta) con «Mensual» presionado; no hace nada, y los precios muestran el mensual con su línea anual. Ocultarlo hasta que cargue el script movería la página al cargar.
- **Nombre accesible de «Anual»:** se escribe un espacio entre «Anual» y «2 meses gratis» (si no, el lector lee «Anual2 meses gratis»); el margen de `small` baja de 6 a 2 px para que el botón mida lo mismo (255 px el grupo, igual que la maqueta).
- **Palomita:** lucide `check` (20 px, trazo 2.6, `--green-d`) en lugar del trazo de la maqueta; se pone `display: inline` porque la base de Tailwind vuelve bloque a todo `svg` y la fila crecía 1 px en celular.
- **Filas de Equipo** (`in: 'roles'`) se marcan según `plan.roles` de `site.system.plans`, no a mano; Soporte (`plans: { free: null, shop: 'yes', business: 'priority' }`) es estructura en `config/system.ts` porque `Plan` no tiene ese dato.
- El periodo no se recuerda al navegar: al volver a Precios la página llega en mensual (como la maqueta al recargar).
- **Puerto:** el 4336 lo ocupaba un servidor de desarrollo de otro worktree (`wt-fase9/principal`, que levantó dos y el segundo cayó en 4336). No lo toqué: usé el **4346** para el servidor y la spec (`ADMIN_PORT=4346`). `pnpm security` falló solo porque el 4321 lo usaba otro worktree; con `PORT=4356 pnpm exec playwright test tests/security` pasan las 45 pruebas, y los otros 7 pasos de `pnpm security` pasan.

## Diferencias con la maqueta

| Qué | Maqueta | Web | Por qué |
|---|---|---|---|
| Nota bajo los planes | «Precios en pesos mexicanos, IVA incluido.» | Además «Prueba de 14 días del plan Negocio, sin tarjeta.» (+22 px en 360 y 390; en 820 y 1440 cabe en la línea) | La nota la pone `PlanBand` con `es.system.plans.note(trialDays)`, que es la de la principal; `PlanBand` no es mío. Ver «Pedidos» |
| Footer | El de la maqueta | El de la web (`Footer.astro`) | Común a todo el sitio |

## Pedidos fuera de mis archivos

1. **`src/components/system/PlanBand.astro` + `src/i18n/es.ts` (`es.system.plans`)** — para que Precios quede igual a su maqueta: agregar a `es.system.plans` `noteShort: 'Precios en pesos mexicanos, IVA incluido.'` y a `PlanBand` la prop `trialNote?: boolean` (por defecto `true`); con `false` pinta `t.noteShort` en `.plans-note`. Luego en `precios.astro`: `<PlanBand headingLevel={2} trialNote={false} />` (la prueba ya se explica justo abajo, en «Prueba»).

## Tabla para `progreso.md`

| Pantalla o página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Precios (`/talleres/precios`) | diferencia aceptada | diferencia aceptada | igual | igual | Alturas de encabezado, términos, comparación (cada fila), Pago y cierre iguales; sin scroll horizontal en los 4 anchos (tabla 318/318 en 360). En 360 y 390 la nota de `PlanBand` ocupa una línea más (pedido 1). Anual igual a la maqueta en 360 y 1440 ($1,490 · Equivale a $124 al mes; $2,990 · $249) |
