# Informe de la fase 2

## Resumen
El dueño puede entrar a `/admin` (en local con una sesión de desarrollo; en línea falta configurar Access), crear un producto, subir fotos (también HEIC, con la reserva de abajo), centrarlas, llenar los datos, publicarlo, reordenar la lista, ocultar, duplicar y eliminar, cambiar la portada y descargar un respaldo. La base tiene todas sus tablas, la semilla carga los 14 productos de ejemplo y la lógica pura, la verificación del token de Access, la subida de fotos y las acciones están probadas, incluido que un `batch` que falla no deja nada escrito.

## Pasos
| Paso | Estado | Commit | Notas |
|---|---|---|---|
| 2.1 Esquema y migraciones | Listo | `5c47a5a` | 6 tablas + índices; categorías y colores fijos; migraciones 0001 y 0002 |
| 2.2 Lógica pura | Listo | `7973c37` | money, plural, publish, crop, schemas, whatsapp, season, result; todos los casos de `16 §4` |
| 2.3 Entrar al panel | Listo en código; **Access sin configurar** | `07ce6eb` | `requireAdmin` con jose (llaves, `aud`, `iss`, vencimiento, correo); falla cerrado; sesión falsa solo en desarrollo y ausente del build |
| 2.4 Subida de fotos | Listo | `79f5d8f` | `POST /api/admin/upload`; tipo por bytes, SVG prohibido, 25 MB y 2 MB, limpieza si falla a la mitad |
| 2.5 Consultas y acciones | Listo | `379c35a` | 12 acciones `admin.*`; servicios probados en el runtime de Workers |
| 2.6 Semilla | Listo | `adab6d1` | `pnpm seed`, `--if-empty` (lo usa `pnpm dev`), `--many`; se niega a correr contra la remota |
| 2.7 Panel · estructura y lista | Listo | `18aedaf` | isla `client:only`, búsqueda, filtro, orden con dnd-kit (también teclado), selección en la URL, aviso de cambios sin guardar |
| 2.8 Panel · editor | Listo | `6f39ba0` | react-hook-form + Zod, interruptor "Publicado" que dice qué falta, duplicar, eliminar |
| 2.9 Panel · fotos | Listo | `aa8b891` | dropzone, HEIC diferido, compresión, recortador, versiones con canvas, progreso, reintento |
| 2.10 Panel · portada | Listo | `c75e4c8` | hasta 6 portadas, foto de celular opcional, intervalo, "Volver a la foto original" |
| 2.11 Respaldo | Listo | `2f60531` | menú •••, `pnpm db:backup`, `pnpm r2:orphans` |

## Pruebas
- **Vitest: 183 pruebas.** Cobertura: `src/lib/` 100 % de líneas (meta 90 %); `src/server/admin` 95 %, `src/server/queries` 97 %, `src/server` en conjunto 83 % (meta 80 %). Las acciones de Astro y `auth.ts` son pegamento y las cubren los flujos de Playwright.
- **Seguridad (`pnpm security`, 5/5):** auditoría sin vulnerabilidades; ESLint con las fronteras; pruebas negativas; `auth.test.ts` (sin token, vencido, `aud`, `iss`, llave o correo equivocados, manipulado, `alg: none`, sin configurar); `admin-routes.spec.ts` (401 con y sin token falso en 4 rutas, `noindex`, sin sesión falsa en `dist/`); `upload.server.test.ts` (tipo falso, SVG, 25 MB y 2 MB, fallo a la mitad); inyección en el servidor y en el panel. **`gitleaks` no corre en este entorno** (lo exige el CI).
- **Playwright público:** 21 pruebas verdes (axe, layout, cabeceras, rutas solo de desarrollo).
- **Playwright del panel** (`pnpm e2e:admin`, contra `pnpm dev`, 3 anchos): flujo D hasta "guardar y publicar", **centrar y comprobar el recorte guardado (`crop_*`, `version`) y que la versión vieja desaparece de R2**, quitar foto, flujo F (ocultar y reordenar con teclado), duplicar y eliminar, cambios sin guardar, fotos inválidas, inyección, portada completa y axe sin errores serios. Corrida completa: **48 pruebas (16 × 3 anchos) verdes** en 4.7 min.
- **Rendimiento:** `pnpm size` Inicio 5.5 KB (meta 90 KB). El panel no tiene límite (`15 §2`).

## Comparación con el mockup
| Página / sección | 390 | 820 | 1440 |
|---|---|---|---|
| Panel · lista | igual (sin "· 1 foto" en las filas; texto gris más oscuro por contraste) | igual | igual |
| Panel · editor | igual | igual | igual |
| Panel · fotos y recorte | igual; el recortador es nuevo respecto al mockup | igual | igual |
| Panel · portada | igual (la miniatura de celular se queda visible) | igual | igual |

## Decisiones tomadas
`docs/decisiones.md`, entradas "Fase 2 · Paso 2.1" a "2.11". Las más importantes: columna `ever_published` (el slug no debe seguir al nombre una vez publicado); acciones de Astro como envoltorios de servicios probables sin Astro; `@cloudflare/vitest-plugin`; re-codificación final de las fotos en canvas (quita EXIF y GPS); clases siempre con `cn()` porque Prettier rompe las que llevan espacios en plantillas; colores de texto del panel más oscuros por contraste.

## Pendientes del dueño
Los de la fase 1 (WhatsApp, redes, dominio, fecha de Navidad, video) y, para el panel en línea, **configurar Cloudflare Access**: ver abajo.

## Bloqueado o dudoso
1. **Cloudflare Access (paso 2.3):** falta la cuenta de Cloudflare. Hay que crear la aplicación "Panel Quick Robot" (rutas `/admin*`, `/_actions/admin.*`, `/api/admin/*`; política con el correo del dueño; sesión de 24 h), poner `ACCESS_TEAM_DOMAIN` en `wrangler.jsonc` y guardar `ACCESS_AUD` y `ADMIN_EMAILS` con `wrangler secret put`. Mientras tanto el panel en línea responde `401` a todo (falla cerrado).
2. **HEIC real:** no se pudo generar una foto de iPhone de muestra. Se prueba la detección y el desvío con un simulacro; **la conversión de una HEIC de verdad hay que verificarla a mano** (subir una foto del iPhone desde `/admin`).
3. **Dominio de fotos** (`img.[dominio]` con su regla de `nosniff`): es de despliegue; hasta entonces las fotos salen por `/img` solo en desarrollo.
4. **CI de GitHub** sigue sin poder correr por el bloqueo de facturación (fase 1).
5. **Riesgo de las fases 3–4:** CSP integrada de Astro y `ClientRouter` (ver fase 1).

## Cómo probarlo
```bash
pnpm install
pnpm dev                 # http://localhost:4321/admin  (carga la semilla si la base está vacía)
pnpm seed                # recarga los 14 productos desde cero
pnpm test && pnpm security
pnpm e2e                 # público (build) y panel (pnpm dev), 3 anchos
pnpm db:backup           # respaldo .sql local
pnpm r2:orphans          # lista huérfanos del bucket local (--delete para borrarlos)
```
