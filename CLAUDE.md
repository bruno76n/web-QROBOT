# CLAUDE.md — Quick Robot · Web pública

Web pública del taller de impresión 3D **Quick Robot** (Guadalajara): **muestrario con precio "desde"** y página por producto; todo pedido termina en **WhatsApp**. Incluye un **panel** (`/admin`) para subir productos, centrar sus fotos y cambiar la portada. No es tienda.

Documentación en `docs/` (empieza por `docs/README.md`; para arrancar y probar en local, `docs/continuar-en-local.md`). Plan general en `docs/20-plan-de-construccion.md`; **detalle de cada fase en `docs/fases/fase-N.md`**. Prompts en `docs/prompts.md`.

**Dónde está cada cosa:** idea y alcance → `01` · referencias → `02` · diseño → `03` · páginas y flujos → `04` · textos → `05` · stack → `06` · arquitectura → `07` · carpetas → `08` · datos → `09` · servidor → `10` · interfaz → `11` · panel → `12` · seguridad → `13` · SEO → `14` · rendimiento e imágenes → `15` · convenciones y pruebas → `16` · despliegue → `17` · analítica → `18` · legal → `19` · **Aprende → `21`** · **buscador → `22`** · **contenido de Aprende → `23` y `content/aprende/`**.

## Lo que no se negocia

1. **Astro con islas de React, en Cloudflare** (Workers, D1, R2, Access). Sin Next.js, sin Vercel, sin otro CMS.
2. **Librerías para todo lo resuelto** (`docs/06`): no se programa a mano un recortador, carrusel, arrastrar y soltar, compresor de imágenes ni física. Librería nueva → `docs/decisiones.md`.
3. **HTML primero:** una isla solo donde hay interacción real; `client:visible` por defecto (`docs/07 §3`).
4. **Solo `src/server/` toca D1 y R2.** Lectura con consultas, escritura con acciones del panel.
5. **Toda acción del panel y la subida de fotos pasan por `requireAdmin`** en el middleware (antes de validar) y otra vez en el handler; verifica el token de Access aunque Access ya proteja la ruta (`docs/10 §3`, `docs/13 §2`).
6. **Escrituras que van juntas, en un solo `db.batch`** (D1 no tiene transacciones interactivas).
7. **Lógica pura en `src/lib/`** con prueba (mensajes de WhatsApp, temporada, recorte, reglas para publicar).
8. **Textos solo en `src/i18n/es.ts`; datos del negocio solo en `src/config/site.ts`.** Nada escrito en componentes.
9. **Fotos: se guarda el original y el recorte**; las versiones se generan en el navegador y nunca se agrandan (`docs/12 §3`).
10. **Componentes externos (21st.dev) no se construyen** (`docs/11 §4`): si el archivo está, se usa y se le aplica su cambio obligatorio; si no, reemplazo sencillo con los mismos datos, se anota y se sigue. Se integran en el último paso de la fase 5.
11. **Nada de `set:html`, `dangerouslySetInnerHTML`, `innerHTML` con datos ni `eval`.**
12. **Igual al mockup** (`reference/mockups/`) en estructura, textos y comportamiento, salvo las diferencias decididas en `docs/02 §1`.
13. **Los `<script>` de página arrancan en `astro:page-load` y limpian en `astro:before-swap`** (por las View Transitions, `docs/07 §1`).
14. **Aprende:** el Markdown se convierte a árbol (`src/lib/learn/markdown.ts`) al importar o guardar, nunca en cada visita, y se pinta con componentes; el texto de las páginas vive en D1 (carga inicial desde `content/aprende/`), no en `es.ts` (`docs/21 §5, §8`).
15. **El navegador nunca habla con Meilisearch:** busca en `/api/aprende/buscar`, que usa Meilisearch o, si no está o falla, D1 (`docs/22 §1`). Las llaves de Meilisearch solo como secretos del Worker.

## Stack (decidido)

TypeScript estricto · pnpm · **Astro** + `@astrojs/cloudflare` + `@astrojs/react` · Tailwind + shadcn/ui · Geist · **D1 + Drizzle** · **R2** · **Cloudflare Access + jose** · Zod · Astro Actions · Embla · motion · three + R3F + drei · matter-js · react-dropzone · react-easy-crop · browser-image-compression · heic2any · dnd-kit · react-hook-form · TanStack Query · sonner · Vitest · Playwright · axe · Lighthouse CI. Aprende (fase 6): mdast-util-from-markdown + GFM · yaml · Meilisearch (SDK `meilisearch`). Detalle y porqué en `docs/06`.

