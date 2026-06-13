import { test, expect } from '@playwright/test';

test.describe('Analysis Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock all backend requests to return 200 by default (prevents SWR 401 retries)
    await page.route('**/v1/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    // 2. Mock specific responses
    await page.route('**/v1/plans/active', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'plan-123', status: 'formulation' }) });
    });

    await page.route('**/v1/analysis/plan-123/pestel', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { id: 1, factor: 'P', title: 'Nueva ley fiscal', severity: 'high', probability: 80, strategic_impact: 'Aumento de costos', priority_score: 95 }
      ]) });
    });

    // 3. Set localStorage to bypass login
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for PESTEL tab', async ({ page }) => {
    await page.goto('/analysis');
    
    // Switch to PESTEL to trigger fetch
    await page.getByText('🌍 PESTEL').click();
    
    // Wait for the container to render
    const contentLocator = page.locator('.animate-fade-in').first();
    await expect(contentLocator).toBeVisible({ timeout: 10000 });

    // Snapshot the main container (avoiding the whole page to reduce flakiness with dynamic dates)
    await expect(contentLocator).toHaveScreenshot('pestel-tab-baseline.png', {
      maxDiffPixelRatio: 0.1
    });
  });
});
