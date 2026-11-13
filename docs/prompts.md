# Prompts para Claude Code

Un prompt por fase. Se pega **uno a la vez**, en una sesión nueva de Claude Code abierta en la carpeta del proyecto. Todo lo que Claude necesita está en `CLAUDE.md` y en el archivo de la fase.

---

## 0. Preparar la carpeta (una sola vez)

1. Crear una carpeta vacía (por ejemplo `quick-robot-web`) y descomprimir ahí el .zip. Debe quedar:
   ```
   CLAUDE.md
   docs/           (README, 01–20, fases/, prompts, decisiones, progreso)
   reference/      (mockups/, seed-photos/, hero/)
   assets/         (logo-cabeza.svg, q404/, ideas/)
   ```
2. **Componentes de 21st.dev (opcional):** si ya los tienes, crea `src/components/external/` y pon ahí el código de cada uno (por ejemplo `HoverLinks.tsx`, con sus archivos auxiliares). Si no, no pasa nada: se integran al final.
3. `git init` y un primer commit con todo esto.
4. Abrir Claude Code en esa carpeta y pegar el prompt de la fase 1.

---

## 1. Fase 1 · Base

```
Haz la fase 1 en modo autónomo: sigue docs/fases/fase-1.md paso por paso.

Primero lee CLAUDE.md completo y docs/fases/fase-1.md. Después, en cada paso, lee solo los
documentos y secciones que indica "Consultar".

Crea la rama fase-1. Un commit por paso, mensaje en inglés. Un paso está terminado solo cuando
cumple docs/16 §6.

Si faltan credenciales de Cloudflare, no te detengas: deja el despliegue marcado como bloqueado,
anota exactamente qué necesitas y sigue con lo demás.

No hagas nada fuera de la fase 1. No me hagas preguntas salvo los casos de parada de CLAUDE.md.
Al terminar escribe docs/informe-fase-1.md (plantilla en docs/20) y actualiza docs/progreso.md.
```

## 2. Fase 2 · Datos y panel

```
Haz la fase 2 en modo autónomo: sigue docs/fases/fase-2.md paso por paso. Parte de main con la
fase 1 fusionada; crea la rama fase-2.

Lee CLAUDE.md, docs/informe-fase-1.md y docs/fases/fase-2.md. En cada paso, lee solo lo que
indica "Consultar".

La fase termina cuando el panel hace todo lo de docs/12 en local (crear, fotos con recorte,
publicar, ordenar, portada, respaldo), las pruebas de seguridad de auth y subida pasan y la
semilla carga los 14 productos.

No hagas nada fuera de la fase 2. No me hagas preguntas salvo los casos de parada de CLAUDE.md.
Al terminar escribe docs/informe-fase-2.md y actualiza docs/progreso.md.
```

## 3. Fase 3 · Catálogo y producto

```
Haz la fase 3 en modo autónomo: sigue docs/fases/fase-3.md paso por paso. Parte de main con la
fase 2 fusionada; crea la rama fase-3.

Lee CLAUDE.md, docs/informe-fase-2.md y docs/fases/fase-3.md. En cada paso, lee solo lo que
indica "Consultar". Compara cada página con reference/mockups/ en 390, 820 y 1440.

La fase termina cuando pasan los flujos A, C, D, F y G de docs/04 §6 y Lighthouse cumple
docs/15 §1 en catálogo y producto.

No hagas nada fuera de la fase 3. No me hagas preguntas salvo los casos de parada de CLAUDE.md.
Al terminar escribe docs/informe-fase-3.md y actualiza docs/progreso.md.
```

## 4. Fase 4 · Inicio

```
Haz la fase 4 en modo autónomo: sigue docs/fases/fase-4.md paso por paso. Parte de main con la
fase 3 fusionada; crea la rama fase-4.

Lee CLAUDE.md, docs/informe-fase-3.md y docs/fases/fase-4.md. En cada paso, lee solo lo que
indica "Consultar". Ten abierto reference/mockups/index.html y compara cada sección en 390,
820 y 1440.

Para "¿Qué se te antoja?" sigue docs/11 §4: si el componente está en src/components/external/,
úsalo con su cambio para celular; si no está, pon el reemplazo sencillo y sigue sin detenerte.

La fase termina cuando el inicio está completo, pasan los flujos B y E y Lighthouse cumple en el inicio.

No hagas nada fuera de la fase 4. No me hagas preguntas salvo los casos de parada de CLAUDE.md.
Al terminar escribe docs/informe-fase-4.md y actualiza docs/progreso.md.
```

## 5. Fase 5 · Pulido y lanzamiento

```
Haz la fase 5 en modo autónomo: sigue docs/fases/fase-5.md paso por paso. Parte de main con la
fase 4 fusionada; crea la rama fase-5.

Lee CLAUDE.md, docs/informe-fase-4.md y docs/fases/fase-5.md. En cada paso, lee solo lo que
indica "Consultar".

En el paso 5.6 integra los componentes externos que estén en src/components/external/; los que
falten déjalos en el informe como pendientes, sin detenerte.

Si faltan credenciales o el dominio para el paso 5.7, deja todo listo y la lista exacta de lo
que necesitas.

Al terminar escribe docs/informe-fase-5.md con los pendientes del dueño y los pasos manuales
después del lanzamiento, y actualiza docs/progreso.md.
```

## Aprende · Preparar (una sola vez)

