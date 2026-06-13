import { test, expect } from '@playwright/test';

test.describe('Dashboard Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/dashboard/plan-123', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          plan_id: 'plan-123',
          mission: 'Ser líderes del mercado',
          has_kernel: true,
          has_pulse: true,
          audit_chain_valid: true,
          kernel_confidence: 0.80,
          kernel_diagnosis: 'Todo en orden',
          pulse_overall: 70,
          pulse_phase: 'execute',
          pulse_execution_health: 60,
          pulse_alignment: 80,
          pulse_adaptability: 90,
          pulse_drift_count: 0,
          total_decisions: 5,
          decisions_approved_pct: 80,
          capability_gaps_count: 0,
          risk_nodes_count: 0,
          causal_chains_count: 2,
          total_objectives: 5,
          avg_kr_progress: 40,
          pestel_signal_count: 2,
          red_team_attacks: 0,
          porter_avg_score: 4,
          swot_counts: { strength: 1, weakness: 1, opportunity: 1, threat: 1 },
          bsc_avg_progress: 50,
          bsc_perspectives_count: 8,
          seven_s_avg_score: 3.8,
          seven_s_completed: true,
          objectives_by_status: { in_progress: 5 },
          top_risks: []
        }) 
      });
    });

    // Intercept Monte Carlo
    await page.route('**/v1/v4/plan-123/monte-carlo*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ portfolio: { mean: '+10.5%', VaR_95: '-3.2%', std: '1.5%' }, risk_assessment: 'LOW_VARIANCE' }) });
    });

    // Intercept Bayesian Update
    await page.route('**/v1/v4/plan-123/bayesian-update', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ new_confidence: 0.95 }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123'); // auto-select
    });
  });

  test('should load dashboard and simulate Monte Carlo and Bayesian', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check main title
    await expect(page.getByRole('heading', { name: /Command Center/i })).toBeVisible();

    // Run Monte Carlo
    await page.getByRole('button', { name: /Ejecutar Simulación/i }).click();
    await expect(page.getByText('Simulación Monte Carlo completada (1000 iteraciones).')).toBeVisible({ timeout: 10000 });
    // Check outputs
    await expect(page.getByText('+10.5%')).toBeVisible();
    await expect(page.getByText('-3.2%')).toBeVisible();
    
    // Run Bayesian Update
    await page.getByRole('button', { name: /Recalibrar con Evidencia/i }).click();
    await expect(page.getByText('Confianza recalibrada por empirismo: 95%')).toBeVisible({ timeout: 10000 });
    // UI updates to 95%
    await expect(page.getByText('95%').first()).toBeVisible();
  });
});
