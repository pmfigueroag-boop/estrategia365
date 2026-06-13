import { test, expect } from '@playwright/test';

test.describe('Onboarding - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('e365_refresh_token', 'fake-refresh-token');
    });

    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', roles: ['admin'], is_active: true }),
      });
    });

    await page.route('**/auth/refresh', async route => {
      await route.fulfill({ status: 200, json: { access_token: 'fake-token', refresh_token: 'fake-refresh' } });
    });

    await page.route('**/v1/onboarding/progress', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      } else {
        await route.fulfill({ status: 200, json: { status: 'saved' } });
      }
    });

    await page.route('**/institutions/workspace/summary', async route => {
      await route.fulfill({ status: 200, json: [] });
    });
  });

  test('should load the onboarding page without critical errors and render step 1', async ({ page }) => {
    // Navigate to onboarding
    const response = await page.goto('/onboarding');
    
    // Assert HTTP status is OK
    expect(response?.status()).toBe(200);

    // Assert that the page title or a critical element is visible
    await expect(page.getByText('Onboarding Institucional')).toBeVisible({ timeout: 10000 });
    
    // Assert that we are on Step 1 (Identidad) by looking for a specific input or label
    await expect(page.locator('input[name="name"]')).toBeVisible();

    // No console errors check
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    
    expect(errors.length).toBe(0);
  });
});