1. En la carpeta del proyecto, en `main`, copia encima lo que viene en el .zip de Aprende (o aplica el parche: `git apply aprende-plan.patch`). Agrega o cambia:
   ```
   CLAUDE.md, docs/README.md, docs/01, docs/20, docs/prompts.md
   docs/21-aprende.md, docs/22-buscador.md, docs/23-aprende-contenido.md
   docs/fases/fase-6.md, fase-7.md, fase-8.md
   content/aprende/          (118 páginas, datos, fuentes, buscador)
   docs/24-aprende-dispositivos.md
   reference/mockups/aprende/ (12 maquetas: una por tipo de pantalla)
   ```
2. Commit en `main` (`docs: plan and content for Aprende`).
3. Meilisearch no hace falta para empezar: sin él, el buscador usa la base de datos (`docs/22 §2`).
4. Abre Claude Code en la carpeta y pega el prompt de la fase 6.

## Aprende · Fase 6 · Base

```
Haz la fase 6 en modo autónomo: sigue docs/fases/fase-6.md paso por paso. Parte de main y crea
la rama fase-6.

Lee CLAUDE.md, docs/informe-fase-5.md, docs/progreso.md, las secciones de docs/21-aprende.md que
pide la fase y docs/fases/fase-6.md. En cada paso, lee solo lo que indica "Consultar".

El contenido de content/aprende/ no se reescribe: si algo no pasa la validación, corrígelo lo
mínimo y anótalo en docs/decisiones.md.

La fase termina cuando pnpm learn:import carga las 118 páginas en D1 local sin errores y las
consultas de docs/21 §9 pasan sus pruebas.

No hagas nada fuera de la fase 6. No me hagas preguntas salvo los casos de parada de CLAUDE.md.
Al terminar escribe docs/informe-fase-6.md y actualiza docs/progreso.md.
```

## Aprende · Fase 7 · Páginas y buscador

```
Haz la fase 7 en modo autónomo: sigue docs/fases/fase-7.md paso por paso. Parte de main con la
fase 6 fusionada; crea la rama fase-7.

Lee CLAUDE.md, docs/informe-fase-6.md, docs/21-aprende.md, docs/22-buscador.md y
docs/fases/fase-7.md. En cada paso, lee solo lo que indica "Consultar". Compara con
reference/mockups/aprende/ en 390, 820 y 1440.

Si no hay Meilisearch configurado, no te detengas: el buscador funciona con D1; pruébalo con
Meilisearch simulado (y con Docker si está disponible) y anótalo en el informe.

La fase termina cuando pasan los flujos H a L de docs/21 §15, axe y Lighthouse cumplen en
Aprende y pnpm size está dentro del presupuesto.

No hagas nada fuera de la fase 7. No me hagas preguntas salvo los casos de parada de CLAUDE.md.
Al terminar escribe docs/informe-fase-7.md y actualiza docs/progreso.md.
```

## Aprende · Fase 8 · Panel y publicación

```
Haz la fase 8 en modo autónomo: sigue docs/fases/fase-8.md paso por paso. Parte de main con la
fase 7 fusionada; crea la rama fase-8.

Lee CLAUDE.md, docs/informe-fase-7.md, las secciones de docs/12-panel.md que pide la fase y
docs/fases/fase-8.md. En cada paso, lee solo lo que indica "Consultar".

Para el paso 8.4: si faltan credenciales de Cloudflare o de Meilisearch, deja todo listo y la
lista exacta de lo que necesitas. La importación remota solo agrega páginas; no borres nada en
producción.

Al terminar escribe docs/informe-fase-8.md con los pendientes del dueño y los pasos manuales, y
actualiza docs/progreso.md.
```

## 6. Integrar un componente externo después

Cuando el dueño entregue un componente después de terminada la construcción:

```
Puse el componente <Nombre> en src/components/external/. Intégralo siguiendo docs/11 §4:
úsalo en lugar del reemplazo, aplica su cambio obligatorio, instala y registra sus
dependencias, revisa la regla 5 de seguridad, pruébalo en 390, 820 y 1440 y borra el
reemplazo. Rama nueva, un commit, y anota el cambio en docs/progreso.md.
```

Si es un componente **nuevo** (que no está en la tabla de `11 §4`), primero se agrega su fila (sección, datos que recibe, cambio obligatorio).

## 7. Tu parte entre fases

1. Lee el informe: empieza por "Pendientes del dueño" y "Bloqueado o dudoso".
2. Pruébalo: `pnpm dev` y abre la web y el panel, en la compu y en tu celular.
3. Si algo está mal, dilo en lenguaje normal ("la foto del producto sale cortada"); Claude lo corrige en la misma rama.
4. Cuando estés conforme, fusiona a `main` y abre una sesión nueva para la siguiente fase.
5. Nunca fusiones con pruebas en rojo.

## 8. Si algo sale mal

| Situación | Qué pegar |
|---|---|
| Se detuvo y no sé por qué | `Resume en lenguaje sencillo por qué te detuviste, qué ya está hecho y qué necesitas de mí.` |
| Una prueba en rojo | `Corrige la prueba que falla sin cambiar lo que se espera en los documentos. Si lo esperado está mal, dímelo antes de tocarlo.` |
| Algo no se ve como el mockup | `Compara <página o sección> con reference/mockups/ en 390, 820 y 1440, lista las diferencias y corrígelas.` |
| Ver cómo va | `Resume docs/progreso.md: qué está igual al mockup, qué falta y qué sigue.` |
| Se interrumpió | `Continúa donde quedaste: lee docs/progreso.md y el último commit de la rama actual, y sigue con el paso que falta de docs/fases/fase-N.md.` |
