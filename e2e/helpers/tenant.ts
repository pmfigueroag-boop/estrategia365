import { Page, expect } from '@playwright/test';

/**
 * Switch to a different tenant using the UI tenant selector.
 */
export async function switchTenant(page: Page, tenantName: string) {
  // Click on the tenant switcher dropdown (usually in the header/sidebar)
  const tenantDropdown = page.getByTestId('tenant-selector');
  await tenantDropdown.click();
  
  // Select the specific tenant
  await page.getByRole('menuitem', { name: new RegExp(tenantName, 'i') }).click();
  
  // Wait for the context to switch (API call or navigation)
  await expect(page.getByTestId('current-tenant-label')).toHaveText(new RegExp(tenantName, 'i'));
}

/**
 * Verify that the current active tenant is the expected one.
 */
export async function verifyTenantContext(page: Page, expectedTenantName: string) {
  await expect(page.getByTestId('current-tenant-label')).toHaveText(new RegExp(expectedTenantName, 'i'));
}
