# 13 · Seguridad

Estándar: **OWASP Top 10:2025**. La web pública es de solo lectura y no recibe datos personales; el riesgo real está en el **panel** (quién puede escribir) y en las **fotos que se suben**.

## 1. Resumen de riesgos

| Qué se protege | Riesgo | Defensa principal |
|---|---|---|
| El catálogo | Que alguien sin permiso cambie o borre productos | Access + verificación del token en el servidor (§2) |
| Las fotos | Archivos maliciosos disfrazados de imagen | Validación de tipo por bytes, tamaño y procesamiento en el navegador (§5) |
| Los visitantes | Que la web cargue código ajeno o se incruste en otro sitio | Cabeceras y CSP (§3), nada de HTML de la base (§6) |
| El costo | Que alguien abuse de un endpoint | Límites de frecuencia (§4) |

## 2. Entrar al panel (A01, A07)

1. **Cloudflare Access** protege `/admin*`, `/_actions/admin.*` y `/api/admin/*`. Política: solo el correo del dueño (y los que él agregue). Inicio de sesión con código al correo; sesión de 24 horas.
2. **Defensa en profundidad:** el **middleware** llama `requireAdmin` para toda petición a `/_actions/admin.*` y `/api/admin/*` (antes de que Astro valide la entrada, `10 §3`) y cada handler lo vuelve a llamar. `requireAdmin(context)` (`src/server/auth.ts`) verifica el JWT de la cabecera `Cf-Access-Jwt-Assertion` con `jose`: firma con las llaves públicas del equipo (`https://<ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs`, en caché), `aud` = `ACCESS_AUD`, `iss` correcto, no vencido, y el correo en la lista permitida (`ADMIN_EMAILS`). Si algo falla → `UNAUTHORIZED`. Así, aunque Access se configure mal, nadie escribe.
3. **Desarrollo:** sesión falsa solo con `import.meta.env.DEV`. Prueba: el build de producción no contiene la rama de desarrollo (buscar la cadena en `dist/`).
4. Las páginas `/admin` además llevan `noindex` y no aparecen en el sitemap.
5. **Sesión vencida:** cuando la sesión de Access vence, una llamada del panel no recibe `401` sino una redirección a la página de inicio de sesión de Access, que el navegador bloquea (error de red/CORS). El ayudante del panel trata **cualquier fallo de red con `navigator.onLine = true`** en una llamada de administrador como `UNAUTHORIZED`: muestra "Tu sesión terminó. Vuelve a entrar." con un botón que recarga la página (Access pide entrar y el formulario no guardado se conserva en `sessionStorage`).

## 3. Cabeceras y configuración (A02)

**CSP (decidido).** Astro mete scripts pequeños en línea (las islas), así que `script-src 'self'` solo no basta y `'unsafe-inline'` en scripts no se permite. Se usa **la CSP integrada de Astro** (`security.csp` en `astro.config.mjs`), que calcula los hashes de los scripts en el build y escribe la política en una etiqueta `<meta>`. Política completa:

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval' <hashes que agrega Astro> https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline';
img-src 'self' https://img.[dominio] data: blob:;
media-src 'self' https://img.[dominio];
font-src 'self';
connect-src 'self' https://cloudflareinsights.com;
worker-src 'self' blob:;
base-uri 'self';
form-action 'self'
```

- `style-src` lleva `'unsafe-inline'` porque los componentes (motion, Embla, 21st.dev) usan estilos en línea. Se configura Astro para **no** agregar hashes de estilos (si hay hashes, el navegador ignora `'unsafe-inline'`).
- `'wasm-unsafe-eval'` permite compilar WebAssembly (no evaluar texto como código). Lo usa el panel en Safari para codificar WebP (`@jsquash/webp`).
- `worker-src blob:` lo necesitan heic2any y el recortador.
- `frame-ancestors` no funciona en `<meta>`: va **aparte**, como cabecera.
- Si la versión instalada de Astro no tiene CSP integrada estable: un script de build (`scripts/csp-hashes.mjs`) calcula los hashes de los scripts en línea de `dist/` y el middleware manda la misma política como cabecera. Se registra en `decisiones.md`.

**Páginas ocultas (Para talleres, `25 §2`).** Mientras `site.system.enabled` sea `false`, el middleware responde la página 404 a `/talleres` y a todo lo que cuelga de ella (comparando la ruta ya decodificada, por `/%74alleres`), después de la redirección de la barra final y antes de todo lo demás; cada página de `src/pages/talleres/` repite el cerrojo y nunca se prerenderiza.

Cabeceras en `src/middleware.ts`, para todas las respuestas HTML:

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | `frame-ancestors 'none'` (solo esto; el resto va en el `<meta>` de Astro) |
| `X-Frame-Options` | `DENY` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` (en `/admin`: `camera=(self)` para tomar foto) |
- Páginas de error sin trazas ni versiones. Sin listado de archivos.
- El bucket de R2 es público **solo para lectura** por su dominio; escribir solo con el binding del Worker.

## 4. Diseño seguro y abuso (A06)

- **No hay formularios públicos que guarden datos.** El pedido arma un link de WhatsApp en el navegador; el servidor no recibe nada.
- `/api/click` solo suma uno a un contador y valida con Zod (`source` de una lista, `productId` que exista). Límite: 30 por minuto por IP con el **binding de Rate Limiting de Workers** (`CLICK_LIMITER`, `limit: 30`, `period: 60`); la IP se usa solo como llave del limitador y no se guarda. Si se pasa: `429` sin contar.
- Subidas: una foto por llamada; máximo 25 MB el original y 2 MB cada versión; máximo 10 fotos por producto.

