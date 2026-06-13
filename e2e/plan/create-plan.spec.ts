import { test } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { switchTenant } from '../helpers/tenant';
import { createPlan } from '../helpers/flows';

test.describe('E2E Plan Creation', () => {
  test('@synthetic [Plan] User creates a strategic plan', async ({ page }) => {
    await loginAs(page, 'planner@example.com', 'Pass123!');
    await switchTenant(page, 'E2E Tenant A');

    // Use the helper flow
    await createPlan(page, `Plan Nacional ${Date.now()}`, '2026-01-01', '2030-12-31');
  });
});
