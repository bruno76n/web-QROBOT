# Pendientes para hacer en local (Mac)

Al 2026-11-14 las **9 fases del plan están construidas y fusionadas en `main`** (`docs/informe-fase-1.md` … `informe-fase-9.md`). Lo que falta no se pudo hacer en la nube por una de dos razones: necesita las credenciales de Cloudflare de la Mac, o necesita Safari/WebKit. Esta lista es para que Claude Code la siga en local, en orden. El prompt está en `docs/prompts.md › Pendientes en local`.

## Qué hay en producción y qué no

| Parte | En `main` | En producción (`quickrobot.centerdiv.mx`) |
|---|---|---|
| Web (inicio, catálogo, producto, privacidad) y panel (Productos, Categorías, Portada) | Sí | Sí (desplegada a mano desde la Mac) |
| Aprende (fases 6–7): 118 páginas, buscador, menú y footer | Sí | **No**: falta la migración `0007`, cargar el contenido y desplegar |
| Pestaña **Aprende** del panel (fase 8) | Sí | **No** (sale con el mismo despliegue) |
| Para talleres (fase 9), **oculta** (`site.system.enabled = false`) | Sí | **No**: sale con el mismo despliegue y debe responder 404 |

Desplegar `main` publica las tres últimas filas juntas. Para talleres sigue oculta: responde 404 y nada la enlaza.

## 1. Publicar Aprende (paso 8.4 de `fases/fase-8.md`)

Requisitos: `wrangler` con la sesión de la cuenta de Cloudflare (`pnpm exec wrangler whoami`) y `main` al día (`git pull`, `pnpm install`).

1. **Antes de tocar producción:** `pnpm test && pnpm lint && pnpm typecheck && pnpm security` en verde, y `pnpm build && pnpm size`.
2. **Respaldo de la base de producción**, por si acaso (`17 §5`): `pnpm exec wrangler d1 export quick-robot-web --remote --output backups/antes-de-aprende.sql`.
3. **Meilisearch (solo si ya se decidió dónde corre, `22 §2`):** poner `MEILI_HOST` en `wrangler.jsonc`. Con `MEILI_MASTER_KEY` en la terminal, correr `pnpm learn:search-setup`. Después, `pnpm exec wrangler secret put MEILI_SEARCH_KEY` y `pnpm exec wrangler secret put MEILI_WRITE_KEY` con las llaves que imprime. **Sin Meilisearch se salta este paso:** el buscador usa D1 y ya tolera errores de dedo.
4. **Migración:** `pnpm exec wrangler d1 migrations apply quick-robot-web --remote`. Aplica la `0007`, que solo agrega las tablas de Aprende; la fase 8 no agregó migraciones.
5. **Contenido:** `pnpm learn:import --remote --yes` (más `--sync` si hay Meilisearch). **Nunca con `--overwrite` en producción:** solo agrega páginas y no toca las editadas en el panel.
6. **Desplegar:** `pnpm build && pnpm exec wrangler deploy`.
7. **Revisar en vivo:**
   - `/aprende`, un tema (`/aprende/filamentos`), una ficha (`/aprende/filamentos/pla`) y el glosario.
   - Una búsqueda con resultado («petj» → PETG) y una sin resultado.
   - `/admin/aprende` pide entrar (Access cubre `/admin*`) y, ya dentro, la pestaña funciona: abrir una página, guardar sin cambios y ocultar/publicar.
   - `/sitemap.xml` con las páginas de Aprende.
   - **Para talleres oculta:** `/talleres`, `/talleres/precios`, `/talleres/descargar` y `/%74alleres` dan 404. El menú, el footer, `/aprende/negocio/costo` y el sitemap no mencionan `/talleres`.
8. **Anotar** en `docs/17 §8` (lo que se creó y la fecha), en `docs/progreso.md` (versión desplegada) y en `informe-fase-8.md` (8.4 hecho).
9. **Después, a mano (dueño):** mandar el sitemap otra vez en Search Console.

Si algo falla a la mitad: no repetir con `--overwrite`. El importador se puede volver a correr sin riesgo (solo agrega), y el respaldo del paso 2 permite volver atrás.

## 2. Pruebas en Safari (WebKit)

En la nube no se pudo instalar WebKit. En la Mac:

1. `pnpm exec playwright install webkit`.
2. `pnpm e2e`. Con WebKit instalado se activan solos estos proyectos:
   - `webkit` (público): flujos H–L de Aprende en iPhone 13.
   - `webkit-w390` y `webkit-w1440` (con `pnpm dev`): flujos M, N y P de Para talleres.
3. Si algo falla solo en WebKit, corregirlo siguiendo las reglas de `24 §5` (Safari 14) y anotarlo en `docs/decisiones.md`.
4. **A mano en un iPhone real y en Safari de Mac** (`24 §6`, punto 3):
   - En `/aprende`: buscar «petj».
   - Filtrar filamentos: «Exterior y sol» + «Mi impresora es abierta» deja solo PETG.
   - En ¿Cabe mi pieza?: 25 × 10 × 5 cm.
   - La calculadora con el ejemplo ($21.04).
   - El panel (`/admin/aprende`) en el iPhone.

## 3. Arreglo conocido (opcional)

**Crear un producto en Safari anterior a la versión 17.** `@sindresorhus/slugify` arma la dirección del producto con una expresión regular con *lookbehind* y bandera `v`, que Safari < 17 no entiende. En esos navegadores, guardar un producto nuevo fallaría. Solo importa si el panel se usa en un iPhone o una Mac sin actualizar. Arreglo propuesto, con prueba: en `src/lib/publish.ts`, cambiar `slugify` por una función propia y pura que quite acentos (`normalize('NFD')` y quitar marcas), pase a minúsculas y cambie lo que no sea `a-z0-9` por guiones. Debe dar los mismos resultados que hoy en las pruebas de `publish.test.ts`. Anotarlo en `decisiones.md`.

## 4. Lo que decide el dueño (no es código)

- **Meilisearch:** Cloud o servidor propio (`22 §2`). Con eso se hace el paso 1.3.
- **Aprende, `content/aprende/README.md`:** anticipo y formas de pago, envíos, urgentes y personajes con licencia. Mientras tanto `encargar/pago` y `encargar/personajes` siguen ocultas. **Fotos de fallas** para las páginas de problemas.
- **Repositorio privado:** hoy el código, las maquetas y los precios de Para talleres se pueden leer en GitHub (`25 §2`).
- **Encender Para talleres**, cuando salga el sistema. Hacen falta:
  - el nombre final;
  - los precios y límites confirmados con la beta;
  - la dirección del sistema y sus rutas de registro y entrada;
  - los archivos de descarga de Mac y Windows con sus requisitos;
  - si se da factura de la suscripción;
  - la imagen al compartir (`assets/og-talleres.jpg`).

  Con eso se usa el prompt «Para talleres · Encender» (`prompts.md`, `25 §13`).

## 5. Limpieza de ramas (opcional)

Todo está fusionado en `main`. Ramas viejas en GitHub que se pueden borrar cuando quieras: `fase-1` … `fase-9` y `fase-9-v1` (la fase 9 hecha con el plan anterior, que no se fusionó; se guarda como referencia). La rama `claude/loving-keller-o6doi9` apunta a `main`.
