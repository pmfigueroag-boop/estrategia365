import { test, expect } from '@playwright/test';

test.describe('Smoke Test: Select Plan Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, email: 'test@example.com' }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('e365_access_token', 'smoke-token');
      localStorage.setItem('e365_active_tenant_id', '1');
    });
  });

  test('Module loads successfully without crashing (Happy Path)', async ({ page }) => {
    // Intercept to return multiple plans so it stays on the page
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'smoke-1', name: 'Smoke Plan 1', mission: 'Smoke Mission 1', time_horizon_months: 12, paradigm_id: 'Smoke' },
          { id: 'smoke-2', name: 'Smoke Plan 2', mission: 'Smoke Mission 2', time_horizon_months: 12, paradigm_id: 'Smoke' }
        ]),
      });
    });

    // Act
    const response = await page.goto('/select-plan');
    
    // Assert HTTP status
    expect(response?.status()).toBe(200);
    
    // Assert critical UI component is rendered
    await expect(page.getByRole('heading', { name: /Selecciona un Plan Estratégico/i })).toBeVisible();
    await expect(page.getByText('Smoke Mission 1')).toBeVisible();
  });
});
