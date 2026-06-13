import { test, expect } from '@playwright/test';

test.describe('BSC Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept initial SWR fetch for empty BSC
    await page.route('**/v1/execution/plan-123/bsc', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else {
        await route.continue();
      }
    });

    // Intercept progress (objectives)
    await page.route('**/v1/execution/plan-123/progress', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ objectives: [] }) });
    });

    // Intercept synthesize endpoint
    await page.route('**/v1/execution/plan-123/synthesize-bsc', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ kpis_created: 5 }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123'); // auto-select
    });
  });

  test('should load bsc tab, synthesize and switch tabs', async ({ page }) => {
    await page.goto('/bsc');
    
    // Check form is visible
    await expect(page.getByRole('heading', { name: /Diseño de Arquitectura Estratégica/i })).toBeVisible();

    // Click "Sintetizar BSC desde P2W"
    await page.getByRole('button', { name: /Sintetizar BSC desde P2W/i }).click();
    
    // The success toast should appear
    await expect(page.getByText('5 KPIs BSC generados desde Formulación P2W.')).toBeVisible({ timeout: 10000 });
    
    // Switch to Strategy Map
    await page.getByRole('button', { name: /Mapa Estratégico/i }).click();
    
    // Verify Strategy Map tab is active
    // StrategyMap component relies on empty objectives for now
    await expect(page.getByText('Crea objetivos BSC y OKRs para visualizar el mapa estratégico')).toBeVisible(); 
  });
});
