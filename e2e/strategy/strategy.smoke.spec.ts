import { test, expect } from '@playwright/test';

test.describe('Strategy Core - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept SWR hooks
    await page.route('**/v1/strategy/kernel/plan-123', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          id: 999, 
          confidence_score: 0.92,
          diagnosis: 'High competitive friction in the main market.',
          guiding_policy: 'Pivot to high-margin digital services.',
          decisions: [
            { id: 1, title: 'Reallocate 20% marketing budget', status: 'proposed', esv: 1500 },
            { id: 2, title: 'Launch new AI feature', status: 'approved', esv: 3000 }
          ],
          capability_gaps: [],
          risk_nodes: []
        }) 
      });
    });

    await page.route('**/v1/strategy/causal/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ chains: [] }) });
    });

    await page.route('**/v1/strategy/pulse/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ overall_pulse: 85 }]) });
    });

    await page.route('**/v1/strategy/graph/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ edges: [] }) });
    });
    
    // Auth context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should load strategy shell and navigate tabs', async ({ page }) => {
    await page.goto('/strategy');
    
    // Verify header
    await expect(page.locator('text=Strategy Decision Core')).toBeVisible();
    await expect(page.locator('text=Confianza: 92%')).toBeVisible();

    // Verify Kernel Diagnosis
    await expect(page.locator('text=High competitive friction in the main market.')).toBeVisible();

    // Verify Default Tab (Decisions)
    await expect(page.locator('text=Reallocate 20% marketing budget')).toBeVisible();

    // Click Optimizer Tab
    await page.click('button:has-text("Optimizar")');
    await expect(page.locator('text=Portfolio Optimizer').first()).toBeVisible();

    // Click Pulse Tab
    await page.click('button:has-text("Pulso (85%)")');
    await expect(page.locator('text=Pulso General')).toBeVisible();
  });

  test('should interact with generation and simulation buttons', async ({ page }) => {
    await page.route('**/v1/strategy/optimize/plan-123*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ optimal_portfolio: [{ id: 1 }], rejected: [] }) });
    });

    await page.goto('/strategy');

    // Go to optimizer
    await page.click('button:has-text("Optimizar")');
    
    // Run optimization
    await page.click('button:has-text("Optimizar Portafolio")');
    
    // Verify toast
    await expect(page.locator('text=Portafolio optimizado:')).toBeVisible();
  });
});
