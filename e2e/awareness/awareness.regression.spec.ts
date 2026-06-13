import { test, expect } from '@playwright/test';

test.describe('Awareness Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage for context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'mock_token');
      window.localStorage.setItem('tenant_id', '1');
      window.localStorage.setItem('current_plan_id', '101');
    });

    // Mock initial load with a rich set of data
    await page.route(/\/analysis\/101\/pestel$/, async route => {
      await route.fulfill({
        status: 200,
        json: [
          { id: 1, factor: 'P', severity: 'high', title: 'Regulaciones IA', description: 'La UE aprueba nueva AI Act que impacta modelos fundacionales.', strategic_impact: 'Crítico' },
          { id: 2, factor: 'E', severity: 'medium', title: 'Inflación Controlada', description: 'Tasas de interés bajan 25bps.', strategic_impact: 'Positivo leve' },
          { id: 3, factor: 'S', severity: 'low', title: 'Adopción Remota', description: 'Talento global disponible post-pandemia.', strategic_impact: 'Ventaja Competitiva' },
          { id: 4, factor: 'T', severity: 'high', title: 'Agentes Autónomos', description: 'Rápida adopción de frameworks multi-agente en enterprise.', strategic_impact: 'Disrupción inminente' },
        ]
      });
    });
  });

  test('awareness dashboard visual match', async ({ page }) => {
    await page.goto('/awareness');
    
    // Wait for the data to be loaded
    await expect(page.getByRole('heading', { name: /Radar PESTEL/i })).toBeVisible();

    // Disable animations to avoid flakiness
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });

    // Capture visual regression
    await expect(page).toHaveScreenshot('awareness-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });
});
