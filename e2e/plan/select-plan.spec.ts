import { test, expect } from '@playwright/test';

test.describe('Select Plan Module', () => {
  // Pre-configure the local storage to simulate a logged-in user with a selected tenant
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, email: 'test@example.com' }) });
    });
    await page.addInitScript(() => {
      localStorage.setItem('e365_access_token', 'mock-token');
      localStorage.setItem('e365_active_tenant_id', '1');
      localStorage.setItem('e365_active_tenant_name', 'Mock Tenant');
    });
  });

  test('Fast-track: auto-selects if exactly 1 plan is available', async ({ page }) => {
    // Mock the API to return 1 plan
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'plan-1', name: 'Plan Único', mission: 'Mission', horizon_years: 3, paradigm: 'Modern' }
        ]),
      });
    });

    // Go to select-plan
    await page.goto('/select-plan');

    // Should immediately redirect to Dashboard
    await page.waitForURL('**/');
    expect(page.url()).not.toContain('/select-plan');

    // Check localStorage was updated
    const selectedPlanId = await page.evaluate(() => localStorage.getItem('e365_active_plan_id'));
    expect(selectedPlanId).toBe('plan-1');
  });

  test('Empty state: shows message if 0 plans are available', async ({ page }) => {
    // Mock the API to return 0 plans
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/select-plan');

    // Wait for the empty state to appear
    await expect(page.getByText('No hay planes estratégicos disponibles en este tenant.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Dashboard/i })).toBeVisible();
  });

  test('Render grid: shows multiple plans and handles selection', async ({ page }) => {
    // Mock the API to return 2 plans
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'plan-1', name: 'Plan Alfa', mission: 'Misión Alfa', horizon_years: 3, paradigm: 'Agile' },
          { id: 'plan-2', name: 'Plan Beta', mission: 'Misión Beta', horizon_years: 5, paradigm: 'Traditional' },
        ]),
      });
    });

    await page.goto('/select-plan');

    // Ensure the title and plans are visible
    await expect(page.getByRole('heading', { name: /Selecciona un Plan Estratégico/i })).toBeVisible();
    await expect(page.getByText('Misión Alfa')).toBeVisible();
    await expect(page.getByText('Misión Beta')).toBeVisible();

    // Select the second plan
    await page.getByText('Misión Beta').click();

    // Should redirect to Dashboard
    await page.waitForURL('**/');
    
    // Check localStorage was updated
    const selectedPlanId = await page.evaluate(() => localStorage.getItem('e365_active_plan_id'));
    const selectedPlanName = await page.evaluate(() => localStorage.getItem('e365_active_plan_name'));
    expect(selectedPlanId).toBe('plan-2');
    expect(selectedPlanName).toBe('Misión Beta');
  });

  test('Error handling: shows alert on API failure', async ({ page }) => {
    // Mock the API to return 500 Error
    await page.route('**/v1/plans/tenant', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });

    await page.goto('/select-plan');

    // Wait for the error banner to appear
    await expect(page.getByText('No se pudieron cargar los planes')).toBeVisible();
  });
  
  test('Session validation: redirects to login if not authenticated', async ({ page }) => {
    // Clear the storage to simulate unauthenticated user
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/select-plan');
    
    // It depends on how Next.js handles redirects, but let's assume it pushes to login
    await page.waitForURL('**/login*');
    expect(page.url()).toContain('/login');
  });
});
