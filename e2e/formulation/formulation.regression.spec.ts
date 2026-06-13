import { test, expect } from '@playwright/test';

test.describe('Formulation Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/plans/*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { 
          id: 'plan-123', 
          paradigm_id: 'competitive', 
          mission: 'Ofrecer el mejor software B2B para PYMES en Latinoamerica con alto estandar de calidad.', 
          vision: 'Ser el lider absoluto en software B2B en LatAm al 2030.', 
          where_to_play: 'PYMES de tecnología y servicios en Mexico, Colombia, Chile y Peru.',
          how_to_win: 'Integraciones nativas, onboarding de 5 minutos, y UX de clase mundial.',
          capabilities: 'Desarrollo de integraciones ágiles, equipo de growth marketing, soporte técnico especializado.',
          management_systems: 'OKRs trimestrales, metodologias ágiles, pipeline de CI/CD automatizado.',
          created_at: '2026-01-01' 
        }
      ])});
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
      window.localStorage.setItem('institution_id', 'inst-1');
    });
  });

  test('should match visual baseline for Formulation Page', async ({ page }) => {
    await page.goto('/formulation');
    
    // Wait for the form to be fully loaded and populated
    await expect(page.getByText('Strategic Formulation & Choice')).toBeVisible();
    await expect(page.locator('textarea').first()).toHaveValue(/Ofrecer el mejor software B2B/i);
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('formulation-page-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
