# 16 · Convenciones y pruebas

## 1. Idioma y nombres

- **Código, nombres de archivos, variables, tablas, comentarios técnicos y commits: inglés.**
- **Lo que ve la persona: español**, en `src/i18n/es.ts` (`05`, `12 §7`). Las rutas públicas también en español (`/catalogo`, `/producto`).
- Glosario:

| Español | Código |
|---|---|
| producto | `product` |
| catálogo | `catalog` |
| categoría | `category` |
| portada (hero) | `hero`, `heroSlide` |
| foto | `photo` |
| recorte / centrar | `crop` / `recrop` |
| versión (tamaño) | `variant` (ancho) / `version` (hash del recorte) |
| precio desde | `priceFrom` / `price_from_cents` |
| más pedido | `featured` |
| publicado | `published` |
| se personaliza | `personalizable` |
| pedido (sección) | `order composer` |
| idea | `idea` |
| alberca | `ballPit` |
| toque a WhatsApp | `whatsappClick` |
| Aprende | `learn` (rutas en español: `/aprende`) |
| tema (de Aprende) | `topic` |
| página de Aprende | `learnPage` |
| pregunta | `faq` |
| tabla de datos | `dataset` |
| búsqueda sin resultado | `searchMiss` |
| ¿Cabe mi pieza? | `fit` |
| Para talleres (página del sistema) | `system` (rutas en español: `/talleres`) |
| plan | `plan` |
| mensual / anual | `period` (`monthly` / `yearly`) |
| pantalla del sistema (dibujada en HTML) | `ui` (`Ui*`) |
| datos de ejemplo | `demo` (`system-demo.ts`) |

## 2. Estilo de código

- TypeScript estricto (`strict`, `noUncheckedIndexedAccess`). Sin `any` salvo en el borde con un comentario de por qué.
- Prettier (con plugins de Astro y Tailwind) decide el formato. ESLint sin advertencias.
- Componentes chicos: si un `.astro` o `.tsx` pasa de ~200 líneas, se divide.
- Funciones de `src/lib/` puras: reciben todo lo que necesitan (incluida la fecha de "hoy"), no leen el reloj ni el entorno.
- Alias de importación `@/` → `src/`.
- **Código documentado.** Todo archivo abre con un comentario que dice para qué sirve, y cada sección de código (función, componente, tipo, constante o bloque con una idea propia) lleva arriba un comentario corto de qué hace y, si no es obvio, por qué. Lo obvio no se comenta (`i++`); lo que importa es el propósito, las reglas y los límites (por ejemplo «nunca se agranda» o «solo corre en el navegador»).
- **El comentario describe lo que el código hace hoy, no su historia.** No es una bitácora: no dice «antes hacía X», «ahora hace Y», «se quitó Z» ni «se agregó por…». Si el comportamiento cambia, se **reescribe** el comentario para que describa el comportamiento nuevo. Los cambios y sus motivos van a `docs/decisiones.md`, `docs/progreso.md`, los informes de fase y los mensajes de commit. Por la misma razón, un comentario no cita fases, pasos ni fechas.
- Clases de Tailwind; CSS propio solo en `global.css` (tokens) o en `<style>` del componente para lo que Tailwind no cubre (por ejemplo el nombre gigante).

## 3. Git

- Rama por fase: `fase-N`. **Un commit por paso** (`fases/fase-N.md`), mensaje en inglés con prefijo: `feat(admin): photo cropper`, `fix(catalog): empty state`, `test(e2e): flow A`, `docs: decision on CSP`.
- Nunca se fusiona una fase con pruebas en rojo.

## 4. Pruebas

