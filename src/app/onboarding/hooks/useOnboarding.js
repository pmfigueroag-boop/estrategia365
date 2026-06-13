'use client';
/**
 * useOnboarding — Consolidated Onboarding State Hook
 * ====================================================
 * Merges 15+ useState calls from page.js into one hook.
 *
 * Returns: { state, actions, computed }
 * - state:    All reactive values (step, institutionId, entities, etc.)
 * - actions:  Step navigation, profile save, plan creation
 * - computed: Progress %, accessible steps, loading state
 */
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/features/plan/context/ToastContext';
import { onboardingSchema } from '../schema';
import { useOnboardingPersistence } from './useOnboardingPersistence';
import { useOnboardingAnalytics } from './useOnboardingAnalytics';
import service from '../services/onboardingService';

const TIER_ACCESS = {
  free:         [1, 2, 3, 4, 9, 10, 11],
  professional: [1, 2, 3, 4, 5, 6, 9, 10, 11],
  enterprise:   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  sovereign:    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

export function useOnboarding() {
  const toast = useToast();

  // ── Core state ─────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [institutionId, setInstitutionId] = useState(null);
  const [tier, setTier] = useState('free');

  // ── Entity state ───────────────────────────────────────
  const [entities, setEntities] = useState({
    documents: [],
    stakeholders: [],
    governance: null,
    orgUnits: [],
    capabilities: [],
    knownRisks: [],
    cultureProfile: null,
    valueChain: [],
    dependencies: [],
    techSystems: [],
    metrics: service.METRICS_DEFAULTS,
  });

  // ── Form ───────────────────────────────────────────────
  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: service.FORM_DEFAULTS,
    mode: 'onTouched',
  });
  
  // Suscribe to errors to ensure Proxy triggers updates correctly
  const { errors } = methods.formState;

  // ── Plugins ────────────────────────────────────────────
  const persistence = useOnboardingPersistence({ methods, institutionId, step });
  const analytics = useOnboardingAnalytics(institutionId);

  // ── Entity updater (partial) ───────────────────────────
  const updateEntities = useCallback((patch) => {
    setEntities(prev => ({ ...prev, ...patch }));
  }, []);

  // ── Load progress on mount ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const data = await service.loadFullProgress();
      if (cancelled || !data) {
        setIsLoading(false);
        return;
      }

      setStep(data.step);
      setInstitutionId(data.institutionId);
      setTier(data.tier);
      methods.reset(data.formValues);
      setEntities({
        documents: data.documents,
        stakeholders: data.stakeholders,
        governance: data.governance,
        orgUnits: data.orgUnits,
        capabilities: data.capabilities,
        knownRisks: data.knownRisks,
        cultureProfile: data.cultureProfile,
        valueChain: data.valueChain,
        dependencies: data.dependencies,
        techSystems: data.techSystems,
        metrics: data.metrics,
      });
      setIsLoading(false);
    }

    load();
    analytics.trackStart();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────

  const goToStep = useCallback((target) => {
    analytics.trackStepCompleted(target, step);
    setStep(target);
    service.syncProgress({ current_step: target });
  }, [step, analytics]);

  const onIdentityNext = useCallback(async () => {
    const valid = await methods.trigger(['name', 'sector', 'industry', 'size']);
    if (valid) {
      setStep(2);
      service.syncProgress({ current_step: 2, form_data: JSON.stringify(methods.getValues()) });
    } else {
      toast.warning('Por favor completa los campos requeridos correctamente');
    }
  }, [methods, toast]);

  const onMissionNext = useCallback(() => {
    setStep(3);
    service.syncProgress({ current_step: 3, form_data: JSON.stringify(methods.getValues()) });
  }, [methods]);

  const onSaveProfile = useCallback(async () => {
    const valid = await methods.trigger();
    if (!valid) {
      console.error('Validation errors on save:', errors);
      toast.error('Revisa los errores en los pasos anteriores');
      if (errors.name || errors.sector || errors.industry || errors.size) setStep(1);
      else if (errors.description) setStep(3);
      return;
    }

    setIsSaving(true);
    try {
      const data = methods.getValues();
      const inst = await service.saveInstitutionProfile(institutionId, data);
      setInstitutionId(inst.id);
      service.syncProgress({
        current_step: 4,
        institution_id: inst.id,
        form_data: JSON.stringify(data),
      });
      toast.success('Perfil institucional guardado');
      setStep(4);
    } catch (e) {
      toast.error(e.message || 'Error al guardar perfil');
    }
    setIsSaving(false);
  }, [institutionId, methods, toast, errors]);

  const handleFinish = useCallback(async (paradigmId) => {
    if (!institutionId) {
      toast.error('Guarda el perfil primero.');
      return;
    }
    setIsSaving(true);
    try {
      const plan = await service.createPlan(institutionId, {
        paradigmId,
        mission: methods.getValues().mission || '',
        vision: methods.getValues().vision || '',
      });
      service.syncProgress({
        current_step: 11,
        plan_id: plan.id,
        status: 'completed',
      });
      analytics.trackCompleted(plan.id);
      toast.success(`¡Onboarding completo! Plan #${plan.id} creado. Procede al análisis.`);
      window.location.href = '/analysis';
    } catch (e) {
      toast.error(e.message || 'Error al crear plan');
    }
    setIsSaving(false);
  }, [institutionId, methods, toast, analytics]);

  // ── Return ─────────────────────────────────────────────
  return {
    // State
    step,
    setStep,
    isLoading,
    isSaving,
    institutionId,
    tier,
    methods,
    entities,
    updateEntities,

    // Persistence + Analytics
    persistence,
    analytics,

    // Actions
    goToStep,
    onIdentityNext,
    onMissionNext,
    onSaveProfile,
    handleFinish,

    // Constants
    TIER_ACCESS,
  };
}
