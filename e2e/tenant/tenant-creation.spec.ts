import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('E2E Tenant Creation', () => {
  test('User creates a new institution/tenant and becomes owner', async ({ page }) => {
    // 1. Login
    await loginAs(page, 'new_founder@example.com', 'Pass123!');

    // 2. Go to institutions/tenant creation
    await page.goto('/institutions/new');
    
    // 3. Fill details
    const tenantName = `Ministerio de Defensa ${Date.now()}`;
    await page.getByPlaceholder(/Nombre de la institución/i).fill(tenantName);
    await page.getByPlaceholder(/Dominio o Identificador/i).fill(`mindef-${Date.now()}`);
    
    // Select industry/sector
    await page.getByLabel(/Sector/i).selectOption('Gobierno');

    await page.getByRole('button', { name: /Crear Institución/i }).click();

    // 4. Verify successful creation
    await expect(page.getByText(/Institución creada con éxito/i)).toBeVisible();

    // 5. Verify user is now in the context of that tenant
    await expect(page.getByTestId('current-tenant-label')).toHaveText(tenantName);
  });
});
