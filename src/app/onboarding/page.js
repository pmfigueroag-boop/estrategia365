"use client";
/**
 * OnboardingPage — Pure Presentation Layer
 * ==========================================
 * Phase 3 refactor: All state management is in useOnboarding hook.
 * All API logic is in onboardingService. This file is ~60 lines of render.
 */
import { FormProvider } from 'react-hook-form';
import { useOnboarding } from './hooks/useOnboarding';
import { useAccessibleStep, SkipToContent } from './hooks/useAccessibleStep';

import StepIdentity from '@/features/onboarding/components/StepIdentity';
import StepMission from '@/features/onboarding/components/StepMission';
import StepContext from '@/features/onboarding/components/StepContext';
import StepStakeholders from '@/features/onboarding/components/StepStakeholders';
import StepGovernance from '@/features/onboarding/components/StepGovernance';
import StepRiskCulture from '@/features/onboarding/components/StepRiskCulture';
import StepOperations from '@/features/onboarding/components/StepOperations';
import StepMetrics from '@/features/onboarding/components/StepMetrics';

import StepSummary from '@/features/onboarding/components/StepSummary';
import StepPlan from '@/features/onboarding/components/StepPlan';
import SaveStatusIndicator from '@/features/onboarding/components/SaveStatusIndicator';
import { StepErrorBoundary } from '@/features/onboarding/components/StepErrorBoundary';
import OnboardingStepper from '@/features/onboarding/components/OnboardingStepper';
import StepTransition from '@/features/onboarding/components/StepTransition';
import service from './services/onboardingService';

export default function OnboardingPage() {
  const {
    step, setStep, isLoading, isSaving,
    institutionId, tier, methods,
    entities, updateEntities,
    persistence, goToStep,
    onIdentityNext, onMissionNext, onSaveProfile, handleFinish,
    TIER_ACCESS,
  } = useOnboarding();

  // WCAG: Focus management + live announcements
  const { stepContainerProps, AnnouncerElement } = useAccessibleStep({
    step,
    totalSteps: 10,
    onPrev: step > 1 ? () => setStep(step - 1) : undefined,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto py-8 text-center" role="alert" aria-busy="true">
        <div className="glass-panel card p-12">
          <div className="text-4xl mb-4 animate-pulse">🏛️</div>
          <p className="text-gray-400">Cargando perfil institucional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-8">
      <SkipToContent targetId="onboarding-content" />
      <AnnouncerElement />
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Onboarding Institucional</h1>
        <p className="text-gray-400">Configuremos el perfil de tu organización para que la IA genere análisis específicos.</p>
        <SaveStatusIndicator status={persistence.saveStatus} lastSavedAt={persistence.lastSavedAt} />
      </div>

      {/* Enhanced Stepper with progress bar */}
      <OnboardingStepper
        currentStep={step}
        tier={tier}
        tierAccess={TIER_ACCESS}
        institutionId={institutionId}
        onStepClick={(target) => {
          if (target <= (institutionId ? 10 : step)) {
            setStep(target);
            service.syncProgress({ current_step: target });
          }
        }}
      />

      <FormProvider {...methods}>
        <form onSubmit={e => e.preventDefault()} id="onboarding-content" {...stepContainerProps}>
          <StepTransition stepKey={step}>
          {step === 1 && <StepErrorBoundary stepName="Identidad" onSkip={() => goToStep(2)}><StepIdentity onNext={onIdentityNext} /></StepErrorBoundary>}
          {step === 2 && <StepErrorBoundary stepName="Misión" onSkip={() => goToStep(3)}><StepMission onPrev={() => setStep(1)} onNext={onMissionNext} /></StepErrorBoundary>}
          {step === 3 && <StepErrorBoundary stepName="Contexto" onSkip={() => goToStep(4)}><StepContext onPrev={() => setStep(2)} onSave={onSaveProfile} isSaving={isSaving} /></StepErrorBoundary>}
          {step === 4 && <StepErrorBoundary stepName="Stakeholders" onSkip={() => goToStep(5)}><StepStakeholders onPrev={() => setStep(3)} onNext={() => goToStep(5)} institutionId={institutionId} stakeholders={entities.stakeholders} setStakeholders={(v) => updateEntities({ stakeholders: v })} /></StepErrorBoundary>}
          {step === 5 && <StepErrorBoundary stepName="Gobernanza" onSkip={() => goToStep(6)}><StepGovernance onPrev={() => setStep(4)} onNext={() => goToStep(6)} institutionId={institutionId} governance={entities.governance} setGovernance={(v) => updateEntities({ governance: v })} orgUnits={entities.orgUnits} setOrgUnits={(v) => updateEntities({ orgUnits: v })} capabilities={entities.capabilities} setCapabilities={(v) => updateEntities({ capabilities: v })} /></StepErrorBoundary>}
          {step === 6 && <StepErrorBoundary stepName="Riesgo & Cultura" onSkip={() => goToStep(7)}><StepRiskCulture onPrev={() => setStep(5)} onNext={() => goToStep(7)} institutionId={institutionId} knownRisks={entities.knownRisks} setKnownRisks={(v) => updateEntities({ knownRisks: v })} cultureProfile={entities.cultureProfile} setCultureProfile={(v) => updateEntities({ cultureProfile: v })} /></StepErrorBoundary>}
          {step === 7 && <StepErrorBoundary stepName="Operaciones" onSkip={() => goToStep(8)}><StepOperations onPrev={() => setStep(6)} onNext={() => goToStep(8)} institutionId={institutionId} valueChain={entities.valueChain} setValueChain={(v) => updateEntities({ valueChain: v })} dependencies={entities.dependencies} setDependencies={(v) => updateEntities({ dependencies: v })} techSystems={entities.techSystems} setTechSystems={(v) => updateEntities({ techSystems: v })} /></StepErrorBoundary>}
          {step === 8 && <StepErrorBoundary stepName="Métricas" onSkip={() => goToStep(9)}><StepMetrics onPrev={() => setStep(7)} onNext={() => goToStep(9)} institutionId={institutionId} metrics={entities.metrics} setMetrics={(v) => updateEntities({ metrics: v })} sector={methods.getValues().sector} /></StepErrorBoundary>}
          {step === 9 && <StepErrorBoundary stepName="Resumen" onSkip={() => goToStep(10)}><StepSummary onPrev={() => setStep(8)} onNext={() => goToStep(10)} institutionId={institutionId} tier={tier} /></StepErrorBoundary>}
          {step === 10 && <StepErrorBoundary stepName="Plan"><StepPlan onPrev={() => setStep(9)} onFinish={handleFinish} isSaving={isSaving} /></StepErrorBoundary>}
          </StepTransition>
        </form>
      </FormProvider>
    </div>
  );
}
