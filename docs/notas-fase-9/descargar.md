# Notas del agente «descargar» · fase 9 (pasos 9.9 y 9.10)

Rama `fase-9-descargar`. Página `/talleres/descargar`, `PlatformList`, llamado `system` de Aprende y sitemap.

## Qué se hizo

- `src/pages/talleres/descargar.astro` (25 §7.3), sin scripts: `h1` «Descargar», frase, botón principal según `detectPlatform(User-Agent)` en el servidor y `Vary: User-Agent` (`Astro.response.headers.append`), línea de requisitos (`downloads.*.minOs` para Mac y Windows), `UiHome` sobre la banda blanca→lila (`.hero-stage` de la maqueta), Plataformas (`PlatformList`), Instalación (Mac y Windows) y `EndCta` (solo «Crear cuenta», como la maqueta). Cerrojo y `prerender = false` sin cambios.
- `src/components/system/PlatformList.astro`: filas Mac, Windows, Navegador y Celular; la del equipo con degradado lila y «Tu equipo» (solo esa fila lo lleva en el HTML). Una por bloque hasta 899 px; desde 900, nombre · qué es · botón.
- `src/config/system.ts` (bloque `descargar`): `platforms` (`id` + `download`: llave de `site.system.downloads` o `null`) y el tipo `DownloadKey`.
- `src/i18n/es.ts` (bloque `descargar`): `es.system.download` con título, frase, botón principal, requisitos por equipo, plataformas, instalación y **`learnCta`** (texto del botón del llamado de Aprende y frase por defecto).
- `src/components/learn/Cta.astro` (21 §4.6): `cta === 'system'` con `systemVisible` → mismo bloque `.ap-cta` que WhatsApp, con el `ctaText` de la página y botón negro `.btn` (sin `.wa`) a `systemBase` (`/talleres`). Oculto → nada.
- `src/pages/sitemap.xml.ts`: suma `/talleres`, `/talleres/precios` y `/talleres/descargar` solo con `systemVisible`.

## Decisiones

1. **Ids de las filas = ids de `detectPlatform`** (`mac`, `windows`, `other`, `mobile`), que son también las anclas de la maqueta (`#mac`, `#windows`, `#other`, `#mobile`). La fila «Navegador» es `other`. Así la fila marcada es la que tiene `id === platform`, sin tabla de equivalencias.
2. **Botón principal en celular u otro equipo → `appUrl`** con `rel="noopener"` (25 §7.3); la maqueta lo manda a `#other`. En Mac y Windows, mientras `downloads.*.url` esté vacío, va a `/talleres/descargar#mac` / `#windows` (la fila de abajo).
3. **«Abrir en el navegador» junto al principal solo en Mac y Windows**, como hace el script de la maqueta (lo oculta en celular y otro). Los botones «Abrir en el navegador» y «Abrir en el celular» de las filas también van a `appUrl` con `noopener`.
4. **Texto del llamado de Aprende** (no había en los documentos): botón «Conocer Quick Cerebro» (`es.system.download.learnCta.button(name)`); si la página no trae `ctaText` (p. ej. `mantenimiento/bitacora`), «Quick Cerebro lleva costos, pedidos, impresoras y filamento de tu taller en un solo lugar.». Quedó en mi bloque porque es el que me tocaba; al fusionar podría moverse a `es.learn.cta.system` (cambio de una línea en `Cta.astro`).
5. Requisitos del navegador y del celular («Chrome, Safari, Edge o Firefox actuales», «iPhone o Android») son textos de la página, no datos del negocio: van en `es.system.download.platforms`, no en `site.ts`.
6. `.hero-stage` (banda blanca→lila bajo el encabezado) vive en el `<style>` de la página: la principal usa la misma clase de la maqueta en su hero. Si las dos la necesitan igual, conviene moverla a `system.css` (ver «Fuera de mis archivos»).

## Diferencias con la maqueta

