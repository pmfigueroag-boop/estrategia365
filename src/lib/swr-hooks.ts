/**
 * Estrategia 365 — SWR Data Hooks (Phase 4)
 * =============================================
 * Centralized data fetching with automatic caching,
 * revalidation, error retry, and loading states.
 *
 * Replaces manual useEffect + useState patterns across all pages.
 */
import useSWR from 'swr';
import { useState } from 'react';
import api from './api';

// ── SWR Configuration ──────────────────────────────────────────
const DEFAULT_OPTIONS = {
  revalidateOnFocus: false,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  dedupingInterval: 5000,
};

// ── Generic Fetcher Factory ────────────────────────────────────
// Wraps any api method as an SWR-compatible fetcher
function createHook(keyPrefix, fetcher, options = {}) {
  return function useData(id, extraOptions = {}) {
    const key = id ? `${keyPrefix}/${id}` : null;
    const { data, error, isLoading, isValidating, mutate } = useSWR(
      key,
      () => fetcher(id),
      { ...DEFAULT_OPTIONS, ...options, ...extraOptions }
    );
    return { data, error, isLoading, isValidating, mutate };
  };
}

// ── Analysis Hooks ─────────────────────────────────────────────
export const usePestel = createHook('pestel', (planId) => api.getPestel(planId));
export const usePestelDeepAnalysis = createHook('pestel-deep', (planId) => api.getPestelDeepAnalysis(planId));
// Phase 2: Temporal Intelligence
export const usePestelDrift = createHook('pestel-drift', (planId) => api.getPestelDrift(planId));
export const usePestelEarlyWarnings = createHook('pestel-warnings', (planId) => api.getPestelEarlyWarnings(planId));
export const usePorter = createHook('porter', async (planId) => {
  const d = await api.getPorter(planId);
  return d;  // Return full response: { forces, industry_assessment }
});
export const usePorterDeepAnalysis = createHook('porter-deep', (planId) => api.getPorterDeepAnalysis(planId));
export const useSwot = createHook('swot', (planId) => api.getSwot(planId));
export const useTows = createHook('tows', (planId) => api.getTows(planId));
export const useVrio = createHook('vrio', (planId) => api.getVrio(planId));
export const useBlueOcean = createHook('blue-ocean', (planId) => api.getBlueOcean(planId));
export const useBCG = createHook('bcg', (planId) => api.getBCG(planId));
export const useReadiness = createHook('readiness', (planId) => api.getReadiness(planId));

// ── Formulation Hooks ──────────────────────────────────────────
export const usePlans = createHook('plans', (instId) => api.getPlans(instId));
export const usePlanDetail = createHook('plan-detail', (planId) => api.getPlan(planId));

// ── Execution Hooks ────────────────────────────────────────────
export const useObjectives = createHook('objectives', (planId) => api.getObjectives(planId));
export const useBsc = createHook('bsc', (planId) => api.getBsc(planId));
export const useProgress = createHook('progress', (planId) => api.getProgress(planId));
export const useStrategyMap = createHook('strategy-map', (planId) => api.getStrategyMap(planId));
export const useExecutionHealth = createHook('exec-health', (planId) => api.getExecutionHealth(planId));

// ── Strategy Hooks ─────────────────────────────────────────────
export const useKernel = createHook('kernel', (planId) => api.getKernel(planId));
export const useKernelHistory = createHook('kernel-history', (planId) => api.getKernelHistory(planId));
export const useCausal = createHook('causal', (planId) => api.getCausal(planId));
export const useGraph = createHook('graph', (planId) => api.getGraph(planId));
export const usePulses = createHook('pulses', (planId) => api.getPulses(planId));

// ── Alignment Hooks ────────────────────────────────────────────
export const useSevenS = createHook('seven-s', (planId) => api.getSevenS(planId));

