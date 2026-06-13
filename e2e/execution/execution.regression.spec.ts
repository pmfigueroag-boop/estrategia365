import { test, expect } from '@playwright/test';

test.describe('Execution Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    const mockProgress = {
      overall_progress: 68,
      total_objectives: 2,
      total_key_results: 3,
      objectives: [
        { 
          id: 1, 
          title: 'Conquistar Mercado B2B', 
          responsible_squad: 'Growth',
          progress: 80,
          status: 'in_progress',
          key_results_count: 2,
          collision_flag: 0
        },
        { 
          id: 2, 
          title: 'Lanzar App Móvil', 
          responsible_squad: 'Tech',
          progress: 35,
          status: 'blocked',
          key_results_count: 1,
          collision_flag: 1 // Trigger alert
        }
      ]
    };

    await page.route('**/v1/execution/plan-123/progress', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProgress) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Execution Dashboard', async ({ page }) => {
    await page.goto('/execution');
    
    // Wait for the overall progress gradient and cards to render
    await expect(page.getByText('68%')).toBeVisible();
    await expect(page.getByText('Conquistar Mercado B2B')).toBeVisible();
    await expect(page.getByText('Alerta de Colisión')).toBeVisible(); // collision flag
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('execution-page-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });
});
