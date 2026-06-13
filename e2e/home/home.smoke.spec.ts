import { test, expect } from '@playwright/test';

test.describe('Home Page (Smoke Test)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup dummy token to bypass AuthGuard
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'smoke-token');
      window.localStorage.setItem('e365_refresh_token', 'smoke-refresh-token');
    });

    // Mock API responses so the smoke test doesn't depend on the backend state
    await page.route('**/auth/me', async route => {
      await route.fulfill({ json: { id: 1, email: 'smoke@test.com', role: 'admin' } });
    });
    await page.route('**/workspace/summary', async route => {
      await route.fulfill({ json: [] }); // Start with empty projects for faster load
    });
  });

  test('La pantalla Home carga sin crashear', async ({ page }) => {
    await page.goto('/');

    // Wait for the main elements to ensure the app booted successfully
    await expect(page.getByRole('heading', { name: 'Estrategia 365' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Nuevo Proyecto/i })).toBeVisible();
    await expect(page.getByText('Sin proyectos todavía')).toBeVisible();

    // The page title should contain Estrategia 365
    expect(await page.title()).toContain('Estrategia 365');
  });
});
