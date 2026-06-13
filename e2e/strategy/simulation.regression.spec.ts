import { test, expect } from '@playwright/test';

test.describe('Wargaming & Simulation Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // Intercept Simulation/ESV Data to ensure stable rendering
    await page.route('**/v1/v3/benchmarks/esv/*/comparison', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ verdict: 'COMPARISON', plan_avg_esv: 450, benchmark_avg_esv: 400, delta: 50, industry: 'Tech' }) });
    });

    await page.route('**/v1/v4/*/causal-validation', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total_chains: 10, validated: 8, broken: 2, validation_score: 80, verdict: 'PARTIAL' }) });
    });

    await page.route('**/v1/wargaming/sessions/*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'sess-1', scenario: 'test scenario' }]) });
    });

    // We also want to mock the Monte Carlo default tab to have stable data
    await page.route('**/v1/v4/*/monte-carlo*', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          portfolio: { mean: 100, p50_median: 95, VaR_95: 15, std: 10, p5: 80, p95: 120 },
          risk_assessment: 'MODERATE',
          decision_stats: { 'Decision A': { mean: 50, std: 5, p5: 40, p95: 60 } }
        }) 
      });
    });

    // Auth context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Simulation Dashboard', async ({ page }) => {
    await page.goto('/strategy/simulation');
    
    // Wait for the lab to load
    await expect(page.getByRole('heading', { name: /Laboratorio de Simulación/i })).toBeVisible();

    // Click on Monte Carlo explicitly to load it for the screenshot
    // Even though it's default, we want to make sure it's fully rendered
    const runBtn = page.locator('button:has-text("Ejecutar Simulación")');
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Wait for the mock to resolve and data to appear
    await expect(page.locator('text=ESV Medio').first()).toBeVisible();
    await expect(page.locator('text=MODERATE').first()).toBeVisible();

    // Take screenshot
    await expect(page).toHaveScreenshot('simulation-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });
});
