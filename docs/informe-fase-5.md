# Informe de la fase 5

## Resumen
La web está terminada en local: cuenta los toques a WhatsApp, tiene aviso de privacidad, cumple las metas de rendimiento y accesibilidad en todas las páginas, y usa el componente real de 21st.dev en "¿Qué se te antoja?". **No está publicada**: faltan las credenciales de Cloudflare, el dominio y el correo del dueño para Access (paso 5.7), y eso es lo único que impide el lanzamiento.

## Pasos
| Paso | Estado | Notas |
|---|---|---|
| 5.1 Toques a WhatsApp | Listo | tabla `whatsapp_clicks` (migración 0003), `POST /api/click` (204/400/429), limitador `CLICK_LIMITER` 30/60 s, un solo oyente (`ClickBeacon`) para los 4 botones, `admin.clickStats`, resumen y número por producto en el panel |
| 5.2 Aviso de privacidad | Listo | `/privacidad` con la estructura de `19 §2`, liga en el footer, datos pendientes entre corchetes |
| 5.3 Rendimiento y accesibilidad | Listo | Lighthouse CI ahora incluye privacidad y Navidad; axe del panel y de las páginas públicas sin errores serios |
| 5.4 Revisión visual | Listo | `progreso.md` completo; todas las páginas y secciones "igual al mockup" o con diferencia aceptada y motivo |
| 5.5 Seguridad | Listo (ver abajo) | `pnpm security` 5/5 |
| 5.6 Componente externo | Listo | "Interactive Hover Links" integrado con su cambio obligatorio (táctil: fila de la mitad de la pantalla) |
| 5.7 Producción | **Bloqueado** | sin credenciales de Cloudflare ni dominio; todo queda listo, ver "Pendientes" |

## Pruebas
- **Vitest: 237** (nuevas: `click.server.test.ts` con origen inválido, producto inexistente, suma por día, día de Guadalajara y que no se guarde nada de la persona).
- **Playwright público: 157** (3 anchos), incluido el beacon del flujo A con el id del producto, `/api/click` (204 y 400), cabeceras de `/privacidad` y la CSP con Cloudflare Web Analytics como único script externo. **Panel y desarrollo: 63.** Todas verdes.
- **`pnpm security`: 5/5.** `gitleaks` no está instalado aquí (corre en CI).
- **Rendimiento (`pnpm lhci`, celular):** inicio 97/100/100/100, catálogo, producto y privacidad 100/100/100/100, Navidad 100/98/100/100. CLS 0 y TBT 0 en todas. `pnpm size`: inicio 20.0 KB (meta 90), catálogo 8.8 (25), producto 20.7 (70), privacidad 5.5 (8), 404 5.5 (8).

## Revisión de seguridad (`13`, punto por punto)
| Punto | Resultado |
|---|---|
| §2 Panel: `requireAdmin` en middleware y handler, JWT con `aud`/`iss`/correo | Cubierto por `tests/security/auth.test.ts` y `admin-routes.spec.ts`; sin Access configurado el panel responde 401 (falla cerrado) |
| §2.3 Sesión de desarrollo ausente en producción | `dev-routes.spec.ts` |
| §3 Cabeceras y CSP | `headers.spec.ts` en todas las páginas públicas (incluye `/privacidad`); `script-src` sin `unsafe-inline` y solo Cloudflare Web Analytics como externo |
| §4 `/api/click` con Zod, producto que exista y límite | Listo; el límite solo existe donde está el binding (producción o `wrangler dev`) |
| §5 Subidas | `upload.server.test.ts` (bytes, SVG, tamaño) |
| §6 Inyección | `products.test.ts` y e2e del panel; única excepción documentada: JSON-LD con `jsonLdString` |
| §7 Dependencias | `pnpm audit --prod` sin altas ni críticas |
| §8 Secretos | nada en el repositorio; `gitleaks` pendiente de correr en CI |
| §9 Registro y fallos | `errorId` sin trazas al usuario; Workers Logs activado en `wrangler.jsonc` |
| Panel en producción sin sesión / con correo no permitido | **No probado en producción** (no hay despliegue); probado con tokens falsos en pruebas |

## Comparación con el mockup
Sin cambios respecto a la fase 4, salvo "¿Qué se te antoja?": ahora es el componente real del dueño (fotos que siguen al mouse en escritorio; en celular, la foto de la fila de la mitad). Ver `docs/progreso.md`.

## Decisiones tomadas
`docs/decisiones.md`, entradas "Fase 5". Las que más importan: un solo oyente de clic para los beacons; `/privacidad` la sirve el Worker (los archivos estáticos no pasan por el middleware y se quedarían sin cabeceras); Web Analytics permitido en la CSP; el componente externo lleva cambios mínimos anotados en su encabezado.

## Pendientes del dueño
1. **Cuenta de Cloudflare** (token con permisos de Workers, D1, R2 y Access, y el account id) y **dominio**.
2. **Correo(s) para Access** (`ADMIN_EMAILS`) y el `aud` de la aplicación de Access.
3. **Número de WhatsApp real**, Facebook e Instagram (`src/config/site.ts`).
4. **Domicilio y correo** del aviso de privacidad (`site.ts › owner`) y que lo revise alguien que sepa de la LFPDPPP (`19`).
5. Fecha límite de Navidad real, alto del Q-404, video del timelapse (`site.video.src`), precios y fotos reales.
6. Las fotos que dijiste que pasarías de cada parte, para compararlas con la web.

## Pasos para publicar (cuando existan las credenciales)
```bash
wrangler d1 create quick-robot-web        # poner el database_id en wrangler.jsonc
wrangler r2 bucket create quick-robot-photos
pnpm db:migrate --remote                   # migraciones 0000–0003; SIN semilla
wrangler secret put ACCESS_AUD
wrangler secret put ADMIN_EMAILS
pnpm deploy
```
Después, en el panel de Cloudflare: dominio y `www`, dominio de fotos `img.[dominio]` sobre el bucket con su Transform Rule `X-Content-Type-Options: nosniff`, Access sobre `/admin*`, `/_actions/admin.*` y `/api/admin/*`, y Web Analytics. Cambiar `PUBLIC_IMG_BASE`, `ACCESS_TEAM_DOMAIN` y `site.ts › domain`. El `namespace_id` del limitador (`1001`) puede quedarse o cambiarse por uno propio de la cuenta.

## Pasos manuales después del lanzamiento (`14 §6`)
- Dar de alta el sitio en Google Search Console y mandar el sitemap.
- Perfil de Google Business con el link a la web.
- Probar un link en WhatsApp y en el depurador de Facebook.
- Descargar un respaldo desde el panel después de cada cambio grande; D1 Time Travel permite volver unos días atrás (los días dependen del plan: anotarlos al crear la base).
- Revisar el aviso de privacidad con alguien que sepa y actualizar la fecha (`site.ts › privacyUpdated`).

## Bloqueado o dudoso
- Despliegue y Access (credenciales). CI de GitHub Actions bloqueado por facturación de la cuenta.
- HEIC real con una foto de iPhone: sin verificar.
- El limitador de `/api/click` y la CSP con Web Analytics no se pueden probar de punta a punta sin Cloudflare.

## Cómo probarlo
```bash
pnpm dev                 # http://localhost:4321/  (panel en /admin con sesión de desarrollo)
pnpm test && pnpm security
pnpm build && pnpm size && pnpm e2e
pnpm lhci
```
