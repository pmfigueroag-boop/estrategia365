import { test } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { switchTenant } from '../helpers/tenant';
import { createAnalysis } from '../helpers/flows';

test.describe('E2E Strategic Analysis', () => {
  test('User completes a PESTEL analysis', async ({ page }) => {
    await loginAs(page, 'planner@example.com', 'Pass123!');
    await switchTenant(page, 'E2E Tenant A');

    // Use the helper flow
    await createAnalysis(page, 'PESTEL', 'Alta inflación afecta la liquidez del mercado. Nuevas regulaciones tecnológicas en curso.');
  });
});
