/**
 * onboardingService — Centralized API layer for Onboarding
 * ==========================================================
 * Extracts all API interactions from page.js into a testable,
 * reusable service. Zero UI awareness.
 */
import api from '@/lib/api';

// ── Constants ────────────────────────────────────────────
const FORM_DEFAULTS = {
  name: '', sector: 'private', industry: '', size: '',
  geography: '', country: '', international_presence: '',
  employees: 0, annual_revenue: '',
  annual_revenue_amount: 0, annual_revenue_currency: 'USD',
  mission: '', vision: '', values: '',
  products_services: '', market_position: '',
  description: '', competitive_context: '',
};

const METRICS_DEFAULTS = {
  strategic_budget: 0, strategic_budget_currency: 'USD',
  time_horizon_months: 36, kpis: [],
};

// ── Mappers ──────────────────────────────────────────────

/** Map an institution API response → form values */
function mapInstitutionToForm(inst) {
  if (!inst) return FORM_DEFAULTS;
  return {
    name: inst.name || '',
    sector: inst.sector || 'private',
    industry: inst.industry || '',
    size: inst.size || '',
    geography: inst.geography || '',
    country: inst.country || '',
    international_presence: inst.international_presence || '',
    employees: inst.employees || 0,
    annual_revenue: inst.annual_revenue || '',
    annual_revenue_amount: inst.annual_revenue_amount || 0,
    annual_revenue_currency: inst.annual_revenue_currency || 'USD',
    mission: inst.mission || '',
    vision: inst.vision || '',
    values: inst.values || '',
    products_services: inst.products_services || '',
    market_position: inst.market_position || '',
    description: inst.description || '',
    competitive_context: inst.competitive_context || '',
  };
}

/** Extract metrics from institution response */
function mapInstitutionToMetrics(inst) {
  if (!inst) return METRICS_DEFAULTS;
  let kpis = [];
  try { kpis = JSON.parse(inst.baseline_kpis || '[]'); } catch { /* ignore */ }
  return {
    strategic_budget: inst.strategic_budget || 0,
    strategic_budget_currency: inst.strategic_budget_currency || 'USD',
    time_horizon_months: inst.time_horizon_months || 36,
    kpis,
  };
}

// ── Loaders ──────────────────────────────────────────────

/** Load all H2 (Governance) data for an institution */
async function loadH2Data(instId) {
  const [governance, orgUnits, capabilities, knownRisks, cultureProfile] =
    await Promise.allSettled([
      api.getGovernance(instId),
      api.getOrgUnits(instId),
      api.getCapabilities(instId),
      api.getKnownRisks(instId),
      api.getCultureProfile(instId),
    ]);
  return {
    governance: governance.status === 'fulfilled' ? governance.value : null,
    orgUnits: orgUnits.status === 'fulfilled' ? orgUnits.value : [],
    capabilities: capabilities.status === 'fulfilled' ? capabilities.value : [],
    knownRisks: knownRisks.status === 'fulfilled' ? knownRisks.value : [],
    cultureProfile: cultureProfile.status === 'fulfilled' ? cultureProfile.value : null,
  };
}

/** Load all H3 (Operations) data for an institution */
async function loadH3Data(instId) {
  const [valueChain, deps, techSys, inst] = await Promise.allSettled([
    api.getValueChain(instId),
    api.getDependencies(instId),
    api.getTechSystems(instId),
    api.getInstitution(instId),
  ]);
  return {
    valueChain: valueChain.status === 'fulfilled' ? valueChain.value : [],
    dependencies: deps.status === 'fulfilled' ? deps.value : [],
    techSystems: techSys.status === 'fulfilled' ? techSys.value : [],
    metrics: inst.status === 'fulfilled' ? mapInstitutionToMetrics(inst.value) : METRICS_DEFAULTS,
    tier: inst.status === 'fulfilled' ? (inst.value?.tier || 'free') : 'free',
  };
}

/** Load ancillary data (docs, stakeholders) */
async function loadAncillaryData(instId) {
  const [docs, stake] = await Promise.allSettled([
    api.getDocuments(instId),
    api.getStakeholders(instId),
  ]);
  return {
    documents: docs.status === 'fulfilled' ? docs.value : [],
    stakeholders: stake.status === 'fulfilled' ? stake.value : [],
  };
}

