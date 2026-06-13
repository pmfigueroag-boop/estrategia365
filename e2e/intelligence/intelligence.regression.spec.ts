import { test, expect } from '@playwright/test';

test.describe('Intelligence Hub Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.route('**/v1/intelligence/*/summary*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        coverage: { pct: 85 },
        analyses: {
          pestel: { freshness: 'fresh', count: 12, age_days: 2 },
          porter: { freshness: 'aging', count: 5, age_days: 15 },
          swot: { freshness: 'stale', count: 3, age_days: 45 },
          tows: { freshness: 'never_run', count: 0 },
        },
        twin_health: {
          current_completeness: { overall: 90 },
          total_snapshots: 5,
          total_events: 100
        }
      }) });
    });

    await page.route('**/v1/intelligence/*/gaps*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        gaps: [
          { analysis: 'porter', severity: 'high', reason: 'Falta escaneo de competidores', action: 'run_scan' },
          { analysis: 'swot', severity: 'critical', reason: 'Análisis obsoleto', action: 're_scan' }
        ]
      }) });
    });

    await page.route('**/v1/intelligence/*/recommendations*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        recommendations: [
          { analysis: 'swot', priority: 'critical', recommendation: 'Actualizar debilidades', trigger: 'twin_change' }
        ]
      }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Intelligence Hub', async ({ page }) => {
    await page.goto('/intelligence');
    
    // Wait for the page to be fully loaded and rendered
    await expect(page.getByText('🏥 Salud del Digital Twin')).toBeVisible({ timeout: 10000 });
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('intelligence-hub-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
