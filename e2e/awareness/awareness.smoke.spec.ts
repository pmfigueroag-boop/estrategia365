import { test, expect } from '@playwright/test';

test.describe('Awareness Module - Smoke Tests', () => {
  const initialSignals = [
    { id: 1, factor: 'P', severity: 'high', title: 'Cambio regulatorio', description: 'Nueva ley de IA', strategic_impact: 'Crítico' },
    { id: 2, factor: 'E', severity: 'low', title: 'Baja de tasas', description: 'Oportunidad de inversión', strategic_impact: 'Expansión' }
  ];

  const scannedSignals = [
    { id: 3, factor: 'T', severity: 'high', title: 'Nueva tecnología disruptiva', description: 'GPT-5 release', strategic_impact: 'Transformación' },
    { id: 4, factor: 'S', severity: 'medium', title: 'Cambio de consumo', description: 'Preferencia por digital', strategic_impact: 'Moderado' }
  ];

  test('should display empty state when no plan is active', async ({ page }) => {
    // Clear localStorage to ensure no planId
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('e365_access_token', 'mock_token');
    });

    await page.goto('/awareness');
    await expect(page.getByText('No hay un plan estratégico activo.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Formulación/i })).toBeVisible();
  });

  test('should render signals and handle AI scan flow', async ({ page }) => {
    // Set localStorage for context with an active plan
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'mock_token');
      window.localStorage.setItem('tenant_id', '1');
      window.localStorage.setItem('current_plan_id', '101');
    });

    // Mock initial load
    await page.route(/\/analysis\/101\/pestel$/, async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: initialSignals });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      }
    });

    // Mock scan endpoint with a small delay
    await page.route(/\/analysis\/101\/pestel\/scan/, async route => {
      // simulate network delay to see loading state
      await new Promise(r => setTimeout(r, 500));
      await route.fulfill({ status: 200, json: scannedSignals });
    });

    await page.goto('/awareness');
    
    // Check initial render
    await expect(page.getByRole('heading', { name: /Strategic Awareness/i })).toBeVisible();
    await expect(page.getByText('(Plan #101)')).toBeVisible();
    
    // Check initial signals in the Radar list
    await expect(page.getByText('Cambio regulatorio').first()).toBeVisible();
    await expect(page.getByText('Baja de tasas').first()).toBeVisible();

    // Check Vectorized SWOT (FODA Vectorizado)
    await expect(page.getByText('Oportunidad', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Amenaza', { exact: true }).first()).toBeVisible();

    // Click Sync button
    const syncButton = page.getByRole('button', { name: /Sincronizar Señales IA/i });
    await syncButton.click();

    // Verify loading state
    await expect(page.getByRole('button', { name: /Escaneando con IA.../i })).toBeVisible();

    // Verify new signals loaded after scan completes
    await expect(page.getByText('Nueva tecnología disruptiva').first()).toBeVisible();
    await expect(page.getByText('Cambio de consumo').first()).toBeVisible();
    
    // Ensure old signals are gone (since we mock usePestel mutating with new data only)
    await expect(page.getByText('Cambio regulatorio')).toBeHidden();
  });
});
