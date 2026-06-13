import { test, expect } from '@playwright/test';

test.describe('Analysis Module - Smoke Tests', () => {
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

  test('should render Analysis page and load default Institucional tab', async ({ page }) => {
    await page.goto('/analysis');
    
    // Wait for the title
    await expect(page.locator('h1.page-title')).toHaveText('Análisis Estratégico', { timeout: 10000 });
    
    // Check that tabs exist
    await expect(page.getByText('🏙️ Institucional')).toBeVisible();
    await expect(page.getByText('🌍 PESTEL')).toBeVisible();
    await expect(page.getByText('⚔️ Porter 5F')).toBeVisible();
    
    // By default, Institutional tab is selected
    await expect(page.getByRole('button', { name: /Command Center/ })).toBeVisible();
  });

  test('should allow switching between analysis frameworks (tabs)', async ({ page }) => {
    await page.goto('/analysis');
    
    // Switch to PESTEL
    await page.getByText('🌍 PESTEL').click();
    await expect(page.getByText('Radar PESTEL', { exact: false })).toBeVisible({ timeout: 10000 });
    
    // Switch to Porter
    await page.getByRole('button', { name: '⚔️ Porter 5F' }).click();
    await expect(page.locator('.animate-fade-in').first()).toBeVisible({ timeout: 10000 });
  });
});
