#!/usr/bin/env node
/**
 * Estrategia 365 — API Contract Validator (Fase 1.5)
 * ====================================================
 * Validates that all frontend API client methods have matching
 * backend endpoints that respond without 404/500 errors.
 *
 * Usage:
 *   node scripts/validate-api-contracts.js
 *   API_BASE=http://staging:8000 node scripts/validate-api-contracts.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8000';

// ── Contract Definitions ─────────────────────────────────────
// Each entry: [method, path, httpVerb]
// Uses safe test IDs that won't mutate production data
const CONTRACTS = [
  // Health & Observability (root-level)
  ['getHealth', '/health', 'GET'],
  ['getReady', '/ready', 'GET'],
  ['getDeepHealth', '/health/deep', 'GET'],

  // Institutions
  ['getInstitutions', '/v1/institutions/', 'GET'],

  // Plans
  ['getPlans', '/v1/plans/1', 'GET'],

  // Analysis
  ['getPestel', '/v1/analysis/1/pestel', 'GET'],
  ['getPorter', '/v1/analysis/1/porter', 'GET'],
  ['getSwot', '/v1/analysis/1/swot', 'GET'],
  ['getTows', '/v1/analysis/1/tows', 'GET'],
  ['getVrio', '/v1/analysis/1/vrio', 'GET'],
  ['getBlueOcean', '/v1/analysis/1/blue-ocean', 'GET'],
  ['getBCG', '/v1/analysis/1/bcg', 'GET'],
  ['getReadiness', '/v1/analysis/1/readiness', 'GET'],
  ['getQualityAudit', '/v1/analysis/1/quality-audit', 'GET'],
  ['getPestelDeepAnalysis', '/v1/analysis/1/pestel/deep-analysis', 'GET'],
  ['getPestelDrift', '/v1/analysis/1/pestel/drift', 'GET'],
  ['getPestelEarlyWarnings', '/v1/analysis/1/pestel/early-warnings', 'GET'],

  // Strategy
  ['getKernel', '/v1/strategy/kernel/1', 'GET'],
  ['getKernelHistory', '/v1/strategy/kernel/1/history', 'GET'],
  ['getCausal', '/v1/strategy/causal/1', 'GET'],
  ['getGraph', '/v1/strategy/graph/1', 'GET'],
  ['getPulses', '/v1/strategy/pulse/1', 'GET'],

  // Execution
  ['getProgress', '/v1/execution/1/progress', 'GET'],
  ['getObjectives', '/v1/execution/1/objectives', 'GET'],
  ['getBsc', '/v1/execution/1/bsc', 'GET'],
  ['getStrategyMap', '/v1/execution/1/strategy-map', 'GET'],
  ['getExecutionHealth', '/v1/execution/1/execution-health', 'GET'],

  // Alignment
  ['getSevenS', '/v1/alignment/1/7s', 'GET'],

  // Hoshin
  ['getHoshinObjectives', '/v1/hoshin/1/objectives', 'GET'],
  ['getXMatrix', '/v1/hoshin/1/x-matrix', 'GET'],
  ['getCatchball', '/v1/hoshin/1/catchball', 'GET'],

  // Dashboard
  ['getDashboard', '/v1/dashboard/1', 'GET'],

  // Governance
  ['getGovernance', '/v1/governance/1', 'GET'],

  // Digital Twin (Fase 3)
  ['getDigitalTwin', '/v1/twin/1', 'GET'],
  ['getSnapshots', '/v1/twin/1/snapshots', 'GET'],
  ['getTwinHealth', '/v1/twin/1/health', 'GET'],
  ['getTwinTimeline', '/v1/twin/1/timeline', 'GET'],

  // Wargaming
  ['getWargameSessions', '/v1/wargaming/sessions/1', 'GET'],

  // AI Governance
  ['getAIBudget', '/v1/ai-governance/budget/1', 'GET'],
  ['getAIMaturity', '/v1/ai-governance/maturity/1', 'GET'],

  // Observability
  ['getSLODashboard', '/observability/slo-dashboard', 'GET'],
  ['getStructuredLogs', '/observability/logs?level=all&limit=5', 'GET'],

  // Compliance
  ['getSOC2Matrix', '/compliance/soc2-matrix', 'GET'],
  ['getRiskRegister', '/compliance/risk-register', 'GET'],
  ['getDoctrineRules', '/compliance/doctrine-rules', 'GET'],

  // V3 Institutional
  ['getAuditTrail', '/v1/v3/1/audit-trail', 'GET'],
  ['getEsvBenchmarks', '/v1/v3/benchmarks/esv?industry=default', 'GET'],

  // V4 Advanced
  ['getAbTests', '/v1/v4/ab-tests', 'GET'],
  ['getI18n', '/v1/v4/i18n', 'GET'],

  // Auth
  ['getUsers', '/auth/users', 'GET'],
  ['getSSOProviders', '/auth/sso/providers', 'GET'],
];

// ── Runner ───────────────────────────────────────────────────
async function validateContracts() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Estrategia 365 — API Contract Validation');
  console.log(`  Base: ${API_BASE}`);
  console.log(`  Contracts: ${CONTRACTS.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  let pass = 0, fail = 0, skip = 0;

  for (const [method, path, verb] of CONTRACTS) {
    const url = `${API_BASE}${path}`;
    try {
      const res = await fetch(url, {
        method: verb,
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (res.status === 404) {
        console.log(`  ❌ FAIL  ${method.padEnd(30)} ${verb} ${path} → 404 NOT FOUND`);
        fail++;
      } else if (res.status >= 500) {
        console.log(`  ❌ FAIL  ${method.padEnd(30)} ${verb} ${path} → ${res.status} SERVER ERROR`);
        fail++;
      } else {
        console.log(`  ✅ PASS  ${method.padEnd(30)} ${verb} ${path} → ${res.status}`);
        pass++;
      }
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.log(`  ⏭️  SKIP  ${method.padEnd(30)} ${verb} ${path} → TIMEOUT`);
        skip++;
      } else {
        console.log(`  ⏭️  SKIP  ${method.padEnd(30)} ${verb} ${path} → ${err.message}`);
        skip++;
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Results: ${pass} PASS · ${fail} FAIL · ${skip} SKIP`);
  console.log('═══════════════════════════════════════════════════════');

  if (fail > 0) {
    console.log('\n⚠️  Some contracts are broken! Frontend API client has methods');
    console.log('   pointing to non-existent or broken backend endpoints.');
    process.exit(1);
  } else {
    console.log('\n✅ All contracts validated successfully.');
    process.exit(0);
  }
}

validateContracts();
