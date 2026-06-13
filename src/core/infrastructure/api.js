import { request, isAuthenticated, clearTokens, getAccessToken, resolveUrl, setTokens } from './apiClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = {
  // ── Institutions ────────────────────────────────────────
  getInstitutions: () => request('/institutions/'),
  getInstitution: (id) => request(`/institutions/${id}`),
  createInstitution: (data) => request('/institutions/', { method: 'POST', body: JSON.stringify(data) }),
  updateInstitution: (id, data) => request(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstitution: (id) => request(`/institutions/${id}`, { method: 'DELETE' }),
  getWorkspaceSummary: () => request('/institutions/workspace/summary'),

  // ── Stakeholders ────────────────────────────────────────
  getStakeholders: (institutionId) => request(`/stakeholders/${institutionId}`),
  addStakeholder: (institutionId, data) => request(`/stakeholders/${institutionId}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteStakeholder: (stakeholderId) => request(`/stakeholders/${stakeholderId}`, { method: 'DELETE' }),

  // ── Governance (Horizonte 2) ────────────────────────────
  getGovernance: (institutionId) => request(`/governance/${institutionId}`),
  updateGovernance: (institutionId, data) => request(`/governance/${institutionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getOrgUnits: (institutionId) => request(`/governance/${institutionId}/units`),
  addOrgUnit: (institutionId, data) => request(`/governance/${institutionId}/units`, { method: 'POST', body: JSON.stringify(data) }),
  deleteOrgUnit: (unitId) => request(`/governance/units/${unitId}`, { method: 'DELETE' }),
  getCapabilities: (institutionId) => request(`/governance/${institutionId}/capabilities`),
  addCapability: (institutionId, data) => request(`/governance/${institutionId}/capabilities`, { method: 'POST', body: JSON.stringify(data) }),
  deleteCapability: (capId) => request(`/governance/capabilities/${capId}`, { method: 'DELETE' }),

  // ── Risk & Culture (Horizonte 2) ────────────────────────
  getKnownRisks: (institutionId) => request(`/risk-culture/${institutionId}/risks`),
  addKnownRisk: (institutionId, data) => request(`/risk-culture/${institutionId}/risks`, { method: 'POST', body: JSON.stringify(data) }),
  deleteKnownRisk: (riskId) => request(`/risk-culture/risks/${riskId}`, { method: 'DELETE' }),
  getCultureProfile: (institutionId) => request(`/risk-culture/${institutionId}/culture`),
  updateCultureProfile: (institutionId, data) => request(`/risk-culture/${institutionId}/culture`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Value Chain (Horizonte 3) ───────────────────────────
  getValueChain: (institutionId) => request(`/operations/${institutionId}/value-chain`),
  addValueChainActivity: (institutionId, data) => request(`/operations/${institutionId}/value-chain`, { method: 'POST', body: JSON.stringify(data) }),
  updateValueChainActivity: (activityId, data) => request(`/operations/value-chain/${activityId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteValueChainActivity: (activityId) => request(`/operations/value-chain/${activityId}`, { method: 'DELETE' }),

  // ── Dependencies (Horizonte 3) ──────────────────────────
  getDependencies: (institutionId) => request(`/operations/${institutionId}/dependencies`),
  addDependency: (institutionId, data) => request(`/operations/${institutionId}/dependencies`, { method: 'POST', body: JSON.stringify(data) }),
  deleteDependency: (depId) => request(`/operations/dependencies/${depId}`, { method: 'DELETE' }),

  // ── Tech Systems (Horizonte 3) ──────────────────────────
  getTechSystems: (institutionId) => request(`/operations/${institutionId}/tech-systems`),
  addTechSystem: (institutionId, data) => request(`/operations/${institutionId}/tech-systems`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTechSystem: (sysId) => request(`/operations/tech-systems/${sysId}`, { method: 'DELETE' }),

  // ── Maturity (Horizonte 4) ──────────────────────────────
  getMaturityAssessment: (institutionId) => request(`/institutions/${institutionId}/maturity`),
  triggerMaturityAssessment: (institutionId) => request(`/institutions/${institutionId}/maturity/assess`, { method: 'POST' }),
  updateInstitutionTier: (institutionId, tier) => request(`/institutions/${institutionId}/tier`, { method: 'PATCH', body: JSON.stringify({ tier }) }),

  // ── Onboarding Progress ─────────────────────────────────
  getOnboardingProgress: () => request('/onboarding/progress'),
  updateOnboardingProgress: (data) => request('/onboarding/progress', { method: 'PUT', body: JSON.stringify(data) }),

  // ── Plans ───────────────────────────────────────────────
  createPlan: (institutionId, data) => request(`/plans/${institutionId}`, { method: 'POST', body: JSON.stringify(data) }),
  getPlans: (institutionId) => request(`/plans/${institutionId}`),
  getPlan: (planId) => request(`/plans/single/${planId}`),
  updatePlan: (planId, data) => request(`/plans/${planId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlan: (planId) => request(`/plans/${planId}`, { method: 'DELETE' }),
  extractFormulation: (institutionId) => request(`/plans/extract-from-docs/${institutionId}`, { method: 'POST' }),
  synthesizeFormulation: (planId) => request(`/plans/synthesize/${planId}`, { method: 'POST' }),

  // ── Analysis ────────────────────────────────────────────
  getPestel: (planId) => request(`/analysis/${planId}/pestel`),
  scanPestel: (planId) => request(`/analysis/${planId}/pestel/scan`, { method: 'POST' }),
  createPestel: (planId, data) => request(`/analysis/${planId}/pestel`, { method: 'POST', body: JSON.stringify(data) }),
  clearPestel: (planId) => request(`/analysis/${planId}/pestel`, { method: 'DELETE' }),
  getPorter: (planId) => request(`/analysis/${planId}/porter`),
  scanPorter: (planId) => request(`/analysis/${planId}/porter/scan`, { method: 'POST' }),
  createPorter: (planId, data) => request(`/analysis/${planId}/porter`, { method: 'POST', body: JSON.stringify(data) }),
  clearPorter: (planId) => request(`/analysis/${planId}/porter`, { method: 'DELETE' }),
  getPorterDeepAnalysis: (planId) => request(`/analysis/${planId}/porter/deep-analysis`),
  getSwot: (planId) => request(`/analysis/${planId}/swot`),
  generateSwot: (planId) => request(`/analysis/${planId}/swot/generate`, { method: 'POST' }),
  createSwot: (planId, data) => request(`/analysis/${planId}/swot`, { method: 'POST', body: JSON.stringify(data) }),
  clearSwot: (planId) => request(`/analysis/${planId}/swot`, { method: 'DELETE' }),
  getTows: (planId) => request(`/analysis/${planId}/tows`),
  generateTows: (planId) => request(`/analysis/${planId}/tows/generate`, { method: 'POST' }),
  clearTows: (planId) => request(`/analysis/${planId}/tows`, { method: 'DELETE' }),
  generateBlueOcean: (planId) => request(`/analysis/${planId}/blue-ocean`, { method: 'POST' }),
  generateBCG: (planId) => request(`/analysis/${planId}/bcg`, { method: 'POST' }),
  getVrio: (planId) => request(`/analysis/${planId}/vrio`),
  generateVrio: (planId) => request(`/analysis/${planId}/vrio/generate`, { method: 'POST' }),
  clearVrio: (planId) => request(`/analysis/${planId}/vrio`, { method: 'DELETE' }),
  getBlueOcean: (planId) => request(`/analysis/${planId}/blue-ocean`),
  getBCG: (planId) => request(`/analysis/${planId}/bcg`),
  getReadiness: (planId) => request(`/analysis/${planId}/readiness`),
  getQualityAudit: (planId) => request(`/analysis/${planId}/quality-audit`),
  getPestelDeepAnalysis: (planId) => request(`/analysis/${planId}/pestel/deep-analysis`),
  getPestelDrift: (planId) => request(`/analysis/${planId}/pestel/drift`),
  getPestelEarlyWarnings: (planId) => request(`/analysis/${planId}/pestel/early-warnings`),
  exportPestelCsv: (planId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('e365_access_token') : null;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${base}/v1/analysis/${planId}/pestel/export`;
    return fetch(url, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      .then(r => { if (!r.ok) throw new Error(`Export failed: ${r.status}`); return r.blob(); })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `pestel_plan_${planId}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  },

  // ── Strategy Core ───────────────────────────────────────
  generateKernel: (planId) => request(`/strategy/decide/${planId}`, { method: 'POST' }),
  getKernel: (planId) => request(`/strategy/kernel/${planId}`),
  getKernelHistory: (planId) => request(`/strategy/kernel/${planId}/history`),
  getKernelStatus: (planId) => request(`/strategy/kernel/${planId}/status`),
  updateDecisionStatus: (decisionId, payload) => request(`/strategy/decisions/${decisionId}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  signDecision: (decisionId, payload) => request(`/strategy/decisions/${decisionId}/sign`, { method: 'POST', body: JSON.stringify(payload) }),
  deployDecision: (decisionId) => request(`/strategy/decisions/${decisionId}/deploy`, { method: 'POST' }),
  getDecisionTraceability: (decisionId) => request(`/strategy/decisions/${decisionId}/traceability`),
  getStrategyAudit: (planId) => request(`/strategy/audit/${planId}`),
  generateCausal: (planId) => request(`/strategy/causal/${planId}`, { method: 'POST' }),
  getCausal: (planId) => request(`/strategy/causal/${planId}`),
  generateGraph: (planId) => request(`/strategy/graph/${planId}`, { method: 'POST' }),
  getGraph: (planId) => request(`/strategy/graph/${planId}`),
  generatePulse: (planId) => request(`/strategy/pulse/${planId}`, { method: 'POST' }),
  getPulses: (planId) => request(`/strategy/pulse/${planId}`),
  optimizePortfolio: (planId, constraints) => {
    const params = new URLSearchParams();
    if (constraints.max_budget) params.set('max_budget', constraints.max_budget);
    if (constraints.max_people) params.set('max_people', constraints.max_people);
    if (constraints.max_months) params.set('max_months', constraints.max_months);
    const qs = params.toString();
    return request(`/strategy/optimize/${planId}${qs ? '?' + qs : ''}`, { method: 'POST' });
  },
  simulateScenarios: (planId) => request(`/strategy/simulate/${planId}`, { method: 'POST' }),

  // ── Execution (OKR/BSC/Strategy Map) ────────────────────
  getProgress: (planId) => request(`/execution/${planId}/progress`),
  getObjectives: (planId) => request(`/execution/${planId}/objectives`),
  createObjective: (planId, data) => request(`/execution/${planId}/objectives`, { method: 'POST', body: JSON.stringify(data) }),
  updateObjective: (objectiveId, data) => request(`/execution/objectives/${objectiveId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteObjective: (objectiveId) => request(`/execution/objectives/${objectiveId}`, { method: 'DELETE' }),
  createKeyResult: (objectiveId, data) => request(`/execution/objectives/${objectiveId}/kr`, { method: 'POST', body: JSON.stringify(data) }),
  updateKeyResult: (krId, data) => request(`/execution/kr/${krId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getKrProgress: (krId) => request(`/execution/kr/${krId}/progress`),
  getBsc: (planId) => request(`/execution/${planId}/bsc`),
  createBsc: (planId, data) => request(`/execution/${planId}/bsc`, { method: 'POST', body: JSON.stringify(data) }),
  updateBsc: (bscId, data) => request(`/execution/bsc/${bscId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBsc: (bscId) => request(`/execution/bsc/${bscId}`, { method: 'DELETE' }),
  synthesizeOkrs: (planId) => request(`/execution/${planId}/synthesize-okrs`, { method: 'POST' }),
  synthesizeBsc: (planId) => request(`/execution/${planId}/synthesize-bsc`, { method: 'POST' }),
  getStrategyMap: (planId) => request(`/execution/${planId}/strategy-map`),
  synthesizeStrategyMap: (planId) => request(`/execution/${planId}/synthesize-strategy-map`, { method: 'POST' }),
  getExecutionHealth: (planId) => request(`/execution/${planId}/execution-health`),
  getAdaptiveHealth: (planId) => request(`/execution/${planId}/adaptive-health`),
  getHumanGovernance: (planId) => request(`/execution/${planId}/human-governance`),
  hoshinDeploy: (planId, decisionId) => request(`/execution/${planId}/hoshin-deploy/${decisionId}`, { method: 'POST' }),

  // ── Alignment (7S) ─────────────────────────────────────
  getSevenS: (planId) => request(`/alignment/${planId}/7s`),
  saveSevenS: (planId, data) => request(`/alignment/${planId}/7s`, { method: 'POST', body: JSON.stringify(data) }),
  diagnoseSevenS: (planId) => request(`/alignment/${planId}/7s/diagnose`, { method: 'POST' }),
  clearSevenS: (planId) => request(`/alignment/${planId}/7s`, { method: 'DELETE' }),

  // ── Hoshin Kanri ────────────────────────────────────────
  getHoshinObjectives: (planId) => request(`/hoshin/${planId}/objectives`),
  createHoshinObjective: (planId, data) => request(`/hoshin/${planId}/objectives`, { method: 'POST', body: JSON.stringify(data) }),
  updateHoshinObjective: (objId, data) => request(`/hoshin/objectives/${objId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHoshinObjective: (objId) => request(`/hoshin/objectives/${objId}`, { method: 'DELETE' }),
  getXMatrix: (planId) => request(`/hoshin/${planId}/x-matrix`),
  synthesizeHoshin: (planId) => request(`/hoshin/${planId}/synthesize-hoshin`, { method: 'POST' }),
  getCatchball: (planId) => request(`/hoshin/${planId}/catchball`),
  createCatchball: (planId, data) => request(`/hoshin/${planId}/catchball`, { method: 'POST', body: JSON.stringify(data) }),
  getHoshinCascade: (planId) => request(`/hoshin/${planId}/cascade`),

  // ── Dashboard ───────────────────────────────────────────
  getDashboard: (planId) => request(`/dashboard/${planId}`),

  // ── V3: Institutional Features ──────────────────────────
  getAuditTrail: (planId) => request(`/v3/${planId}/audit-trail`),
  getAuditExportUrl: (planId) => `${API_BASE}/v1/v3/${planId}/audit-export`,
  getPorterStrategy: (planId) => request(`/v3/${planId}/porter-strategy`),
  getBadStrategyDetector: (planId) => request(`/v3/${planId}/bad-strategy-detector`),
  getTenantIsolation: (institutionId) => request(`/v3/tenant/${institutionId}/isolation-check`),
  getSsoStatus: () => request('/v3/sso/status'),

  // ── Auth ────────────────────────────────────────────────
  login: async (email, password) => {
    const url = resolveUrl('/auth/login');
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      credentials: 'include',
    });
    const csrfToken = res.headers.get('x-csrf-token');
    if (csrfToken && typeof window !== 'undefined') {
      localStorage.setItem('e365_csrf_token', csrfToken);
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Error ${res.status}`);
    }
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data;
  },
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  recoverPassword: (email) => request('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, new_password) => request('/auth/reset', { method: 'POST', body: JSON.stringify({ token, new_password }) }),
  getMe: () => request('/auth/me'),
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch { /* best effort */ }
    clearTokens();
  },
  refreshToken: (token) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }),
  getUsers: () => request('/auth/users'),
  getMyTenants: () => request('/auth/me/tenants'),
  createTenant: (name) => request('/tenant', { method: 'POST', body: JSON.stringify({ name }) }),
  switchTenant: async (tenantId) => {
    const data = await request('/auth/switch-tenant', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) });
    if ((data ).access_token) {
      setTokens((data ).access_token, (data ).refresh_token);
    }
    return data;
  },
  getTenantPlans: () => request('/plans/tenant'),

  isAuthenticated,
  clearTokens,
  getAccessToken,

  // ── Health & Observability ──────────────────────────────
  getHealth: () => request('/health'),
  getReady: () => request('/ready'),
  getDeepHealth: () => request('/health/deep'),
  getMetricsUrl: () => `${API_BASE}/metrics`,

  // ── Legacy aliases ──────────────────────────────────────
  getSignals: (planId) => request(`/analysis/${planId}/pestel`),
  scanPESTEL: (planId) => request(`/analysis/${planId}/pestel/scan`, { method: 'POST' }),
  clearSignals: (planId) => request(`/analysis/${planId}/pestel`, { method: 'DELETE' }),

  // ══════════════════════════════════════════════════════════
  // PHASE 3: Observability Console
  // ══════════════════════════════════════════════════════════
  getSLODashboard: () => request('/ops/slo'),
  getStructuredLogs: (level = 'all', limit = 100) => request(`/ops/logs?level=${level}&limit=${limit}`),
  getPerformanceMetrics: () => request('/metrics'),

  // ══════════════════════════════════════════════════════════
  // PHASE 5: Tenant Admin Console
  // ══════════════════════════════════════════════════════════
  getTenantMembers: () => request('/tenant/members'),
  getSSOProviders: () => request('/auth/sso/providers'),
  getQuotaStatus: (tenantId = 1) => request(`/ops/ai-budget/${tenantId}`),
  getADRIndex: (search = '') => request(`/docs/adr/${search ? `?search=${search}` : ''}`),

  // ══════════════════════════════════════════════════════════
  // FASE 2: Strategic Intelligence Hub
  // ══════════════════════════════════════════════════════════
  getIntelligenceSummary: (instId, planId) => request(`/intelligence/${instId}/summary${planId ? `?plan_id=${planId}` : ''}`),
  getIntelligenceFreshness: (instId) => request(`/intelligence/${instId}/freshness`),
  getIntelligenceGaps: (instId, planId) => request(`/intelligence/${instId}/gaps${planId ? `?plan_id=${planId}` : ''}`),
  getIntelligenceRecommendations: (instId, planId) => request(`/intelligence/${instId}/recommendations${planId ? `?plan_id=${planId}` : ''}`),
  getComparativeIntelligence: (instId, v1, v2, planId) => request(`/intelligence/${instId}/compare?v1=${v1}&v2=${v2}${planId ? `&plan_id=${planId}` : ''}`),

  // ══════════════════════════════════════════════════════════
  // FASE 4: Strategic OS — Orchestrator
  // ══════════════════════════════════════════════════════════
  triggerStrategyCycle: (instId, planId) => request(`/orchestrator/${instId}/cycle${planId ? `?plan_id=${planId}` : ''}`, { method: 'POST' }),
  getCycleStatus: (instId, planId) => request(`/orchestrator/${instId}/status${planId ? `?plan_id=${planId}` : ''}`),
  getCycleHistory: (instId, limit = 20) => request(`/orchestrator/${instId}/history?limit=${limit}`),
  getPulseTrend: (instId, planId) => request(`/orchestrator/${instId}/pulse-trend${planId ? `?plan_id=${planId}` : ''}`),
  getDoctrineCompliance: (instId, planId) => request(`/orchestrator/${instId}/doctrine-compliance${planId ? `?plan_id=${planId}` : ''}`),
  getViolationReport: (instId, planId) => request(`/orchestrator/${instId}/violations${planId ? `?plan_id=${planId}` : ''}`),

  // ══════════════════════════════════════════════════════════
  // FASE 4: Strategic OS — Executive Dashboards
  // ══════════════════════════════════════════════════════════
  getExecutiveDashboard: (instId, role, planId) => request(`/executive/${instId}/${role}${planId ? `?plan_id=${planId}` : ''}`),
  getExecutiveOverview: (instId, planId) => request(`/executive/${instId}/overview${planId ? `?plan_id=${planId}` : ''}`),
  getCEODashboard: (instId, planId) => request(`/executive/${instId}/ceo${planId ? `?plan_id=${planId}` : ''}`),
  getCOODashboard: (instId, planId) => request(`/executive/${instId}/coo${planId ? `?plan_id=${planId}` : ''}`),
  getCFODashboard: (instId, planId) => request(`/executive/${instId}/cfo${planId ? `?plan_id=${planId}` : ''}`),
  getCRODashboard: (instId, planId) => request(`/executive/${instId}/cro${planId ? `?plan_id=${planId}` : ''}`)
};

export default api;
