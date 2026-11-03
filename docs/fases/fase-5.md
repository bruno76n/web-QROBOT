# Fase 5 · Pulido y lanzamiento

**Objetivo:** dejar la web lista para el público: medición, aviso de privacidad, metas de rendimiento y accesibilidad cumplidas en todo, revisión completa contra el mockup, componentes externos integrados y publicación en el dominio.

**Al terminar existe:** la web en `[dominio]` (si hay credenciales y dominio), con todas las pruebas en verde y un informe final con lo que el dueño todavía tiene que dar o hacer.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-4.md` · este archivo.

---

## Pasos

### 5.1 Toques a WhatsApp
- **Hacer:** tabla `whatsapp_clicks` (migración), `/api/click`, beacons en los cuatro botones, consulta `clickStats` y su vista en el panel.
- **Consultar:** `18` completo, `09 §1` (`whatsapp_clicks`), `10 §7`, `12 §6`, `13 §4`.
- **Prueba:** `click.test.ts`; en el flujo A se verifica el beacon.

### 5.2 Aviso de privacidad
- **Hacer:** `/privacidad` (estática) con la estructura de `19 §2` y liga en el footer. Datos pendientes entre corchetes; marcar en `progreso.md` "revisar con el dueño".
- **Consultar:** `19`.

### 5.3 Rendimiento y accesibilidad en todo el sitio
- **Hacer:** Lighthouse CI y axe en todas las páginas públicas y el panel; corregir hasta cumplir `15 §1`. Revisar precargas, `sizes`, fuente, JS por página.
- **Consultar:** `15`, `11 §7`, `16 §4`.

### 5.4 Revisión visual completa
- **Hacer:** cada página y sección contra el mockup en 390, 820 y 1440; corregir diferencias de estructura, textos, colores y comportamiento; dejar `progreso.md` completo.
- **Consultar:** `02 §1` (diferencias ya decididas), `03`, `05`.

### 5.5 Revisión de seguridad
- **Hacer:** repasar `13` punto por punto contra el código y la configuración de Cloudflare; `pnpm security` en verde; probar el panel en producción sin sesión (debe pedir entrar) y con una sesión de un correo no permitido (si se puede preparar).
- **Consultar:** `13` completo.

### 5.6 Integrar componentes externos (último paso de construcción)
- **Hacer:** para cada fila de `11 §4`: si su archivo ya está en `src/components/external/`, cambiar el reemplazo por el real en `external/index.ts`, aplicar su **cambio obligatorio**, instalar y registrar sus dependencias, revisar la regla 5 de seguridad, probar en 390, 820 y 1440 (incluido el scroll en celular para Ideas) y borrar el reemplazo. Si todavía no está, **no detenerse**: dejarlo en "Pendientes del dueño" del informe con las instrucciones exactas para integrarlo después (dónde poner el archivo y qué prompt pegar, `prompts.md §6`).
- **Consultar:** `11 §4`, `04 §2.3`, `13 §7`.

### 5.7 Producción
- **Hacer:** si hay credenciales y dominio: dominio del Worker y `www`, dominio de fotos `img.[dominio]`, Access con el correo del dueño, Web Analytics, regla de rate limiting, migraciones remotas, despliegue, **sin semilla** (la base de producción empieza vacía; el dueño sube sus productos) — salvo que el dueño haya pedido cargar los de ejemplo, lo que se registra. Probar en producción: inicio, catálogo, un producto, link de WhatsApp, panel con Access.
- **Consultar:** `17` completo, `14 §6`.
- **Si faltan credenciales o el dominio:** dejar todo listo y la lista exacta de lo que falta en el informe.

---

## No hacer en esta fase
- Funciones nuevas fuera de `01` (van a "Después").
- Cargar datos reales del dueño sin que él lo pida.

## Cierre
- Todas las pruebas y metas en verde.
- `docs/informe-fase-5.md` con, además de la plantilla: **lista de pendientes del dueño** (los de `01` que sigan sin dato, componentes externos que falten, credenciales) y **lista de pasos manuales después del lanzamiento** (`14 §6`, respaldo, revisar el aviso de privacidad).
