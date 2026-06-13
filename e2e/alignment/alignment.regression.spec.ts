import { test, expect } from '@playwright/test';

test.describe('Alignment Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/alignment/*/7s', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { dimension: 'strategy', score: 4, notes: 'Estrategia clara y bien comunicada', gap_analysis: 'Brecha estructural identificada entre Strategy y Skills.' },
        { dimension: 'structure', score: 2, notes: 'Estructura rígida que retrasa la innovación' },
        { dimension: 'systems', score: 4, notes: 'Sistemas TI modernos y eficientes' },
        { dimension: 'shared_values', score: 5, notes: 'Cultura alineada con la visión 2030' },
        { dimension: 'style', score: 3, notes: 'Liderazgo tradicional' },
        { dimension: 'staff', score: 4, notes: 'Alta retención de talento' },
        { dimension: 'skills', score: 2, notes: 'Falta formación en tecnologías emergentes' },
      ])});
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Alignment Dashboard (McKinsey 7S)', async ({ page }) => {
    await page.goto('/alignment');
    
    // Wait for radar chart to render and cards to populate
    await expect(page.getByRole('heading', { name: /Alineación Organizacional/i })).toBeVisible();
    await expect(page.getByText('3.4/5', { exact: true })).toBeVisible(); // 24 / 7 = 3.4
    await expect(page.getByText('Brecha estructural identificada entre Strategy y Skills.')).toBeVisible();
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('alignment-page-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      // Give recharts animation time to finish
      animations: 'disabled',
    });
  });
});
