import { test, expect } from '@playwright/test';

test.describe('Hoshin Kanri Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept SWR hook for X-Matrix
    await page.route('**/v1/hoshin/plan-123/x-matrix', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          stats: { total_objectives: 10, breakthroughs: 3, fundamentals: 7, total_cells: 20, strong_correlations: 8 },
          summary: 'True North: Penetración de mercado.',
          north: [ { id: 1, title: 'Estrategia Norte 1', progress_pct: 60, status: 'agreed' } ]
        }) 
      });
    });

    // Intercept Catchball
    await page.route('**/v1/hoshin/plan-123/catchball', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Intercept Cascade
    await page.route('**/v1/hoshin/plan-123/cascade', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          alignment: { agreed_pct: 90, total_objectives: 15, negotiating_count: 1, fully_deployed: false },
          cascade: { corporate: [{ id: 10, title: 'Corporate Obj 1', progress_pct: 50, owner: 'CEO' }] }
        }) 
      });
    });

    // Auth context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should load hoshin kanri view and display the X-Matrix', async ({ page }) => {
    await page.goto('/hoshin');
    
    // Verify header
    await expect(page.getByRole('heading', { name: 'Hoshin Kanri — X-Matrix' })).toBeVisible();
    await expect(page.locator('text=True North: Penetración de mercado.')).toBeVisible();

    // Verify North axis
    await expect(page.locator('text=Estrategia Norte 1')).toBeVisible();

    // Navigate to Cascade tab
    await page.click('button:has-text("Cascada")');
    await expect(page.locator('text=Corporate Obj 1')).toBeVisible();
    await expect(page.locator('text=Alineación: 90%')).toBeVisible();

    // Navigate to Catchball tab
    await page.click('button:has-text("Catchball")');
    await expect(page.locator('text=Proceso Catchball')).toBeVisible();
  });
});
