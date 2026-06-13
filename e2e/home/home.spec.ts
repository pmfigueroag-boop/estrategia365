import { test, expect } from '@playwright/test';

test.describe('Home Page (Workspace Summary)', () => {
  const mockProjects = [
    {
      id: 1,
      name: 'Global Corp',
      sector: 'private',
      document_count: 5,
      plans: [
        { id: 101, paradigm_id: 'competitive', has_kernel: true, confidence: 0.85, decision_count: 10 }
      ]
    },
    {
      id: 2,
      name: 'Ministry of Education',
      sector: 'public',
      document_count: 0,
      plans: []
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Setup initial state: valid tokens to bypass AuthGuard
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('e365_refresh_token', 'fake-refresh-token');
      window.localStorage.setItem('current_institution_id', '1');
    });

    // Mock auth/me and workspace/summary
    await page.route('**/auth/me', async route => {
      await route.fulfill({ json: { id: 1, email: 'user@test.com', role: 'admin' } });
    });
    await page.route('**/workspace/summary', async route => {
      await route.fulfill({ json: mockProjects });
    });
  });

  test('E2E 01 - Renderiza correctamente el Grid de Proyectos y Planes', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'Estrategia 365' })).toBeVisible();
    await expect(page.getByText('Proyectos existentes')).toBeVisible();

    // Validates Institutions
    await expect(page.getByText('Global Corp')).toBeVisible();
    await expect(page.getByText('Ministry of Education')).toBeVisible();

    // Validates Active Badge
    await expect(page.getByText('ACTIVO')).toBeVisible();

    // Validates Plans
    await expect(page.getByText('COMPETITIVE')).toBeVisible();
    await expect(page.getByText('10 decisiones')).toBeVisible();

    // Validates Empty Plan fallback
    await expect(page.getByRole('button', { name: /Crear primer plan/i })).toBeVisible();
  });

  test('E2E 02 - Renderiza el estado vacío (Cold Start)', async ({ page }) => {
    await page.route('**/workspace/summary', async route => {
      await route.fulfill({ json: [] });
    });

    await page.goto('/');

    await expect(page.getByText('Sin proyectos todavía')).toBeVisible();
    await expect(page.getByText('Presiona "Nuevo Proyecto" arriba para comenzar tu primer plan estratégico.')).toBeVisible();
  });

  test('E2E 03 - Redirige a Login si no está autenticado', async ({ page }) => {
    // Clear localStorage to simulate logged out user
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    // Mock health to fail so AuthGuard doesn't assume DEV_MODE bypass
    await page.route('**/health', async route => {
      await route.fulfill({ status: 500 });
    });

    await page.goto('/');
    
    // AuthGuard should redirect
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('E2E 04 - Muestra error cuando falla la API (HTTP 500)', async ({ page }) => {
    await page.route('**/workspace/summary', async route => {
      await route.fulfill({ status: 500, json: { detail: 'Internal Server Error' } });
    });

    await page.goto('/');

    await expect(page.getByText('No se pudo conectar al servidor')).toBeVisible();
  });

  test('E2E 05 - Navega a Onboarding al dar clic en Nuevo Proyecto', async ({ page }) => {
    await page.goto('/');

    // Wait for Hydration to attach onClick handlers
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();

    // Assert URL change (increase timeout for Next.js DEV compilation)
    await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 30000 });
    
    // Assert localStorage was cleared (handled by Context)
    const currentInstId = await page.evaluate(() => localStorage.getItem('institution_id'));
    expect(currentInstId).toBeNull();
  });

  test('E2E 06 - Seleccionar Plan redirige a Strategy', async ({ page }) => {
    await page.goto('/');

    // Wait for Hydration
    await page.waitForTimeout(500);

    // Click on the button content that DOES NOT stop propagation
    await page.getByText('10 decisiones').click();

    // Verify redirection (increase timeout for Next.js DEV compilation)
    await expect(page).toHaveURL(/.*\/strategy/, { timeout: 30000 });
    
    // Verify localStorage context was set
    const savedPlanId = await page.evaluate(() => localStorage.getItem('current_plan_id'));
    const savedInstId = await page.evaluate(() => localStorage.getItem('current_institution_id'));
    expect(savedPlanId).toBe('101');
    expect(savedInstId).toBe('1');
  });

  test('E2E 07 - Permite borrar un Tenant de forma segura usando Mock', async ({ page }) => {
    await page.route('**/institutions/1', async route => {
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ status: 204 });
    });

    // Accept window dialogs automatically
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Eliminar "Global Corp"');
      await dialog.accept();
    });

    await page.goto('/');

    // Hover over project to reveal delete button, then click it
    const deleteBtn = page.getByTitle('Eliminar proyecto "Global Corp"');
    await deleteBtn.click();

    // Global Corp should disappear from DOM
    await expect(page.getByText('Global Corp')).not.toBeVisible();
    await expect(page.getByText('Ministry of Education')).toBeVisible();
  });
});
