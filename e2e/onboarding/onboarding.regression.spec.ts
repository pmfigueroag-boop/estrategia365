import { test, expect } from '@playwright/test';

test.describe('Onboarding - Visual Regression', () => {
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

    await page.route('**/institutions/workspace/summary', async route => {
      await route.fulfill({ status: 200, json: [] });
    });
  });

  test('Step 1 layout should not have unexpected shifts', async ({ page }) => {
    // Mock the initial progress so we get a consistent empty state for Step 1
    await page.route('**/v1/onboarding/progress*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          current_step: 1,
          institution_id: null,
          form_data: null,
          status: 'in_progress'
        }),
      });
    });

    // Mock institutions to prevent any random data loading
    await page.route('**/v1/institutions*', async (route) => {
      await route.fulfill({ status: 200, body: '[]' });
    });

    await page.goto('/onboarding');

    // Wait for the main wrapper to be visible
    const mainWrapper = page.locator('#onboarding-content');
    await expect(mainWrapper).toBeVisible();

    // Give it a moment to ensure fonts/icons are loaded
    await page.waitForLoadState('networkidle');

    // Take screenshot of the main wrapper area to ignore browser UI differences
    await expect(mainWrapper).toHaveScreenshot('onboarding-step1-layout.png', {
      maxDiffPixelRatio: 0.05 // Allow slight anti-aliasing differences
    });
  });
});