/**
 * loadFullProgress — Master loader: restores entire onboarding state.
 * Returns { formValues, step, institutionId, ...entityData } or null.
 */
async function loadFullProgress() {
  // Try API first
  try {
    const progress = await api.getOnboardingProgress();
    const result = {
      step: progress.current_step || 1,
      institutionId: progress.institution_id || null,
      formValues: FORM_DEFAULTS,
      // Entity data
      governance: null, orgUnits: [], capabilities: [],
      knownRisks: [], cultureProfile: null,
      valueChain: [], dependencies: [], techSystems: [],
      metrics: METRICS_DEFAULTS, tier: 'free',
      documents: [], stakeholders: [],
    };

    if (result.institutionId) {
      // Load institution form data
      const inst = await api.getInstitution(result.institutionId).catch(() => null);
      result.formValues = mapInstitutionToForm(inst);

      // Overlay saved form_data if present
      if (progress.form_data && progress.form_data !== '{}') {
        try {
          const saved = JSON.parse(progress.form_data);
          result.formValues = { ...result.formValues, ...saved };
        } catch { /* ignore */ }
      }

      // Load all entity data in parallel
      const [h2, h3, ancillary] = await Promise.all([
        loadH2Data(result.institutionId),
        loadH3Data(result.institutionId),
        loadAncillaryData(result.institutionId),
      ]);

      Object.assign(result, h2, h3, ancillary);
      localStorage.setItem('current_institution_id', result.institutionId);
    }

    return result;
  } catch {
    // Fallback: localStorage
    const instId = localStorage.getItem('current_institution_id');
    if (!instId) return null;

    const result = {
      step: 1, institutionId: instId,
      formValues: FORM_DEFAULTS,
      governance: null, orgUnits: [], capabilities: [],
      knownRisks: [], cultureProfile: null,
      valueChain: [], dependencies: [], techSystems: [],
      metrics: METRICS_DEFAULTS, tier: 'free',
      documents: [], stakeholders: [],
    };

    const inst = await api.getInstitution(instId).catch(() => null);
    result.formValues = mapInstitutionToForm(inst);

    const [h2, h3, ancillary] = await Promise.all([
      loadH2Data(instId), loadH3Data(instId), loadAncillaryData(instId),
    ]);
    Object.assign(result, h2, h3, ancillary);

    return result;
  }
}

// ── Mutations ────────────────────────────────────────────

/** Create or update the institution profile */
async function saveInstitutionProfile(institutionId, formData) {
  let inst;
  if (institutionId) {
    inst = await api.updateInstitution(institutionId, formData);
  } else {
    try {
      inst = await api.createInstitution({ name: formData.name, sector: formData.sector });
    } catch (e) {
      // Fallback: If name already exists, try to find it and update it
      if (e.message && e.message.toLowerCase().includes('exist')) {
        const allInst = await api.getInstitutions().catch(() => []);
        const existing = allInst.find(i => i.name.toLowerCase() === formData.name.toLowerCase());
        if (existing) {
          inst = existing;
        } else {
          throw e; // Couldn't find it, rethrow original error
        }
      } else {
        throw e;
      }
    }
    await api.updateInstitution(inst.id, formData);
  }
  localStorage.setItem('current_institution_id', inst.id);
  return inst;
}

/** Create a strategic plan */
async function createPlan(institutionId, { paradigmId, mission, vision }) {
  const plan = await api.createPlan(institutionId, {
    paradigm_id: paradigmId,
    mission: mission || '',
    vision: vision || '',
    where_to_play: '', how_to_win: '',
    capabilities: '', management_systems: '',
    objectives: [],
  });
  localStorage.setItem('current_plan_id', plan.id);
  return plan;
}

/** Fire-and-forget progress sync */
function syncProgress(updates) {
  api.updateOnboardingProgress(updates).catch(() => {});
}

// ── Exports ──────────────────────────────────────────────
const onboardingService = {
  FORM_DEFAULTS,
  METRICS_DEFAULTS,
  mapInstitutionToForm,
  loadFullProgress,
  loadH2Data,
  loadH3Data,
  saveInstitutionProfile,
  createPlan,
  syncProgress,
};

export default onboardingService;