## 5. Archivos subidos (A08)

1. En el navegador: se aceptan JPG, PNG, WEBP, HEIC; se convierten y **se vuelven a codificar** (WebP/JPG) con `canvas`, lo que elimina metadatos (incluida la ubicación GPS de la foto) y cualquier contenido extra.
2. En el servidor: se revisan los **bytes iniciales** de cada archivo (firma de JPG, PNG o WEBP); si no coinciden con el `Content-Type` → `FILE_TYPE`. **SVG prohibido.**
3. Las claves de R2 las genera el servidor (`ph/<uuid>/…`); nunca se usa el nombre del archivo del usuario.
4. Las fotos se sirven con su `Content-Type` correcto. R2 no permite poner `X-Content-Type-Options` en el objeto, así que se agrega con una **Transform Rule** (modificar cabeceras de respuesta) en `img.[dominio]` (`17 §1`).
5. `browser-image-compression` se usa con `useWebWorker: false` (por defecto carga su código desde un CDN, lo que rompe la CSP y la regla de no cargar scripts de terceros).

## 6. Inyección (A05)

- Toda entrada del panel pasa por Zod en el servidor (además del formulario).
- Consultas solo con Drizzle (parametrizadas). Prohibido SQL armado con texto.
- **Prohibido** `set:html`, `dangerouslySetInnerHTML`, `innerHTML` con datos, y `eval`. La descripción se pinta como texto, dividida en párrafos.
- Los mensajes de WhatsApp se codifican con `encodeURIComponent`.
- JSON-LD (`14`) se serializa escapando `<` (`<`) para no cerrar el `<script>`.

## 7. Dependencias y cadena de suministro (A03)

- `pnpm-lock.yaml` en el repositorio; instalación con `--frozen-lockfile` en CI.
- `pnpm audit --prod` sin vulnerabilidades altas o críticas para cerrar una fase.
- Los componentes externos (21st.dev) se revisan al integrarlos (`11 §4` regla 5).
- Ningún script de terceros en las páginas salvo Cloudflare Web Analytics.

## 8. Secretos (A04)

- Nada de secretos en el repositorio. `ACCESS_AUD`, `ADMIN_EMAILS` y el token de despliegue van como variables o secretos de Cloudflare y de GitHub.
- `gitleaks` en `pnpm security`.
- Todo por HTTPS (Cloudflare); las cookies de Access son de Cloudflare.

## 9. Registro y fallos (A09, A10)

- Errores inesperados: se registra `errorId`, ruta, código y mensaje técnico en los logs del Worker (Workers Logs). **Nunca** datos personales ni el token.
- Al usuario: texto en español por código (`12 §7`) y, si es inesperado, solo el `errorId`.
- Un fallo a la mitad de guardar no deja nada a medias (`batch`, `07 §5`); una subida que falla borra lo que alcanzó a subir (`10 §4`).
- Si D1 no responde, las páginas públicas muestran la página de error (`04 §7`), no una traza.

## 10. `pnpm security`

Script (`scripts/security.mjs`) que corre:
1. `pnpm audit --prod --audit-level=high`
2. `gitleaks detect`
3. ESLint con reglas de seguridad (`no-restricted-syntax` para `set:html`, `dangerouslySetInnerHTML`, `innerHTML`, `eval`; `no-restricted-imports` para las fronteras de `07 §6`)
4. Pruebas de seguridad (Vitest y Playwright):
   - `auth.test.ts`: cada acción del panel y `/api/admin/upload` sin token, con token vencido, con `aud` equivocado y con correo no permitido → `401` (también con una entrada inválida: la sesión se revisa antes que la validación).
   - `headers.spec.ts`: las cabeceras y el `<meta>` de §3 en las páginas que existan en esa fase (lista en `e2e/urls.ts`, que crece con cada fase), sin errores de CSP en la consola.
   - `upload.test.ts`: archivo con extensión `.jpg` pero bytes de otra cosa → `415`; SVG → `415`; 26 MB → `413`.
   - `injection.test.ts`: nombre y descripción con `<script>`, `"><img onerror>` y `'; DROP TABLE` se guardan como texto y se muestran escapados.
   - `click.test.ts`: `source` inválido → `400`; no guarda IP.
   - `system-hidden.spec.ts` (build de producción): las rutas de Para talleres de `25 §12` → 404 con la página 404 de la web; el HTML de las páginas públicas, el sitemap y `robots.txt` no mencionan `/talleres`.
5. Para talleres sigue oculta (`25 §2`): ningún archivo de `src/pages/talleres/` exporta `prerender = true`, cada uno lleva `prerender = false` y su cerrojo, ningún componente de `src/components/system/` lleva atributo `style`, y `dist/` no tiene ningún `.html` que nombre `/talleres`.

Cada prueba corre **sobre lo que ya existe**: una prueba de una fase posterior todavía no está escrita, no falla. Debe pasar para cerrar cualquier fase.

## 11. Fuera de alcance

Cuentas de clientes, pagos y datos personales no existen en esta web; si algún día se agregan, este documento se amplía antes de programarlos.