| Tipo | Herramienta | Qué cubre | Dónde |
|---|---|---|---|
| Unitarias | Vitest | Todo `src/lib/` (mensajes de WhatsApp, plurales, dinero, recorte, temporada, reglas para publicar, esquemas Zod) | `src/lib/*.test.ts` |
| Servidor | Vitest + entorno de Workers (`@cloudflare/vitest-pool-workers`) o `wrangler` local | Consultas y acciones contra D1 local: camino feliz, cada error de `10 §5`, que `batch` no deja nada a medias | `src/server/**/*.test.ts`, `src/actions/**/*.test.ts` |
| Seguridad | Vitest + Playwright | Lo de `13 §10` | `tests/security/` |
| Flujos | Playwright | Flujos A–G de `04 §6`. Corren contra `pnpm dev` (con la sesión de administrador de desarrollo, `13 §2`); las cabeceras, Lighthouse y `size` corren contra el build | `e2e/flow-*.spec.ts` |
| Visual | Playwright (capturas) | Cada página en 390, 820 y 1440 comparada con el mockup | `e2e/visual.spec.ts` |
| Accesibilidad | `@axe-core/playwright` | Sin errores serios en todas las páginas públicas y el panel | `e2e/a11y.spec.ts` |
| Rendimiento | Lighthouse CI + `pnpm size` | Metas de `15` | CI |

**Cobertura mínima:** `src/lib/` 90 %; `src/server/` y `src/actions/` 80 %. Componentes: los cubren los flujos.

**Casos obligatorios de `src/lib/whatsapp.ts`** (comparan texto exacto):
1. Producto con color y personalización, cantidad 3 → ejemplo de `05 §5`.
2. Producto sin colores, cantidad 1 → sin " en …".
3. Pedido sin nombre y sin detalles → "Hola, necesito 1 figura con una foto. Lo necesito lo antes posible.\n(Lo vi en su página.)"
4. Pedido con nombre y detalles.
5. Q-404 "Rosa y menta" → "…un Q-404 en rosa y menta…".
6. Caracteres especiales (`&`, `#`, emojis, saltos de línea) bien codificados en el link.

**Casos obligatorios de `src/lib/season.ts`** (hora de Guadalajara):
- 30 de septiembre 23:59 → fuera de temporada; 1 de octubre 00:00 → dentro.
- 24 de diciembre 23:59 → dentro; 25 de diciembre 00:00 → fuera.
- Contador el 23 de diciembre a las 18:00 → 0 días, 6 horas.

**Casos obligatorios de `src/lib/crop.ts`:**
- Recorte de 3000 px de ancho en 1:1 → versiones 400, 800, 1200.
- Recorte de 700 px → solo 400 (y aviso de foto chica).
- Recorte de 300 px → una sola versión de 300 (y aviso).
- `og.jpg` de un recorte de 480 px → lienzo 1200 × 630 con la foto a 480 px, sin agrandar.
- Recorte centrado automático de una foto 4000 × 3000 en 1:1 → 3000 × 3000 en x = 500.

## 5. Datos de prueba

- Semilla de `09 §4` para desarrollo y flujos.
- Generador de 200 productos para la prueba de rendimiento (`scripts/seed.ts --many`).
- Nunca se prueba contra la base de producción.

## 6. Definición de "terminado" (cada paso)

Un paso está terminado cuando:
1. Hace lo que dice su fase y los documentos que cita.
2. Pasan `pnpm test`, `pnpm lint`, `pnpm typecheck` y `pnpm security`, y el código nuevo o cambiado está documentado como pide `§2` (su comentario describe cómo funciona ahora).
3. Si tiene pantalla: se comparó con el mockup en 390, 820 y 1440 (capturas revisadas) y la fila de `docs/progreso.md` está actualizada.
4. Si tomó una decisión no escrita: está en `docs/decisiones.md`.
5. Tiene su commit.

## 7. Comandos

```
pnpm install
pnpm dev            # astro dev con D1 y R2 locales y la semilla
pnpm seed           # vuelve a cargar la semilla local
pnpm db:generate    # drizzle-kit generate
pnpm db:migrate     # wrangler d1 migrations apply (local por defecto; --remote para producción)
pnpm build
pnpm preview        # wrangler dev con el build
pnpm test           # Vitest
pnpm e2e            # Playwright
pnpm lint
pnpm typecheck      # astro check + tsc
pnpm security       # 13 §10
pnpm size           # 15 §2
pnpm lhci           # Lighthouse CI
pnpm deploy         # wrangler deploy (solo desde CI o a mano con permiso)
```
