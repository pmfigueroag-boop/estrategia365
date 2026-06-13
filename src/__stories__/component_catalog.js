/**
 * Estrategia 365 — Component Stories (Phase 6)
 * ===============================================
 * Storybook-compatible component catalog for UI primitives.
 *
 * Since the project uses Next.js with JSX-in-.js files,
 * these stories document component APIs and usage patterns
 * as a living style guide.
 *
 * Run: npx storybook dev -p 6006
 */

// ── StatusBadge ────────────────────────────────────────────
export const StatusBadgeStories = {
  title: 'UI/StatusBadge',
  component: 'StatusBadge',
  variants: [
    { label: 'Activo', variant: 'success', props: { status: 'active' } },
    { label: 'Pendiente', variant: 'warning', props: { status: 'pending' } },
    { label: 'Error', variant: 'error', props: { status: 'error' } },
    { label: 'Inactivo', variant: 'neutral', props: { status: 'inactive' } },
  ],
  usage: `
    import { StatusBadge } from '@/components/ui';
    <StatusBadge status="active" />
    <StatusBadge status="pending" label="En Revisión" />
  `,
};

// ── ScoreBar ───────────────────────────────────────────────
export const ScoreBarStories = {
  title: 'UI/ScoreBar',
  component: 'ScoreBar',
  variants: [
    { label: 'High Score', props: { score: 85, max: 100, label: 'Calidad' } },
    { label: 'Medium Score', props: { score: 55, max: 100, label: 'Progreso' } },
    { label: 'Low Score', props: { score: 20, max: 100, label: 'Riesgo' } },
    { label: 'Zero', props: { score: 0, max: 100, label: 'Sin datos' } },
  ],
  usage: `
    import { ScoreBar } from '@/components/ui';
    <ScoreBar score={85} max={100} label="Calidad" />
  `,
};

// ── LoadingSpinner ─────────────────────────────────────────
export const LoadingSpinnerStories = {
  title: 'UI/LoadingSpinner',
  component: 'LoadingSpinner',
  variants: [
    { label: 'Default', props: {} },
    { label: 'Con mensaje', props: { message: 'Cargando análisis...' } },
    { label: 'Tamaño grande', props: { size: 'lg' } },
  ],
  usage: `
    import { LoadingSpinner } from '@/components/ui';
    <LoadingSpinner message="Generando estrategia..." />
  `,
};

// ── EmptyState ─────────────────────────────────────────────
export const EmptyStateStories = {
  title: 'UI/EmptyState',
  component: 'EmptyState',
  variants: [
    { label: 'Sin datos', props: { title: 'Sin resultados', description: 'No se encontraron datos para este plan.' } },
    { label: 'Con acción', props: { title: 'Sin análisis', description: 'Ejecute un scan PESTEL.', actionLabel: 'Iniciar Scan' } },
  ],
  usage: `
    import { EmptyState } from '@/components/ui';
    <EmptyState title="Sin análisis" description="Ejecute un scan." actionLabel="Iniciar" onAction={() => {}} />
  `,
};

// ── Modal ──────────────────────────────────────────────────
export const ModalStories = {
  title: 'UI/Modal',
  component: 'Modal',
  variants: [
    { label: 'Confirmación', props: { title: 'Confirmar acción', isOpen: true } },
    { label: 'Formulario', props: { title: 'Nuevo Objetivo', isOpen: true, size: 'lg' } },
  ],
  usage: `
    import { Modal } from '@/components/ui';
    <Modal isOpen={true} onClose={handleClose} title="Título">
      <p>Contenido del modal</p>
    </Modal>
  `,
};

// ── DataTable ──────────────────────────────────────────────
export const DataTableStories = {
  title: 'UI/DataTable',
  component: 'DataTable',
  variants: [
    {
      label: 'Tabla básica',
      props: {
        columns: ['Nombre', 'Score', 'Estado'],
        rows: [
          ['Obj. Financiero', '85%', 'Activo'],
          ['Obj. Cliente', '62%', 'Pendiente'],
        ],
      },
    },
  ],
  usage: `
    import { DataTable } from '@/components/ui';
    <DataTable columns={['Nombre', 'Score']} rows={data} />
  `,
};

// ── ConfirmDialog ──────────────────────────────────────────
export const ConfirmDialogStories = {
  title: 'UI/ConfirmDialog',
  component: 'ConfirmDialog',
  variants: [
    { label: 'Eliminar', props: { title: '¿Eliminar objetivo?', message: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', variant: 'danger' } },
    { label: 'Confirmar', props: { title: '¿Guardar cambios?', confirmLabel: 'Guardar' } },
  ],
  usage: `
    import { ConfirmDialog } from '@/components/ui';
    <ConfirmDialog isOpen={true} onConfirm={handleDelete} onCancel={handleCancel} title="¿Eliminar?" variant="danger" />
  `,
};

// ── Chart Components ───────────────────────────────────────
export const ChartStories = {
  title: 'Charts',
  components: {
    PestelRadar: {
      description: 'Radar chart showing PESTEL signal distribution by severity',
      props: { signals: '[{factor: "P", severity: "high", title: "..."}]' },
    },
    PorterRadar: {
      description: 'Radar chart showing Porter 5 Forces intensity',
      props: { forces: '[{force: "rivalry", score: 8}]' },
    },
    BscGauge: {
      description: 'Horizontal bar chart showing BSC perspective progress',
      props: { perspectives: '[{perspective: "financial", current_value: 75, target_value: 100}]' },
    },
    SevenSRadar: {
      description: 'Radar chart with current vs target overlay for 7S alignment',
      props: { elements: '[{element: "strategy", current: 7, target: 9}]' },
    },
    DashboardCharts: {
      description: 'Composite chart panel for executive dashboard',
      props: { data: '{objectives: [...], progress: {...}}' },
    },
  },
};

// ── Component Inventory ────────────────────────────────────
export const COMPONENT_CATALOG = {
  primitives: ['StatusBadge', 'ScoreBar', 'LoadingSpinner', 'EmptyState', 'Modal', 'DataTable', 'ConfirmDialog'],
  charts: ['PestelRadar', 'PorterRadar', 'BscGauge', 'SevenSRadar', 'DashboardCharts'],
  layout: ['Header', 'ErrorBoundary', 'SkeletonLoader', 'DiagnosticReadiness'],
  total: 16,
};