| Qué | Por qué |
|---|---|
| Botones 2–4 px más anchos (p. ej. «Descargar para Mac» 224 vs 222 px) | `Button.astro` compartido usa `px-6` sin borde; la maqueta, 22 px + borde de 1 px. Pieza común, no mía: aceptada |
| Alto del encabezado (pantalla de Inicio) | `UiHome` sigue siendo el marco provisional de otro agente; todo lo demás del encabezado mide igual (h1, frase, botones, requisitos y la distancia a la pantalla: 434/434/340/451 px) |
| Footer | El real de la web (25 §14) |
| Botón principal en celular a `appUrl` | 25 §7.3 (decisión 2) |

## Fuera de mis archivos (pedidos)

1. **`content/aprende/paginas/negocio/costo.md`, `ctaText`:** dice «Quick Cerebro **lee el archivo del laminador** (gramos, horas, colores) y hace este cálculo solo, con tus precios.», y 25 §1 dice «Nada de leer el archivo del laminador… el sistema no lo tiene». Propuesta: `ctaText: Quick Cerebro hace este cálculo en cada pieza con tus precios de filamento, luz y máquina.` (la prueba `e2e/dev-talleres-ligas.spec.ts` lee ese texto: si cambia, cambiar también la línea de `toContainText`).
2. **`src/styles/system.css` (opcional):** si la principal define `.hero-stage` igual que yo, moverla a `system.css` como `.system .hero-stage { … }` (las dos reglas de `descargar.astro`, líneas «The screen starts on white and ends on lilac») y borrarla de las páginas.

## Pruebas

- `tests/learn-cta.astro.test.ts` (proyecto `astro`, `vi.mock('@/config/system')` con getter): oculto → nada y sin `/talleres`; visible → `.ap-cta`, `ctaText`, `<a class="btn" href="/talleres">` sin `wa`; sin `ctaText` → frase por defecto; WhatsApp y `none` sin cambios. 4 ✓.
- `tests/sitemap.test.ts` (proyecto `unit`, consultas de D1 simuladas): oculto → ningún `/talleres`; visible → las 3 rutas (exactamente 3). 2 ✓.
- `e2e/dev-talleres-descargar.spec.ts` (flujo P, contexto nuevo con `userAgent` y el ancho del proyecto): Mac, Windows e iPhone → su botón, su `href`, su fila `.on` con «Tu equipo» (una sola), `Vary` con `User-Agent`, sin scripts, sin scroll horizontal. 9 ✓ (390, 820, 1440).
- `e2e/dev-talleres-ligas.spec.ts`: header y footer con «Para talleres» → `/talleres`; `/aprende/negocio/costo` con su llamado, su texto y su botón negro a `/talleres` (y lo abre); `/sitemap.xml` con las 3 rutas. 9 ✓.
- `tests/security/system-hidden.spec.ts` contra **mi** build (`PORT=4337`): 6 ✓. Ojo: con el puerto 4321 Playwright reutilizó el `preview` de otro worktree (`reuseExistingServer`) y pasó en 27 s sin construir el mío; por eso lo corrí con `PORT=4337`.
- `pnpm lint`, `pnpm typecheck` (0 errores), `pnpm test` (58 archivos, 487 ✓), `pnpm security` (8/8).

Notas de entorno: al empezar, el puerto 4337 lo tenía otro proceso un rato (mi servidor arrancó en 4338 para la primera comparación; después ya usé 4337). `node scripts/seed.ts` (la `globalSetup` de `playwright.admin.config.ts`) falla con «other side closed» si mi propio `pnpm dev` está corriendo; con el servidor apagado pasa, y Playwright lo levanta después.

## Comparación con la maqueta (Chromium, mismo `User-Agent` en las dos)

Con Mac, Windows e iPhone: alturas de cada sección, h1, frase, botones, requisitos, filas de plataformas e instalación iguales en los 4 anchos; `scrollWidth` = ancho.

| Pantalla o página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| Descargar · encabezado (sin la pantalla) | igual | igual | igual | igual | Botones 2–4 px más anchos (`Button` compartido): diferencia aceptada |
| Descargar · pantalla de Inicio | diferencia aceptada | diferencia aceptada | diferencia aceptada | diferencia aceptada | `UiHome` provisional (otro agente) |
| Descargar · Plataformas | igual | igual | igual | igual | Fila del equipo marcada igual con Mac, Windows e iPhone |
| Descargar · Instalación | igual | igual | igual | igual | |
| Descargar · Cierre | igual | igual | igual | igual | |
