# Fase 2 · Datos y panel

**Objetivo:** la base completa, la lógica pura, las fotos con recorte y versiones, la protección del panel y el panel entero (Productos y Portada).

**Al terminar existe:** en local (y en línea si hay credenciales), el dueño entra a `/admin`, crea un producto, sube fotos (también del iPhone), las centra, llena datos, lo publica, reordena la lista, cambia la portada y descarga un respaldo. La semilla carga los 14 productos de ejemplo.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-1.md` · este archivo. En cada paso, solo lo que indica "Consultar".

---

## Pasos

### 2.1 Esquema y migraciones
- **Hacer:** todas las tablas de `09 §1` (menos `whatsapp_clicks`, que es de la fase 5) con sus índices (`09 §2`). Configuración fija: `src/config/categories.ts`, `colors.ts`.
- **Consultar:** `09 §1–2`, `03 §2` (colores), `05 §4` (categorías).
- **Archivos:** `src/server/db/schema.ts`, migración nueva en `migrations/` (la tabla `settings` ya existe desde la fase 1), `src/config/categories.ts`, `src/config/colors.ts`.
- **Listo cuando:** `pnpm db:migrate` crea todo en D1 local; prueba que inserta y lee un producto con categorías, colores y fotos.

### 2.2 Lógica pura
- **Hacer:** `money.ts`, `plural.ts`, `publish.ts` (qué falta para publicar), `crop.ts` (recorte centrado automático, anchos a generar, medidas de `og.jpg`), `schemas.ts` (Zod de producto, portada, subida), `whatsapp.ts` (los 4 mensajes de `05 §5`), `season.ts`. Cada uno con su prueba.
- **Consultar:** `05 §5`, `09 §3`, `12 §3`, `15 §6` (límites), `16 §4` (casos obligatorios), `10 §6` y `04 §2.2` (fechas de temporada), `10 §3` (`Result`).
- **Listo cuando:** todos los casos obligatorios de `16 §4` pasan; cobertura de `src/lib/` ≥ 90 %.

### 2.3 Entrar al panel
- **Hacer:** `src/server/auth.ts` con `requireAdmin` (JWT de Access con `jose`, `aud`, `iss`, vencimiento, correo permitido) y la sesión falsa solo en desarrollo.
- **Consultar:** `13 §2`.
- **Prueba:** `tests/security/auth.test.ts` (sin token, vencido, `aud` equivocado, correo no permitido → `UNAUTHORIZED`; válido → pasa) con llaves generadas en la prueba. Prueba de que el build de producción no contiene la sesión falsa.
- **Configurar Access en Cloudflare:** si hay credenciales, crear la aplicación con las rutas de `13 §2`; si no, anotarlo como pendiente y seguir.

### 2.4 Subida de fotos (servidor)
- **Hacer:** `src/pages/api/admin/upload.ts` y la validación de archivos.
- **Consultar:** `10 §4`, `13 §5`, `09 §1` (`photos` y claves de R2).
- **Prueba:** `tests/security/upload.test.ts` (tipo falso, SVG, tamaño) y camino feliz (sube versiones, crea fila `pending`, responde URLs); fallo a la mitad borra lo subido.

### 2.5 Consultas y acciones
- **Hacer:** consultas de `10 §2` que usa el panel y acciones de `10 §3`, con errores de `10 §5`. Barrido de `pending` (`src/server/cleanup.ts`).
- **Consultar:** `07 §5`, `09 §3`, `10 §2–3, §5`.
- **Prueba:** por acción: camino feliz, cada error de su fila, y que un `batch` que falla no deja nada escrito. Reordenar, duplicar, borrar (con sus fotos en R2), publicar con y sin lo necesario.

### 2.6 Semilla
- **Hacer:** `scripts/seed.ts` con los 14 productos (`05 §4`) y sus fotos de `reference/seed-photos/` pasando por el mismo cálculo de versiones (en Node con `sharp` o con el mismo código de `crop.ts` y un canvas de Node; lo que sea más simple, registrado), y la portada de `reference/hero/`. Opción `--many` con 200 productos.
- **Consultar:** `09 §4`, `05 §4`.
- **Listo cuando:** `pnpm seed` deja la base local con los 14 productos, publicados y en el orden de la tabla; se niega a correr contra la base remota.

### 2.7 Panel · estructura y lista
- **Hacer:** `/admin` y `/admin/portada` como islas `client:only`; `AdminShell` (barra, pestañas, menú •••), lista con búsqueda, filtro, arrastrar para ordenar (dnd-kit), selección en la URL, aviso de cambios sin guardar. TanStack Query para leer; Astro Actions para escribir; sonner para avisos.
- **Consultar:** `12 §1–2`, `12 §7` (textos), `12 §8` (celular), `10 §2–3` (acciones de lectura y `Result`), `13 §2` punto 5 (sesión vencida), `reference/mockups/admin.html`.

### 2.8 Panel · editor de producto
- **Hacer:** formulario completo (react-hook-form + Zod), colores, categorías, opciones, interruptor de publicado con lo que falta, guardar, duplicar, eliminar, ver página.
- **Consultar:** `12 §2`, `12 §7`, `09 §3`.

### 2.9 Panel · fotos
- **Hacer:** `PhotoUploader` (react-dropzone, heic2any diferido, browser-image-compression), `PhotoCropper` (react-easy-crop con la forma de cada uso, zoom y pellizco), generación de versiones con `canvas` usando `src/lib/crop.ts`, subida con progreso y reintento, miniaturas ordenables, volver a centrar, texto alternativo, quitar. Vista del recorte (`12 §4`).
- **Consultar:** `12 §3–4`, `15 §3`.
- **Prueba (Playwright):** subir un JPG y un PNG, centrar el primero moviéndolo, guardar; recargar y comprobar que el recorte guardado es el elegido (comparar `crop_*`); volver a centrar cambia `version` y borra las versiones viejas al guardar. HEIC: prueba unitaria del camino de conversión con un archivo de muestra pequeño (si no hay forma práctica de generarlo, anotarlo y probar el desvío con un simulacro).

### 2.10 Panel · portada
- **Hacer:** editor de portada completo (`12 §5`).
- **Consultar:** `12 §5`, `12 §3` (formas 16:9 y 3:4), `reference/mockups/admin.html`.

### 2.11 Respaldo
- **Hacer:** "Descargar respaldo" (`admin.exportBackup`), `pnpm db:backup` y `pnpm r2:orphans` (`scripts/r2-orphans.ts`).
- **Consultar:** `09 §5`, `17 §5`.

---

## No hacer en esta fase
- Páginas públicas de catálogo y producto (fase 3). "Ver página ↗" puede llevar a una ruta que todavía responde 404.
- Contador de toques (fase 5).
- Importar respaldo ni "volver a ejemplos" (fuera de alcance, `02 §1`).

## Cierre
- Todas las pruebas, `pnpm security` en verde.
- Panel comparado con `admin.html` en 390, 820 y 1440; filas en `progreso.md`.
- Flujo D hasta "guardar y publicar" (la parte de verlo en el catálogo se completa en la fase 3); flujo F en el panel.
- `docs/informe-fase-2.md`.
