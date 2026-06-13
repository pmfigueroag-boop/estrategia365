import { request, uploadFile, isAuthenticated, clearTokens, getAccessToken, resolveUrl, setTokens } from './apiClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = {
  // ── Institutions ────────────────────────────────────────
  getInstitutions: () => request('/institutions/'),
  getInstitution: (id: any) => request(`/institutions/${id}`),
  createInstitution: (data: any) => request('/institutions/', { method: 'POST', body: JSON.stringify(data) }),
  updateInstitution: (id: any, data: any) => request(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstitution: (id: any) => request(`/institutions/${id}`, { method: 'DELETE' }),
  getWorkspaceSummary: () => request('/institutions/workspace/summary'),

  // ── Documents ───────────────────────────────────────────
  uploadDocument: (institutionId: any, file: any, docType = 'general') => uploadFile(`/documents/${institutionId}/upload`, file, { doc_type: docType }),
  getDocuments: (institutionId: any) => request(`/documents/${institutionId}`),
  deleteDocument: (docId: any) => request(`/documents/${docId}`, { method: 'DELETE' }),
  getDocumentText: (institutionId: any) => request(`/documents/text/${institutionId}`),

  // ── Stakeholders ────────────────────────────────────────
  getStakeholders: (institutionId: any) => request(`/stakeholders/${institutionId}`),
  addStakeholder: (institutionId: any, data: any) => request(`/stakeholders/${institutionId}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteStakeholder: (stakeholderId: any) => request(`/stakeholders/${stakeholderId}`, { method: 'DELETE' }),

  // ── Governance (Horizonte 2) ────────────────────────────
  getGovernance: (institutionId: any) => request(`/governance/${institutionId}`),
  updateGovernance: (institutionId: any, data: any) => request(`/governance/${institutionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getOrgUnits: (institutionId: any) => request(`/governance/${institutionId}/units`),
  addOrgUnit: (institutionId: any, data: any) => request(`/governance/${institutionId}/units`, { method: 'POST', body: JSON.stringify(data) }),
  deleteOrgUnit: (unitId: any) => request(`/governance/units/${unitId}`, { method: 'DELETE' }),
  getCapabilities: (institutionId: any) => request(`/governance/${institutionId}/capabilities`),
  addCapability: (institutionId: any, data: any) => request(`/governance/${institutionId}/capabilities`, { method: 'POST', body: JSON.stringify(data) }),
  deleteCapability: (capId: any) => request(`/governance/capabilities/${capId}`, { method: 'DELETE' }),

  // ── Risk & Culture (Horizonte 2) ────────────────────────
  getKnownRisks: (institutionId: any) => request(`/risk-culture/${institutionId}/risks`),
  addKnownRisk: (institutionId: any, data: any) => request(`/risk-culture/${institutionId}/risks`, { method: 'POST', body: JSON.stringify(data) }),
  deleteKnownRisk: (riskId: any) => request(`/risk-culture/risks/${riskId}`, { method: 'DELETE' }),
  getCultureProfile: (institutionId: any) => request(`/risk-culture/${institutionId}/culture`),
  updateCultureProfile: (institutionId: any, data: any) => request(`/risk-culture/${institutionId}/culture`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Value Chain (Horizonte 3) ───────────────────────────
  getValueChain: (institutionId: any) => request(`/operations/${institutionId}/value-chain`),
  addValueChainActivity: (institutionId: any, data: any) => request(`/operations/${institutionId}/value-chain`, { method: 'POST', body: JSON.stringify(data) }),
  updateValueChainActivity: (activityId: any, data: any) => request(`/operations/value-chain/${activityId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteValueChainActivity: (activityId: any) => request(`/operations/value-chain/${activityId}`, { method: 'DELETE' }),

  // ── Dependencies (Horizonte 3) ──────────────────────────
  getDependencies: (institutionId: any) => request(`/operations/${institutionId}/dependencies`),
  addDependency: (institutionId: any, data: any) => request(`/operations/${institutionId}/dependencies`, { method: 'POST', body: JSON.stringify(data) }),
  deleteDependency: (depId: any) => request(`/operations/dependencies/${depId}`, { method: 'DELETE' }),

  // ── Tech Systems (Horizonte 3) ──────────────────────────
  getTechSystems: (institutionId: any) => request(`/operations/${institutionId}/tech-systems`),
  addTechSystem: (institutionId: any, data: any) => request(`/operations/${institutionId}/tech-systems`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTechSystem: (sysId: any) => request(`/operations/tech-systems/${sysId}`, { method: 'DELETE' }),

  // ── Digital Twin (Fase 3: Temporal) ───────────────────────
  getDigitalTwin: (institutionId: any) => request(`/twin/${institutionId}`),
  captureSnapshot: (institutionId: any, data: any = {}) => request(`/twin/${institutionId}/snapshot`, { method: 'POST', body: JSON.stringify(data) }),
  getSnapshots: (institutionId: any, limit = 20, offset = 0) => request(`/twin/${institutionId}/snapshots?limit=${limit}&offset=${offset}`),
  getSnapshotVersion: (institutionId: any, version: any) => request(`/twin/${institutionId}/snapshot/${version}`),
  compareSnapshots: (institutionId: any, v1: any, v2: any) => request(`/twin/${institutionId}/compare?v1=${v1}&v2=${v2}`),
  getTwinTimeline: (institutionId: any, days = 90) => request(`/twin/${institutionId}/timeline?days=${days}`),
  recordTwinMetric: (institutionId: any, data: any) => request(`/twin/${institutionId}/metrics`, { method: 'POST', body: JSON.stringify(data) }),
  getTwinMetricSeries: (institutionId: any, metricKey: any, fromDate?: any, toDate?: any) => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
    const qs = params.toString();
    return request(`/twin/${institutionId}/metrics/${metricKey}${qs ? '?' + qs : ''}`);
  },
  getTwinHealth: (institutionId: any) => request(`/twin/${institutionId}/health`),

  // ── Maturity (Horizonte 4) ──────────────────────────────
  getMaturityAssessment: (institutionId: any) => request(`/institutions/${institutionId}/maturity`),
  triggerMaturityAssessment: (institutionId: any) => request(`/institutions/${institutionId}/maturity/assess`, { method: 'POST' }),
  updateInstitutionTier: (institutionId: any, tier: any) => request(`/institutions/${institutionId}/tier`, { method: 'PATCH', body: JSON.stringify({ tier }) }),

  // ── Onboarding Progress ─────────────────────────────────
  getOnboardingProgress: () => request('/onboarding/progress'),
  updateOnboardingProgress: (data: any) => request('/onboarding/progress', { method: 'PUT', body: JSON.stringify(data) }),

  // ── Plans ───────────────────────────────────────────────
  createPlan: (institutionId: any, data: any) => request(`/plans/${institutionId}`, { method: 'POST', body: JSON.stringify(data) }),
  getPlans: (institutionId: any) => request(`/plans/${institutionId}`),
  getPlan: (planId: any) => request(`/plans/single/${planId}`),
  updatePlan: (planId: any, data: any) => request(`/plans/${planId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlan: (planId: any) => request(`/plans/${planId}`, { method: 'DELETE' }),
  extractFormulation: (institutionId: any) => request(`/plans/extract-from-docs/${institutionId}`, { method: 'POST' }),
  synthesizeFormulation: (planId: any) => request(`/plans/synthesize/${planId}`, { method: 'POST' }),

  // ── Analysis ────────────────────────────────────────────
  getPestel: (planId: any) => request(`/analysis/${planId}/pestel`),
  scanPestel: (planId: any) => request(`/analysis/${planId}/pestel/scan`, { method: 'POST' }),
  createPestel: (planId: any, data: any) => request(`/analysis/${planId}/pestel`, { method: 'POST', body: JSON.stringify(data) }),
  clearPestel: (planId: any) => request(`/analysis/${planId}/pestel`, { method: 'DELETE' }),
  getPorter: (planId: any) => request(`/analysis/${planId}/porter`),
  scanPorter: (planId: any) => request(`/analysis/${planId}/porter/scan`, { method: 'POST' }),
  createPorter: (planId: any, data: any) => request(`/analysis/${planId}/porter`, { method: 'POST', body: JSON.stringify(data) }),
  clearPorter: (planId: any) => request(`/analysis/${planId}/porter`, { method: 'DELETE' }),
  getPorterDeepAnalysis: (planId: any) => request(`/analysis/${planId}/porter/deep-analysis`),
  getSwot: (planId: any) => request(`/analysis/${planId}/swot`),
  generateSwot: (planId: any) => request(`/analysis/${planId}/swot/generate`, { method: 'POST' }),
  createSwot: (planId: any, data: any) => request(`/analysis/${planId}/swot`, { method: 'POST', body: JSON.stringify(data) }),
  clearSwot: (planId: any) => request(`/analysis/${planId}/swot`, { method: 'DELETE' }),
  getTows: (planId: any) => request(`/analysis/${planId}/tows`),
  generateTows: (planId: any) => request(`/analysis/${planId}/tows/generate`, { method: 'POST' }),
  clearTows: (planId: any) => request(`/analysis/${planId}/tows`, { method: 'DELETE' }),
  generateBlueOcean: (planId: any) => request(`/analysis/${planId}/blue-ocean`, { method: 'POST' }),
  generateBCG: (planId: any) => request(`/analysis/${planId}/bcg`, { method: 'POST' }),
  getVrio: (planId: any) => request(`/analysis/${planId}/vrio`),
  generateVrio: (planId: any) => request(`/analysis/${planId}/vrio/generate`, { method: 'POST' }),
  clearVrio: (planId: any) => request(`/analysis/${planId}/vrio`, { method: 'DELETE' }),
  getBlueOcean: (planId: any) => request(`/analysis/${planId}/blue-ocean`),
  getBCG: (planId: any) => request(`/analysis/${planId}/bcg`),
  getReadiness: (planId: any) => request(`/analysis/${planId}/readiness`),
  getQualityAudit: (planId: any) => request(`/analysis/${planId}/quality-audit`),
  getPestelDeepAnalysis: (planId: any) => request(`/analysis/${planId}/pestel/deep-analysis`),
  getPestelDrift: (planId: any) => request(`/analysis/${planId}/pestel/drift`),
  getPestelEarlyWarnings: (planId: any) => request(`/analysis/${planId}/pestel/early-warnings`),
  exportPestelCsv: (planId: any) => {
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
  generateKernel: (planId: any) => request(`/strategy/decide/${planId}`, { method: 'POST' }),
  getKernel: (planId: any) => request(`/strategy/kernel/${planId}`),
  getKernelHistory: (planId: any) => request(`/strategy/kernel/${planId}/history`),
  getKernelStatus: (planId: any) => request(`/strategy/kernel/${planId}/status`),
  updateDecisionStatus: (decisionId: any, payload: any) => request(`/strategy/decisions/${decisionId}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  signDecision: (decisionId: any, payload: any) => request(`/strategy/decisions/${decisionId}/sign`, { method: 'POST', body: JSON.stringify(payload) }),
  deployDecision: (decisionId: any) => request(`/strategy/decisions/${decisionId}/deploy`, { method: 'POST' }),
  getDecisionTraceability: (decisionId: any) => request(`/strategy/decisions/${decisionId}/traceability`),
  getStrategyAudit: (planId: any) => request(`/strategy/audit/${planId}`),
  generateCausal: (planId: any) => request(`/strategy/causal/${planId}`, { method: 'POST' }),
  getCausal: (planId: any) => request(`/strategy/causal/${planId}`),
  generateGraph: (planId: any) => request(`/strategy/graph/${planId}`, { method: 'POST' }),
  getGraph: (planId: any) => request(`/strategy/graph/${planId}`),
  generatePulse: (planId: any) => request(`/strategy/pulse/${planId}`, { method: 'POST' }),
  getPulses: (planId: any) => request(`/strategy/pulse/${planId}`),
  optimizePortfolio: (planId: any, constraints: any = {}) => {
    const params = new URLSearchParams();
    if (constraints.max_budget) params.set('max_budget', constraints.max_budget);
    if (constraints.max_people) params.set('max_people', constraints.max_people);
    if (constraints.max_months) params.set('max_months', constraints.max_months);
    const qs = params.toString();
    return request(`/strategy/optimize/${planId}${qs ? '?' + qs : ''}`, { method: 'POST' });
  },
  simulateScenarios: (planId: any) => request(`/strategy/simulate/${planId}`, { method: 'POST' }),

  // ── Execution (OKR/BSC/Strategy Map) ────────────────────
  getProgress: (planId: any) => request(`/execution/${planId}/progress`),
  getObjectives: (planId: any) => request(`/execution/${planId}/objectives`),
  createObjective: (planId: any, data: any) => request(`/execution/${planId}/objectives`, { method: 'POST', body: JSON.stringify(data) }),
  updateObjective: (objectiveId: any, data: any) => request(`/execution/objectives/${objectiveId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteObjective: (objectiveId: any) => request(`/execution/objectives/${objectiveId}`, { method: 'DELETE' }),
  createKeyResult: (objectiveId: any, data: any) => request(`/execution/objectives/${objectiveId}/kr`, { method: 'POST', body: JSON.stringify(data) }),
  updateKeyResult: (krId: any, data: any) => request(`/execution/kr/${krId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getKrProgress: (krId: any) => request(`/execution/kr/${krId}/progress`),
  getBsc: (planId: any) => request(`/execution/${planId}/bsc`),
  createBsc: (planId: any, data: any) => request(`/execution/${planId}/bsc`, { method: 'POST', body: JSON.stringify(data) }),
  updateBsc: (bscId: any, data: any) => request(`/execution/bsc/${bscId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBsc: (bscId: any) => request(`/execution/bsc/${bscId}`, { method: 'DELETE' }),
  synthesizeOkrs: (planId: any) => request(`/execution/${planId}/synthesize-okrs`, { method: 'POST' }),
  synthesizeBsc: (planId: any) => request(`/execution/${planId}/synthesize-bsc`, { method: 'POST' }),
  getStrategyMap: (planId: any) => request(`/execution/${planId}/strategy-map`),
  synthesizeStrategyMap: (planId: any) => request(`/execution/${planId}/synthesize-strategy-map`, { method: 'POST' }),
  getExecutionHealth: (planId: any) => request(`/execution/${planId}/execution-health`),
  getAdaptiveHealth: (planId: any) => request(`/execution/${planId}/adaptive-health`),
  getHumanGovernance: (planId: any) => request(`/execution/${planId}/human-governance`),
  hoshinDeploy: (planId: any, decisionId: any) => request(`/execution/${planId}/hoshin-deploy/${decisionId}`, { method: 'POST' }),

  // ── Alignment (7S) ─────────────────────────────────────
  getSevenS: (planId: any) => request(`/alignment/${planId}/7s`),
  saveSevenS: (planId: any, data: any) => request(`/alignment/${planId}/7s`, { method: 'POST', body: JSON.stringify(data) }),
  diagnoseSevenS: (planId: any) => request(`/alignment/${planId}/7s/diagnose`, { method: 'POST' }),
  clearSevenS: (planId: any) => request(`/alignment/${planId}/7s`, { method: 'DELETE' }),

  // ── Hoshin Kanri ────────────────────────────────────────
  getHoshinObjectives: (planId: any) => request(`/hoshin/${planId}/objectives`),
  createHoshinObjective: (planId: any, data: any) => request(`/hoshin/${planId}/objectives`, { method: 'POST', body: JSON.stringify(data) }),
  updateHoshinObjective: (objId: any, data: any) => request(`/hoshin/objectives/${objId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHoshinObjective: (objId: any) => request(`/hoshin/objectives/${objId}`, { method: 'DELETE' }),
  getXMatrix: (planId: any) => request(`/hoshin/${planId}/x-matrix`),
  synthesizeHoshin: (planId: any) => request(`/hoshin/${planId}/synthesize-hoshin`, { method: 'POST' }),
  getCatchball: (planId: any) => request(`/hoshin/${planId}/catchball`),
  createCatchball: (planId: any, data: any) => request(`/hoshin/${planId}/catchball`, { method: 'POST', body: JSON.stringify(data) }),
  getHoshinCascade: (planId: any) => request(`/hoshin/${planId}/cascade`),

  // ── Dashboard ───────────────────────────────────────────
  getDashboard: (planId: any) => request(`/dashboard/${planId}`),

  // ── Wargaming ───────────────────────────────────────────
  simulate: (planId: any, scenario: any) => request('/wargaming/simulate', { method: 'POST', body: JSON.stringify({ plan_id: planId, scenario }) }),
  runDevilsAdvocate: (planId: any) => request(`/wargaming/${planId}/devil-advocate`, { method: 'POST' }),
  getWargameSessions: (planId: any) => request(`/wargaming/sessions/${planId}`),
  getWargameSession: (planId: any, sessionId: any) => request(`/wargaming/sessions/${planId}/${sessionId}`),
  getSimulation: (simulationId: any) => request(`/wargaming/simulation/${simulationId}`),
  counterWargame: (payload: any) => request('/wargaming/counter', { method: 'POST', body: JSON.stringify(payload) }),

  // ── V3: Institutional Features ──────────────────────────
  getAuditTrail: (planId: any) => request(`/v3/${planId}/audit-trail`),
  getAuditExportUrl: (planId: any) => `${API_BASE}/v1/v3/${planId}/audit-export`,
  getEsvBenchmarks: (industry = 'default') => request(`/v3/benchmarks/esv?industry=${industry}`),
  getEsvComparison: (planId: any) => request(`/v3/benchmarks/esv/${planId}/comparison`),
  getPorterStrategy: (planId: any) => request(`/v3/${planId}/porter-strategy`),
  getBadStrategyDetector: (planId: any) => request(`/v3/${planId}/bad-strategy-detector`),
  getTenantIsolation: (institutionId: any) => request(`/v3/tenant/${institutionId}/isolation-check`),
  getSsoStatus: () => request('/v3/sso/status'),

  // ── V4: Advanced Optimization ───────────────────────────
  runMonteCarlo: (planId: any, iterations = 1000) => request(`/v4/${planId}/monte-carlo?iterations=${iterations}`),
  runBayesianUpdate: (planId: any) => request(`/v4/${planId}/bayesian-update`, { method: 'POST' }),
  getCausalValidation: (planId: any) => request(`/v4/${planId}/causal-validation`),
  extractEntities: (planId: any) => request(`/v4/${planId}/extract-entities`, { method: 'POST' }),
  getAbTests: () => request('/v4/ab-tests'),
  getAbTestDetail: (module: any) => request(`/v4/ab-tests/${module}`),
  getI18n: () => request('/v4/i18n'),
  getI18nLang: (lang: any) => request(`/v4/i18n/${lang}`),
  getInstitutionalExportUrl: (planId: any, format: any) => `${API_BASE}/v1/v4/${planId}/export/${format}`,

  // ── Auth ────────────────────────────────────────────────
  login: async (email: any, password: any) => {
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
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  recoverPassword: (email: any) => request('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: any, new_password: any) => request('/auth/reset', { method: 'POST', body: JSON.stringify({ token, new_password }) }),
  getMe: () => request('/auth/me'),
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch { /* best effort */ }
    clearTokens();
  },
  refreshToken: (token: any) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }),
  getUsers: () => request('/auth/users'),
  getMyTenants: () => request('/auth/me/tenants'),
  switchTenant: async (tenantId: any) => {
    const data = await request('/auth/switch-tenant', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) });
    if ((data as any).access_token) {
      setTokens((data as any).access_token, (data as any).refresh_token);
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
  getSignals: (planId: any) => request(`/analysis/${planId}/pestel`),
  scanPESTEL: (planId: any) => request(`/analysis/${planId}/pestel/scan`, { method: 'POST' }),
  clearSignals: (planId: any) => request(`/analysis/${planId}/pestel`, { method: 'DELETE' }),

  // ══════════════════════════════════════════════════════════
  // PHASE 3: AI Governance Dashboard
  // ══════════════════════════════════════════════════════════
  getAIBudget: (tenantId: any) => request(`/ai-governance/budget/${tenantId}`),
  getAIMaturity: (tenantId: any) => request(`/ai-governance/maturity/${tenantId}`),
  getTelemetryStats: (planId: any) => request(`/ai-governance/${planId}/telemetry/stats`),
  getReasoningHistory: (planId: any, limit = 20) => request(`/ai-governance/${planId}/reasoning-history?limit=${limit}`),
  getDriftReport: (planId: any) => request(`/ai-governance/${planId}/drift-report`),
  getConfidenceTrend: (planId: any, days = 30) => request(`/ai-governance/${planId}/confidence-trend?days=${days}`),

  // ══════════════════════════════════════════════════════════
  // PHASE 3: Observability Console
  // ══════════════════════════════════════════════════════════
  getSLODashboard: () => request('/ops/slo'),
  getStructuredLogs: (level = 'all', limit = 100) => request(`/ops/logs?level=${level}&limit=${limit}`),
  getPerformanceMetrics: () => request('/metrics'),

  // ══════════════════════════════════════════════════════════
  // PHASE 3: Compliance Viewer
  // ══════════════════════════════════════════════════════════
  getSOC2Matrix: () => request('/compliance/soc2'),
  getRiskRegister: () => request('/compliance/status'),
  getDoctrineRules: () => request('/compliance/soc2'),

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
  getIntelligenceSummary: (instId: any, planId: any) => request(`/intelligence/${instId}/summary${planId ? `?plan_id=${planId}` : ''}`),
  getIntelligenceFreshness: (instId: any) => request(`/intelligence/${instId}/freshness`),
  getIntelligenceGaps: (instId: any, planId: any) => request(`/intelligence/${instId}/gaps${planId ? `?plan_id=${planId}` : ''}`),
  getIntelligenceRecommendations: (instId: any, planId: any) => request(`/intelligence/${instId}/recommendations${planId ? `?plan_id=${planId}` : ''}`),
  getComparativeIntelligence: (instId: any, v1: any, v2: any, planId: any) => request(`/intelligence/${instId}/compare?v1=${v1}&v2=${v2}${planId ? `&plan_id=${planId}` : ''}`),

  // ══════════════════════════════════════════════════════════
  // FASE 4: Strategic OS — Orchestrator
  // ══════════════════════════════════════════════════════════
  triggerStrategyCycle: (instId: any, planId: any) => request(`/orchestrator/${instId}/cycle${planId ? `?plan_id=${planId}` : ''}`, { method: 'POST' }),
  getCycleStatus: (instId: any, planId: any) => request(`/orchestrator/${instId}/status${planId ? `?plan_id=${planId}` : ''}`),
  getCycleHistory: (instId: any, limit = 20) => request(`/orchestrator/${instId}/history?limit=${limit}`),
  getPulseTrend: (instId: any, planId: any) => request(`/orchestrator/${instId}/pulse-trend${planId ? `?plan_id=${planId}` : ''}`),
  getDoctrineCompliance: (instId: any, planId: any) => request(`/orchestrator/${instId}/doctrine-compliance${planId ? `?plan_id=${planId}` : ''}`),
  getViolationReport: (instId: any, planId: any) => request(`/orchestrator/${instId}/violations${planId ? `?plan_id=${planId}` : ''}`),

  // ══════════════════════════════════════════════════════════
  // FASE 4: Strategic OS — Executive Dashboards
  // ══════════════════════════════════════════════════════════
  getExecutiveDashboard: (instId: any, role: any, planId: any) => request(`/executive/${instId}/${role}${planId ? `?plan_id=${planId}` : ''}`),
  getExecutiveOverview: (instId: any, planId: any) => request(`/executive/${instId}/overview${planId ? `?plan_id=${planId}` : ''}`),
  getCEODashboard: (instId: any, planId: any) => request(`/executive/${instId}/ceo${planId ? `?plan_id=${planId}` : ''}`),
  getCOODashboard: (instId: any, planId: any) => request(`/executive/${instId}/coo${planId ? `?plan_id=${planId}` : ''}`),
  getCFODashboard: (instId: any, planId: any) => request(`/executive/${instId}/cfo${planId ? `?plan_id=${planId}` : ''}`),
  getCRODashboard: (instId: any, planId: any) => request(`/executive/${instId}/cro${planId ? `?plan_id=${planId}` : ''}`)
};

export default api;
