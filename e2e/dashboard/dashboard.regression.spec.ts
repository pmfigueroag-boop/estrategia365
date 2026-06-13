import { test, expect } from '@playwright/test';

test.describe('Dashboard Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // SUPER PAYLOAD - All alerts and metrics enabled
    const superPayload = {
      plan_id: 'plan-999',
      mission: 'Transformación digital y dominio del mercado latinoamericano con tecnología cuántica. (Test Misión muy larga para ver wrapping)',
      has_kernel: true,
      has_pulse: true,
      audit_chain_valid: false, // Triggers CRITICAL AUDIT ALERT
      audit_chain_errors: 'Manipulación detectada en bloque #4092. Hash mismatch provocado por atacante interno.',
      kernel_confidence: 0.35, // Low confidence
      kernel_diagnosis: 'Alta incertidumbre en el encaje producto-mercado. Señales contradictorias.',
      pulse_overall: 45, // Warning range
      pulse_phase: 'analyze',
      pulse_execution_health: 30, // Danger range
      pulse_alignment: 80,
      pulse_adaptability: 25,
      pulse_drift_count: 5, // Warning Count
      total_decisions: 142,
      decisions_approved_pct: 35, // Warning %
      capability_gaps_count: 12,
      risk_nodes_count: 8,
      causal_chains_count: 24,
      total_objectives: 34,
      avg_kr_progress: 75, // Success
      pestel_signal_count: 14,
      red_team_attacks: 5, // Triggers Red Team Attack UI instead of Porter
      red_team_critical_vulnerabilities: 3,
      porter_avg_score: 2.1,
      swot_counts: { strength: 12, weakness: 20, opportunity: 5, threat: 30 },
      bsc_avg_progress: 42,
      bsc_perspectives_count: 16,
      seven_s_avg_score: 2.5, // Danger
      seven_s_completed: false, // Pendiente
      integrity_warnings: [
        'Señal PESTEL crítica ignorada por 30 días.',
        'Antonimia estratégica detectada entre Objetivo A y B.'
      ],
      objectives_by_status: { formulated: 10, in_progress: 14, completed: 5, blocked: 5 },
      top_risks: [
        { id: 1, factor: 'TECH', title: 'Obsolescencia Tecnológica Inminente', strategic_impact: 'Crítico - Extinción' },
        { id: 2, factor: 'LEGAL', title: 'Cambio regulatorio en protección de datos', strategic_impact: 'Alto - Multas 5% REV' }
      ]
    };

    await page.route('**/v1/dashboard/plan-999', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(superPayload) });
    });

    // We don't intercept Monte Carlo / Bayesian because they require button clicks. Regression is visual baseline.
    
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-999');
    });
  });

  test('should match visual baseline for Super Dashboard (Worst Case Scenario)', async ({ page }) => {
    // 1920x1080 to ensure everything fits horizontally for a good dashboard snapshot
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.goto('/dashboard');
    
    // Wait for worst case scenario rendering
    await expect(page.getByText('🚨 CADENA DE AUDITORÍA COMPROMETIDA')).toBeVisible();
    await expect(page.getByText('⚠️ Advertencias de Integridad Estratégica')).toBeVisible();
    await expect(page.getByText('45%').first()).toBeVisible(); // pulse
    await expect(page.getByText('🚨 Alertas de Alta Severidad')).toBeVisible();
    
    // Await all charts
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('dashboard-super-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });
});
