import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { switchTenant } from '../helpers/tenant';

test.describe('E2E 07: Export Deliverables', () => {
  test('User can export strategic plan as PDF and the download succeeds', async ({ page }) => {
    // 1. Login and navigate
    await loginAs(page, 'planner@example.com', 'PlannerPass123!');
    await switchTenant(page, 'E2E Tenant A');

    // Assume there is a dashboard or an export center
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

    // 2. Trigger Export
    // Look for the export button, often labeled "Exportar PDF" or similar
    const exportButton = page.getByRole('button', { name: /Exportar PDF|Download PDF/i });
    await expect(exportButton).toBeVisible();

    // Setup the download listener BEFORE clicking
    const downloadPromise = page.waitForEvent('download');
    
    await exportButton.click();

    // 3. Verify Download
    const download = await downloadPromise;
    
    // Check the suggested filename ends with .pdf
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    // Save it temporarily to verify it has size
    const path = await download.path();
    expect(path).not.toBeNull();
    
    // If needed, we could assert the file size > 0 to ensure it's not a dummy file
    const fs = require('fs');
    if (path) {
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(100); // at least some bytes
    }
  });
});
