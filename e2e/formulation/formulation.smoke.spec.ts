import { test, expect } from '@playwright/test';

test.describe('Formulation Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API routes
    await page.route('**/v1/plans/*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { id: 'plan-123', paradigm_id: 'competitive', mission: 'Mision Activa', vision: 'Vision Activa', created_at: '2026-01-01' },
        { id: 'plan-456', paradigm_id: 'cepal', mission: 'Mision Publica', vision: 'Vision Publica', created_at: '2026-01-02' }
      ])});
    });

    await page.route('**/v1/plans/extract-from-docs/*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        mission: 'Mision extraida desde PDF',
        vision: 'Vision extraida desde Word'
      })});
    });

    await page.route('**/v1/plans/synthesize/*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        where_to_play: 'Mercado LATAM',
        how_to_win: 'Diferenciacion por calidad',
        modules_used: { PESTEL: 5, Porter: 3 }
      })});
    });

    await page.route('**/v1/plans/plan-123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'plan-123' }) });
      } else {
        await route.fallback();
      }
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123'); // auto-select
      window.localStorage.setItem('institution_id', 'inst-1');
    });
  });

  test('should render Formulation Page and allow manual extraction', async ({ page }) => {
    await page.goto('/formulation');
    
    // Check that we are on the form view
    await expect(page.getByText('Strategic Formulation & Choice')).toBeVisible();
    await expect(page.locator('textarea').first()).toHaveValue('Mision Activa');

    // Click "Extraer de Docs"
    await page.getByText('📄 Extraer de Docs').click();
    
    // Wait for the textarea to be updated with extracted content
    await expect(page.locator('textarea').first()).toHaveValue('Mision extraida desde PDF', { timeout: 10000 });
  });

  test('should allow synthesis from diagnostics', async ({ page }) => {
    await page.goto('/formulation');
    
    // Check form is visible
    await expect(page.getByText('Strategic Formulation & Choice')).toBeVisible();

    // Click "Sintetizar desde Diagnóstico"
    await page.getByText('🧠 Sintetizar desde Diagnóstico').click();
    
    // Wait for the specific field to be updated
    // The "Where to Play" field is the 3rd cascade textarea
    await expect(page.locator('textarea').nth(2)).toHaveValue('Mercado LATAM', { timeout: 10000 });
    
    // Wait for the badge
    await expect(page.getByText(/PESTEL \(5\)/i)).toBeVisible();
  });

  test('should save successfully', async ({ page }) => {
    await page.goto('/formulation');
    
    // Add text to the last textarea
    await page.locator('textarea').nth(5).fill('Nuevos sistemas de gestion de la calidad');
    
    // Click "Guardar Formulación"
    await page.getByRole('button', { name: /Guardar Formulación/i }).click();
    
    // The success toast should appear
    await expect(page.getByText(/Plan actualizado/i)).toBeVisible({ timeout: 5000 });
  });
});
