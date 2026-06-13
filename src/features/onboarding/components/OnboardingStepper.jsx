'use client';
/**
 * OnboardingStepper — Enhanced step indicator with progress bar
 * ==============================================================
 * Features:
 * - Visual progress bar with gradient fill
 * - Completion percentage
 * - Step icons with active/completed/locked states
 * - Smooth transitions between states
 */

const STEPS = [
  { id: 1, label: 'Identidad', icon: '🏛️' },
  { id: 2, label: 'Misión', icon: '🎯' },
  { id: 3, label: 'Contexto', icon: '🌍' },
  { id: 4, label: 'Stakeholders', icon: '👥' },
  { id: 5, label: 'Gobernanza', icon: '⚖️' },
  { id: 6, label: 'Riesgo', icon: '🛡️' },
  { id: 7, label: 'Operaciones', icon: '🔗' },
  { id: 8, label: 'Métricas', icon: '📊' },
  { id: 9, label: 'Documentos', icon: '📄' },
  { id: 10, label: 'Resumen', icon: '🔮' },
  { id: 11, label: 'Plan', icon: '🗂️' },
];

export default function OnboardingStepper({
  currentStep,
  tier = 'free',
  tierAccess,
  institutionId,
  onStepClick,
}) {
  const accessibleSteps = tierAccess?.[tier] || STEPS.map(s => s.id);
  const completedSteps = currentStep - 1;
  const totalSteps = STEPS.length;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="onboarding-stepper" role="navigation" aria-label="Pasos del onboarding">
      {/* Progress bar */}
      <div className="stepper-progress-container">
        <div className="stepper-progress-bar">
          <div
            className="stepper-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="stepper-progress-label">
          {progressPct}% completado
        </span>
      </div>

      {/* Step indicators */}
      <div className="stepper-steps">
        {STEPS.map(s => {
          const accessible = accessibleSteps.includes(s.id);
          const locked = !accessible;
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;
          const isClickable = !locked && (isCompleted || (institutionId && s.id <= currentStep));

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(s.id)}
              className={`stepper-step ${
                locked ? 'stepper-step--locked' :
                isActive ? 'stepper-step--active' :
                isCompleted ? 'stepper-step--completed' :
                'stepper-step--pending'
              }`}
              aria-current={isActive ? 'step' : undefined}
              aria-disabled={!isClickable}
              title={locked ? `${s.label} — Requiere upgrade de tier` : s.label}
            >
              <div className="stepper-step-dot">
                {locked ? '🔒' : isCompleted ? '✓' : s.icon}
              </div>
              <span className="stepper-step-label">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