// ── Hoshin Hooks ───────────────────────────────────────────────
export const useHoshinObjectives = createHook('hoshin-obj', (planId) => api.getHoshinObjectives(planId));
export const useXMatrix = createHook('x-matrix', (planId) => api.getXMatrix(planId));
export const useCatchball = createHook('catchball', (planId) => api.getCatchball(planId));

// ── Dashboard Hook ─────────────────────────────────────────────
export const useDashboard = createHook('dashboard', (planId) => api.getDashboard(planId), {
  refreshInterval: 30000, // Auto-refresh every 30s for live dashboard
});


// ── Workspace Hooks ────────────────────────────────────────────
export function useWorkspace() {
  const { data, error, isLoading, mutate } = useSWR(
    'workspace-summary',
    () => api.getWorkspaceSummary(),
    DEFAULT_OPTIONS
  );
  return { workspace: data, error, isLoading, mutate };
}

export function useInstitutions() {
  const { data, error, isLoading, mutate } = useSWR(
    'institutions',
    () => api.getInstitutions(),
    DEFAULT_OPTIONS
  );
  return { institutions: data || [], error, isLoading, mutate };
}


// ══════════════════════════════════════════════════════════════
// FASE 2: STRATEGIC INTELLIGENCE HUB HOOKS
// ══════════════════════════════════════════════════════════════

export function useIntelligenceSummary(institutionId, planId, options = {}) {
  const key = institutionId ? `intelligence-summary/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getIntelligenceSummary(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 120000, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function useIntelligenceFreshness(institutionId, options = {}) {
  const key = institutionId ? `intelligence-freshness/${institutionId}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getIntelligenceFreshness(institutionId),
    { ...DEFAULT_OPTIONS, refreshInterval: 300000, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function useIntelligenceGaps(institutionId, planId, options = {}) {
  const key = institutionId ? `intelligence-gaps/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getIntelligenceGaps(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 300000, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function useIntelligenceRecommendations(institutionId, planId, options = {}) {
  const key = institutionId ? `intelligence-recommendations/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getIntelligenceRecommendations(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 300000, ...options }
  );
  return { data, error, isLoading, mutate };
}

// ══════════════════════════════════════════════════════════════
// FASE 4: Strategic OS — Orchestrator Hooks
// ══════════════════════════════════════════════════════════════

export function useCycleStatus(institutionId, planId, options = {}) {
  const key = institutionId ? `cycle-status/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getCycleStatus(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 30000, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function useCycleHistory(institutionId, options = {}) {
  const key = institutionId ? `cycle-history/${institutionId}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getCycleHistory(institutionId),
    { ...DEFAULT_OPTIONS, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function usePulseTrend(institutionId, planId, options = {}) {
  const key = institutionId ? `pulse-trend/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getPulseTrend(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 60000, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function useDoctrineCompliance(institutionId, planId, options = {}) {
  const key = institutionId ? `doctrine-compliance/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getDoctrineCompliance(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 120000, ...options }
  );
  return { data, error, isLoading, mutate };
}

// ══════════════════════════════════════════════════════════════
// FASE 4: Strategic OS — Executive Dashboard Hooks
// ══════════════════════════════════════════════════════════════

export function useExecutiveDashboard(institutionId, role, planId, options = {}) {
  const key = institutionId && role ? `executive/${institutionId}/${role}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getExecutiveDashboard(institutionId, role, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 60000, ...options }
  );
  return { data, error, isLoading, mutate };
}

export function useExecutiveOverview(institutionId, planId, options = {}) {
  const key = institutionId ? `executive-overview/${institutionId}/${planId || 'all'}` : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => api.getExecutiveOverview(institutionId, planId),
    { ...DEFAULT_OPTIONS, refreshInterval: 30000, ...options }
  );
  return { data, error, isLoading, mutate };
}

// ── Mutation Helpers ───────────────────────────────────────────
// Trigger an API action and revalidate the SWR cache for that key
export function useMutation(action) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const trigger = async (...args) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await action(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { trigger, isSubmitting, error };
}
