import { test, expect } from '@playwright/test';

test.describe('BSC Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    const mockBsc = [
      { id: 1, perspective: 'financial', objective_id: 1, objective: 'Aumentar Rentabilidad', kpi: 'EBITDA Margin', target_value: 20, current_value: 15, unit: '%' },
      { id: 2, perspective: 'customer', objective_id: 2, objective: 'Mejorar Satisfacción', kpi: 'NPS', target_value: 60, current_value: 45, unit: 'pts' },
      { id: 3, perspective: 'process', objective_id: 3, objective: 'Optimizar Procesos', kpi: 'Cycle Time', target_value: 5, current_value: 7, unit: 'days' },
      { id: 4, perspective: 'learning', objective_id: 4, objective: 'Desarrollar Talento', kpi: 'Training Hours', target_value: 40, current_value: 20, unit: 'hrs/yr' }
    ];

    const mockProgress = {
      objectives: [
        { id: 1, title: 'Aumentar Rentabilidad (Financiera)', status: 'On Track' },
        { id: 2, title: 'Mejorar Satisfacción del Cliente', status: 'At Risk' },
        { id: 3, title: 'Optimizar Procesos Internos', status: 'Off Track' },
        { id: 4, title: 'Desarrollar Talento y Cultura', status: 'On Track' }
      ]
    };

    await page.route('**/v1/execution/plan-123/bsc', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBsc) });
    });

    await page.route('**/v1/execution/plan-123/progress', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProgress) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Balanced Scorecard Dashboard', async ({ page }) => {
    await page.goto('/bsc');
    
    // Wait for the gauge/chart and perspectives to render
    await expect(page.getByRole('heading', { name: /Diseño de Arquitectura Estratégica/i })).toBeVisible();
    await expect(page.getByText('EBITDA Margin')).toBeVisible();
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('bsc-page-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });
});
