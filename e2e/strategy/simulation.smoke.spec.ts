import { test, expect } from '@playwright/test';

test.describe('Wargaming & Simulation Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept Simulation/ESV Data
    await page.route('**/v1/v3/benchmarks/esv/*/comparison', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ verdict: 'COMPARISON', plan_avg_esv: 450, benchmark_avg_esv: 400, delta: 50, industry: 'Tech' }) });
    });

    await page.route('**/v1/v4/*/causal-validation', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total_chains: 10, validated: 8, broken: 2, validation_score: 80, verdict: 'PARTIAL' }) });
    });

    await page.route('**/v1/wargaming/sessions/*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'sess-1', scenario: 'test scenario' }]) });
    });

    await page.route('**/v1/wargaming/simulate', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'Simulation success: 80% survival rate.' }) });
    });

    await page.route('**/v1/wargaming/*/devil-advocate', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ flaws: ['Assumption A is weak', 'Market size overestimated'] }) });
    });

    // Auth context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should load Wargaming view and navigate tabs', async ({ page }) => {
    await page.goto('/strategy/simulation');
    
    // Verify header
    await expect(page.getByRole('heading', { name: /Laboratorio de Simulación/i })).toBeVisible();

    // Navigate to Wargaming tab
    await page.click('button:has-text("Wargaming")');
    await expect(page.locator('text=Simulación Competitiva').first()).toBeVisible();

    // Navigate to ESV Benchmarks tab
    await page.click('button:has-text("ESV Benchmarks")');
    await expect(page.locator('text=Tu Plan ESV').first()).toBeVisible();
    await expect(page.locator('text=450').first()).toBeVisible();

    // Navigate to Causal Validation tab
    await page.click('button:has-text("Causal Validation")');
    await expect(page.locator('text=Validación de Cadenas Causales').first()).toBeVisible();
    await expect(page.locator('text=PARTIAL').first()).toBeVisible();
  });

  test('should click to run new wargame simulation', async ({ page }) => {
    await page.goto('/strategy/simulation');
    
    // Navigate to Wargaming tab
    await page.click('button:has-text("Wargaming")');

    // Input scenario
    await page.fill('input[placeholder="Ej: Un competidor lanza un producto 30% más barato..."]', 'New competitor');

    // Run simulation
    await page.click('button:has-text("🎮 Simular")');
    
    // Wait for the result
    await expect(page.locator('text=Simulation success: 80% survival rate.').first()).toBeVisible();
  });

  test('should run Devils Advocate', async ({ page }) => {
    await page.goto('/strategy/simulation');
    
    await page.click('button:has-text("Wargaming")');
    await page.click('button:has-text("Devil\'s Advocate")');
    
    await expect(page.locator('text=Assumption A is weak').first()).toBeVisible();
  });
});
