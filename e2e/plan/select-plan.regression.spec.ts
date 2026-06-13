import { test, expect } from '@playwright/test';

test.describe('Visual Regression Test: Select Plan Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, email: 'test@example.com' }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('e365_access_token', 'regression-token');
      localStorage.setItem('e365_active_tenant_id', '1');
    });
  });

  test('UI Layout remains consistent (Grid View)', async ({ page }) => {
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'plan-1', name: 'Plan Regression 1', mission: 'Mission 1', time_horizon_months: 36, paradigm_id: 'Modern' },
          { id: 'plan-2', name: 'Plan Regression 2', mission: 'Mission 2', time_horizon_months: 60, paradigm_id: 'Classic' }
        ]),
      });
    });

    await page.goto('/select-plan');

    // Wait for network idle and specific element to render to ensure stable snapshot
    await expect(page.getByText('Mission 1')).toBeVisible();

    // Take screenshot and compare
    // Note: The first run will fail and generate baseline screenshots automatically
    await expect(page).toHaveScreenshot('select-plan-grid.png', { maxDiffPixelRatio: 0.05 });
  });

  test('UI Layout remains consistent (Empty State)', async ({ page }) => {
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/select-plan');
    await expect(page.getByText('No hay planes estratégicos disponibles en este tenant.')).toBeVisible();
    
    // Take screenshot of empty state
    await expect(page).toHaveScreenshot('select-plan-empty.png', { maxDiffPixelRatio: 0.05 });
  });
});
