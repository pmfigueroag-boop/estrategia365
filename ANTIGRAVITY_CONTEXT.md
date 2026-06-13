# 🌌 Antigravity Master Context: Estrategia 365

Este documento define las directrices, visión y restricciones absolutas con las que Antigravity (y cualquier asistente de IA) debe operar al trabajar en el repositorio de **Estrategia 365**.

> [!IMPORTANT]
> **A LA IA (ANTIGRAVITY):** Lee este documento antes de proponer cambios arquitectónicos, crear nuevas rutas o sugerir librerías de terceros. Este es tu marco de referencia absoluto para este proyecto.

---

## 1. Visión del Producto
**Estrategia 365** es una plataforma B2B de grado institucional (SaaS) diseñada para acompañar a las organizaciones en el ciclo de vida completo de su planificación corporativa. El "motor doctrinal" y flujo conceptual que gobierna la aplicación es estrictamente la siguiente secuencia:

> **Gobernar → Diagnosticar → Formular → Planificar → Ejecutar → Monitorear → Evaluar → Aprender → Adaptar → Reconfigurar**

La plataforma asegura que el usuario no pueda visualizar indicadores vacíos ni paneles de inteligencia si antes no ha definido explícitamente su Organización (Tenant) y su Plan Estratégico (Ciclo/Timeframe).

---

## 2. Definición del MVP (Producto Mínimo Viable)
El MVP tiene un **foco estricto y delimitado**. Cualquier funcionalidad que quede fuera del MVP está estrictamente prohibida en la rama `mvp-core` y `main`, y debe posponerse o enviarse a la rama `experimental`.

**El MVP Incluye (SÍ HACER):**
- **Arquitectura Multitenant:** Flujo estricto de Login → Selección de Organización (Tenant) → Selección de Plan Estratégico.
- **Onboarding de Organización:** Proceso paso a paso guiado para configurar la Identidad, Misión, Visión, Contexto y Gobernanza del Tenant.
- **Diagnóstico (Análisis):** Herramientas fundamentales: PESTEL, Fuerzas de Porter, Matriz BCG y FODA/SWOT.
- **Ejecución y Formulación:** Definición de Objetivos usando Balanced Scorecard (BSC), Mapa Estratégico y árbol de OKRs.
- **Dashboard Ejecutivo:** Vista principal de métricas de alto nivel para consumo del liderazgo.

**Post-MVP (NO HACER DURANTE EL MVP):**
- Wargaming y Simulaciones (Montecarlo avanzado).
- Módulos de Cumplimiento (Compliance, SOC2, Auditoría estricta).
- Inteligencia Artificial Avanzada (AI Governance, Agentes autónomos para toma de decisiones).
- Hoshin Kanri Avanzado (Se sustituye temporalmente por OKRs/BSC estándar).

---

## 3. Stack Tecnológico
El ecosistema tecnológico está cerrado. No instales nuevas dependencias a menos que se te indique explícitamente.
- **Framework Principal:** Next.js (App Router) + React (Componentes funcionales).
- **Estilos y UI:** Tailwind CSS (evitando CSS global en la medida de lo posible, prefiriendo utility classes).
- **Gestión de Datos y Estado:** `SWR` para data fetching y caché local. No uses Redux ni Zustand para estados que pueden vivir en la URL o SWR.
- **Manejo de Formularios:** `react-hook-form` acoplado a `zod` para validaciones de esquemas estables.
- **Visualización:** `recharts` para dashboards y gráficos.
- **Testing:** `Vitest` + `React Testing Library`. **Regla inquebrantable:** Todo cambio debe mantener la suite de tests en verde (`npx vitest run`).

---

## 4. Convenciones de Código y Arquitectura
El repositorio sigue una **Clean Architecture** fuertemente influenciada por *Feature-Sliced Design*.

- **`src/core/`**: Reglas de negocio puras.
  - `domain/`: Tipos, interfaces TypeScript (si aplica), entidades y constantes.
  - `infrastructure/`: Clientes API (`api.js`, fetchers), conectores y adaptadores. No debe tener código de React.
- **`src/components/`**: Componentes puramente presentacionales y reutilizables.
  - `layout/`: Estructuras de aplicación (AuthGuard, ClientShell).
  - `navigation/`: Headers, Sidebars.
  - `ui/`: Micro-componentes (Botones, inputs, modales, badges).
- **`src/features/`**: Módulos funcionales autocontenidos (e.g., `analysis/`, `execution/`, `onboarding/`). Aquí viven los componentes de negocio y los hooks de estado SWR (`shared/hooks`).
- **`src/app/`**: Únicamente maneja enrutamiento (Next.js Pages & Layouts) y la inyección de metadatos o protecciones básicas de ruta. Toda lógica pesada se delega a `src/features`.

---

## 5. Restricciones y "Qué SÍ y qué NO"

### ✅ Qué SÍ debes hacer:
- **Priorizar el MVP:** Si se te pide desarrollar algo ambiguo, inclínate siempre por la solución más simple que cumpla con el MVP.
- **Escribir Tests Unitarios:** Siempre que crees un componente crítico o un hook, compleméntalo con su prueba correspondiente en `src/__tests__/`.
- **Proteger Rutas de Datos:** Verificar siempre que existe un `tenant` y un `plan` activo antes de renderizar un componente de visualización de datos. Usa fallbacks visuales elegantes en caso de ausencia de datos.
- **Ser Conciso en la UI:** Respetar los "Gold Standards" estéticos (Premium, Dark Modes elegantes si aplican, UI sin distracciones y enfocada en métricas institucionales).

### ❌ Qué NO debes hacer:
- **No rompas la arquitectura:** No mezcles lógica de base de datos o llamadas HTTP crudas dentro de los componentes visuales de React. Usa la capa `src/core/infrastructure/`.
- **No asumas el estado inicial:** Nunca asumas que `localStorage` o el backend retornarán la data perfectamente poblada. Implementa siempre estados de carga (Skeleton Loaders) y manejo de errores silenciosos.
- **No sugieras refactorizaciones destructivas globales:** Fuera del MVP, evita mover grandes volúmenes de carpetas a menos que el Usuario lo autorice mediante un *Implementation Plan*.
- **No uses herramientas arcaicas de IA:** No uses `sed` de bash para reemplazar código. Usa tus herramientas dedicadas de edición de archivos de código.
