import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { switchTenant, verifyTenantContext } from '../helpers/tenant';

test.describe('E2E 03: Multi-Tenant & RBAC Isolation', () => {
  // Test that opens 2 separate browser contexts (simulating two different browsers/users)
  test('Admin revokes Viewer access while Viewer is active', async ({ browser }) => {
    // Context A: Admin User
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Context B: Viewer User
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();

    try {
      // 1. Login both users
      await loginAs(adminPage, 'admin@example.com', 'AdminPass123!');
      await loginAs(viewerPage, 'viewer@example.com', 'ViewerPass123!');

      // Both switch to "Tenant A"
      await switchTenant(adminPage, 'E2E Tenant A');
      await switchTenant(viewerPage, 'E2E Tenant A');

      // 2. Viewer navigates to an institution or sensitive view
      await viewerPage.goto('/institutions');
      await expect(viewerPage.getByRole('heading', { name: /Instituciones/i })).toBeVisible();

      // 3. Admin revokes Viewer's access
      // (Assuming there's a Users/RBAC panel in the UI)
      await adminPage.goto('/settings/users');
      
      // Look for the viewer in the user list and click "Revoke"
      const userRow = adminPage.getByRole('row', { name: /viewer@example.com/i });
      await userRow.getByRole('button', { name: /Revocar|Deactivate/i }).click();
      
      // Confirm revocation modal
      await adminPage.getByRole('button', { name: /Confirmar|Confirm/i }).click();

      // Wait for success toast
      await expect(adminPage.getByText(/Acceso revocado exitosamente/i)).toBeVisible();

      // 4. Viewer tries to perform an action or refresh
      await viewerPage.reload();

      // 5. Assert Viewer is blocked (403 Forbidden UI State)
      // They should see an error message or be redirected to unauthorized page
      await expect(viewerPage.getByText(/403|Acceso Denegado|No tienes permiso/i)).toBeVisible();
      // Verify they cannot see the institutions list anymore
      await expect(viewerPage.getByTestId('institution-list')).toBeHidden();

    } finally {
      await adminContext.close();
      await viewerContext.close();
    }
  });
});
