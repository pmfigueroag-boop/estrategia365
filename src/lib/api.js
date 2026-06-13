/**
 * Estrategia 365 — Centralized API Client
 * ==========================================
 * Full-parity client covering all backend endpoints.
 * Includes JWT authentication with automatic token refresh.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Routes mounted at root level (no /v1 prefix)
const ROOT_PREFIXES = ['/auth', '/health', '/ready', '/metrics', '/docs'];
function resolveUrl(path) {
  const isRootRoute = ROOT_PREFIXES.some(p => path.startsWith(p));
  return isRootRoute ? `${API_BASE}${path}` : `${API_BASE}/v1${path}`;
}

// ── Token Management ──────────────────────────────────────────
const TOKEN_KEY = 'e365_access_token';
const REFRESH_KEY = 'e365_refresh_token';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(access, refresh) {
  if (typeof window === 'undefined') return;
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function isAuthenticated() {
  return !!getAccessToken();
}

// ── Auth Headers ──────────────────────────────────────────────
function getAuthHeaders() {
  const token = getAccessToken();
  const csrf = typeof window !== 'undefined' ? localStorage.getItem('e365_csrf_token') : null;
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  if (csrf) headers['x-csrf-token'] = csrf;
  return headers;
}

// Flag to prevent concurrent refresh attempts
let _refreshPromise = null;

async function tryRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return false;
  }
  // Deduplicate concurrent refresh calls
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const res = await fetch(resolveUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ refresh_token: refresh }),
        credentials: 'include',
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const csrfToken = res.headers.get('x-csrf-token');
      if (csrfToken && typeof window !== 'undefined') {
        localStorage.setItem('e365_csrf_token', csrfToken);
      }
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

// ── Core Request Function ─────────────────────────────────────
async function request(path, options = {}) {
  const url = resolveUrl(path);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };
  let res = await fetch(url, config);
  
  const csrfToken = res.headers.get('x-csrf-token');
  if (csrfToken && typeof window !== 'undefined') {
    localStorage.setItem('e365_csrf_token', csrfToken);
  }

  // Auto-refresh on 401 and retry once
  if (res.status === 401 && !options._retried) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      config.headers = { ...config.headers, ...getAuthHeaders() };
      config._retried = true;
      res = await fetch(url, config);
      const newCsrf = res.headers.get('x-csrf-token');
      if (newCsrf && typeof window !== 'undefined') localStorage.setItem('e365_csrf_token', newCsrf);
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData.detail || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function uploadFile(path, file, extraFields = {}) {
  const url = resolveUrl(path);
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));
  const headers = getAuthHeaders(); // No Content-Type for FormData
  let res = await fetch(url, { method: 'POST', body: formData, headers, credentials: 'include' });

  // Auto-refresh on 401 and retry once
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await fetch(url, { method: 'POST', body: formData, headers: getAuthHeaders(), credentials: 'include' });
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Error ${res.status}`);
  }
  return res.json();
}

const api = {
  // ── Institutions ────────────────────────────────────────
  getInstitutions: () => request('/institutions/'),
  getInstitution: (id) => request(`/institutions/${id}`),
  createInstitution: (data) => request('/institutions/', { method: 'POST', body: JSON.stringify(data) }),
  updateInstitution: (id, data) => request(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstitution: (id) => request(`/institutions/${id}`, { method: 'DELETE' }),
  getWorkspaceSummary: () => request('/institutions/workspace/summary'),

  // ── Documents ───────────────────────────────────────────
  uploadDocument: (institutionId, file, docType = 'general') => uploadFile(`/documents/${institutionId}/upload`, file, { doc_type: docType }),
  getDocuments: (institutionId) => request(`/documents/${institutionId}`),
  deleteDocument: (docId) => request(`/documents/${docId}`, { method: 'DELETE' }),
  getDocumentText: (institutionId) => request(`/documents/text/${institutionId}`),

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

  // ── Digital Twin (Fase 3: Temporal) ───────────────────────
  getDigitalTwin: (institutionId) => request(`/twin/${institutionId}`),
  captureSnapshot: (institutionId, data = {}) => request(`/twin/${institutionId}/snapshot`, { method: 'POST', body: JSON.stringify(data) }),
  getSnapshots: (institutionId, limit = 20, offset = 0) => request(`/twin/${institutionId}/snapshots?limit=${limit}&offset=${offset}`),
  getSnapshotVersion: (institutionId, version) => request(`/twin/${institutionId}/snapshot/${version}`),
  compareSnapshots: (institutionId, v1, v2) => request(`/twin/${institutionId}/compare?v1=${v1}&v2=${v2}`),
  getTwinTimeline: (institutionId, days = 90) => request(`/twin/${institutionId}/timeline?days=${days}`),
  recordTwinMetric: (institutionId, data) => request(`/twin/${institutionId}/metrics`, { method: 'POST', body: JSON.stringify(data) }),
  getTwinMetricSeries: (institutionId, metricKey, fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
    const qs = params.toString();
    return request(`/twin/${institutionId}/metrics/${metricKey}${qs ? '?' + qs : ''}`);
  },
  getTwinHealth: (institutionId) => request(`/twin/${institutionId}/health`),

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
  // Phase 2: Temporal Intelligence
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
  optimizePortfolio: (planId, constraints = {}) => {
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

  // ── Wargaming ───────────────────────────────────────────
  simulate: (planId, scenario) => request('/wargaming/simulate', { method: 'POST', body: JSON.stringify({ plan_id: planId, scenario }) }),
  runDevilsAdvocate: (planId) => request(`/wargaming/${planId}/devil-advocate`, { method: 'POST' }),
  getWargameSessions: (planId) => request(`/wargaming/sessions/${planId}`),
  getWargameSession: (planId, sessionId) => request(`/wargaming/sessions/${planId}/${sessionId}`),
  getSimulation: (simulationId) => request(`/wargaming/simulation/${simulationId}`),
  counterWargame: (payload) => request('/wargaming/counter', { method: 'POST', body: JSON.stringify(payload) }),

  // ── V3: Institutional Features ──────────────────────────
  getAuditTrail: (planId) => request(`/v3/${planId}/audit-trail`),
  getAuditExportUrl: (planId) => `${API_BASE}/v1/v3/${planId}/audit-export`,
  getEsvBenchmarks: (industry = 'default') => request(`/v3/benchmarks/esv?industry=${industry}`),
  getEsvComparison: (planId) => request(`/v3/benchmarks/esv/${planId}/comparison`),
  getPorterStrategy: (planId) => request(`/v3/${planId}/porter-strategy`),
  getBadStrategyDetector: (planId) => request(`/v3/${planId}/bad-strategy-detector`),
  getTenantIsolation: (institutionId) => request(`/v3/tenant/${institutionId}/isolation-check`),
  getSsoStatus: () => request('/v3/sso/status'),

  // ── V4: Advanced Optimization ───────────────────────────
  runMonteCarlo: (planId, iterations = 1000) => request(`/v4/${planId}/monte-carlo?iterations=${iterations}`),
  runBayesianUpdate: (planId) => request(`/v4/${planId}/bayesian-update`, { method: 'POST' }),
  getCausalValidation: (planId) => request(`/v4/${planId}/causal-validation`),
  extractEntities: (planId) => request(`/v4/${planId}/extract-entities`, { method: 'POST' }),
  getAbTests: () => request('/v4/ab-tests'),
  getAbTestDetail: (module) => request(`/v4/ab-tests/${module}`),
  getI18n: () => request('/v4/i18n'),
  getI18nLang: (lang) => request(`/v4/i18n/${lang}`),
  getInstitutionalExportUrl: (planId, format) => `${API_BASE}/v1/v4/${planId}/export/${format}`,

  // ── Auth ────────────────────────────────────────────────
  login: async (email, password) => {
    // OAuth2PasswordRequestForm requires form-encoded data
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
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refresh }) });
      } catch { /* best effort */ }
    }
    clearTokens();
  },
  refreshToken: (token) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }),
  getUsers: () => request('/auth/users'),

  // ── Auth Utilities ──────────────────────────────────────
  getMyTenants: () => request('/auth/me/tenants'),
  switchTenant: async (tenantId) => {
    const data = await request('/auth/switch-tenant', { method: 'POST', body: JSON.stringify({ tenant_id: tenantId }) });
    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token);
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
  // PHASE 3: AI Governance Dashboard
  // ══════════════════════════════════════════════════════════
  getAIBudget: (tenantId) => request(`/ai-governance/budget/${tenantId}`),
  getAIMaturity: (tenantId) => request(`/ai-governance/maturity/${tenantId}`),
  getTelemetryStats: (planId) => request(`/ai-governance/${planId}/telemetry/stats`),
  getReasoningHistory: (planId, limit = 20) => request(`/ai-governance/${planId}/reasoning-history?limit=${limit}`),
  getDriftReport: (planId) => request(`/ai-governance/${planId}/drift-report`),
  getConfidenceTrend: (planId, days = 30) => request(`/ai-governance/${planId}/confidence-trend?days=${days}`),

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
  // QW-5 (Audit): Renamed from duplicate `getUsers` to avoid shadowing auth endpoint
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
  getCRODashboard: (instId, planId) => request(`/executive/${instId}/cro${planId ? `?plan_id=${planId}` : ''}`),
};

export default api;

