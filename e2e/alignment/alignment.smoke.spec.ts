import { test, expect } from '@playwright/test';

test.describe('Alignment Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept initial SWR fetch (empty initially)
    await page.route('**/v1/alignment/*/7s', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Intercept diagnose endpoint
    await page.route('**/v1/alignment/*/7s/diagnose', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { dimension: 'strategy', score: 4, notes: 'Estrategia clara y bien comunicada', gap_analysis: 'Ligera brecha en Skills. Se recomienda capacitación.' },
        { dimension: 'structure', score: 3, notes: 'Estructura con algunos silos' },
        { dimension: 'systems', score: 4, notes: 'Sistemas TI adecuados' },
        { dimension: 'shared_values', score: 5, notes: 'Cultura organizacional robusta' },
        { dimension: 'style', score: 3, notes: 'Liderazgo intermedio' },
        { dimension: 'staff', score: 4, notes: 'Personal motivado' },
        { dimension: 'skills', score: 2, notes: 'Falta formación en IA' },
      ])});
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123'); // auto-select
    });
  });

  test('should render empty state and then diagnose successfully', async ({ page }) => {
    await page.goto('/alignment');
    
    // Check form is visible
    await expect(page.getByRole('heading', { name: /Alineación Organizacional/i })).toBeVisible();
    await expect(page.getByText('Presiona "Diagnosticar con IA"')).toBeVisible();

    // Click "Diagnosticar con IA"
    await page.getByRole('button', { name: /Diagnosticar con IA/i }).click();
    
    // The success toast should appear
    await expect(page.getByText(/Diagnóstico 7S completado/i)).toBeVisible({ timeout: 10000 });
    
    // Wait for the average score calculation (e.g. 25/7 = 3.57 -> 3.6/5)
    await expect(page.getByText('3.6/5', { exact: true })).toBeVisible();
    
    // Gap Analysis should be visible
    await expect(page.getByText('Ligera brecha en Skills. Se recomienda capacitación.')).toBeVisible();
  });
});
