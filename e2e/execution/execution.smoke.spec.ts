import { test, expect } from '@playwright/test';

test.describe('Execution Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept progress (objectives)
    await page.route('**/v1/execution/plan-123/progress', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          overall_progress: 0,
          total_objectives: 0,
          total_key_results: 0,
          objectives: [] 
        }) 
      });
    });

    // Intercept synthesize endpoint
    await page.route('**/v1/execution/plan-123/synthesize-okrs', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ objectives_created: 3 }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123'); // auto-select
    });
  });

  test('should load execution dashboard, synthesize and open forms', async ({ page }) => {
    await page.goto('/execution');
    
    // Check main title
    await expect(page.getByRole('heading', { name: /Ejecución Ágil de OKRs/i })).toBeVisible();

    // Click "Sintetizar OKRs"
    await page.getByRole('button', { name: /Sintetizar OKRs desde Formulación/i }).click();
    
    // The success toast should appear
    await expect(page.getByText('3 OKRs generados desde Formulación + Kernel.')).toBeVisible({ timeout: 10000 });
    
    // Test Manual creation toggle
    await page.getByRole('button', { name: /Crear Manual/i }).click();
    await expect(page.getByRole('button', { name: 'Guardar', exact: true })).toBeVisible(); // OkrForm save button text
  });
});