## Idioma

- **Código, nombres, tablas, comentarios técnicos y commits: inglés.**
- **Todo lo que ve la persona: español**, de tú, invitando y sin frases genéricas (`docs/05 §1`). Glosario en `docs/16 §1`.

## Diseño

Solo modo claro. Solo Geist. Tokens en `docs/03 §2`. Botones rectangulares con esquinas de 8 px (nunca redondos). Color de marca (morado `#6b3fd4`, verde `#00ae42`) en pocos lugares. Primero el celular. Marca y mascota en `assets/`.

## Modo autónomo

La construcción la hace Claude Code **sin pedir aprobación paso a paso**.

**Antes de empezar una fase:** leer este archivo, el informe de la fase anterior y `docs/fases/fase-N.md`. Leer **solo** los documentos y secciones que cada paso indica en "Consultar". Crear la rama `fase-N`.

**Mientras trabaja**

1. Un paso a la vez, en el orden del archivo de la fase. Lógica pura con prueba → servidor con prueba → pantalla.
2. **Un commit por paso**, mensaje en inglés (`feat(admin): photo cropper`).
3. Un paso **no está terminado** hasta cumplir la definición de `docs/16 §6`: pruebas, lint, typecheck, `pnpm security` y, si hay pantalla, comparación con el mockup en **390, 820 y 1440** con capturas de Playwright.
4. Un cambio de comportamiento actualiza su documento en el mismo commit.

**Cuando algo no está claro, NO preguntar. Decidir así:**

1. Lo que dicen los documentos.
2. Lo que hace el mockup.
3. Si nada lo cubre: la opción más simple que respete este archivo.
   Anotar siempre la decisión en `docs/decisiones.md`.

**Datos que faltan** (dominio, WhatsApp, precios reales, fecha límite, fotos reales, componentes externos): usar el valor provisional de `docs/01 › Pendientes del dueño`, anotarlo en `docs/progreso.md` y **seguir**. Nunca son motivo para detenerse.

**Casos de parada (los únicos):**

- Necesita algo que no puede obtener solo: cuenta o token de Cloudflare, dominio, correo del dueño para Access. **Se detiene solo ese paso**, anota exactamente qué falta y sigue con lo que no dependa de eso (todo funciona en local).
- Va a borrar o modificar datos **de producción** de forma que no se pueda deshacer.
- Dos documentos se contradicen y la contradicción cambia el comportamiento (si no lo cambia, decide y registra).
- La misma prueba falla tres veces seguidas con enfoques distintos: anotar el bloqueo en `docs/decisiones.md`, marcar el paso como bloqueado y **seguir con lo que no dependa de él**.

**Al cerrar cada fase:** `docs/informe-fase-N.md` (plantilla en `docs/20`), `docs/progreso.md` al día, rama lista para fusionar. **Ninguna fase se fusiona con pruebas en rojo.**

**Nunca:** agregar funciones fuera de `docs/01`; saltarse una prueba para avanzar; modificar `reference/` o `assets/` (se copian, se optimizan en el build); escribir textos fuera de `src/i18n/es.ts`; reescribir un componente externo en lugar de envolverlo; correr la semilla contra producción; mostrar al usuario un mensaje técnico de error.

## Comandos

```
pnpm install
pnpm dev          # local con D1 y R2 simulados y semilla
pnpm seed         # recargar la semilla local
pnpm db:generate  # migración nueva con drizzle-kit
pnpm db:migrate   # aplicar migraciones (local; --remote en producción)
pnpm build && pnpm preview
pnpm test         # Vitest
pnpm e2e          # Playwright (390, 820, 1440)
pnpm lint
pnpm typecheck
pnpm security     # docs/13 §10
pnpm size         # docs/15 §2
pnpm lhci         # Lighthouse CI
pnpm deploy       # solo con credenciales
pnpm learn:import        # carga content/aprende/ en D1 local (--remote --yes, --overwrite, --sync)
pnpm learn:sync          # actualiza el índice de Meilisearch (si hay MEILI_HOST)
pnpm learn:search-setup  # crea el índice y las llaves (con MEILI_MASTER_KEY en la terminal)
```
