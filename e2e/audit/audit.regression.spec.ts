import { test, expect } from '@playwright/test';

test.describe('Audit Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage for context
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', '1');
      window.localStorage.setItem('institution_id', '1');
    });

    // Mock Audit API call
    await page.route(/\/audit-trail/, async route => {
      await route.fulfill({
        status: 200,
        json: {
          is_valid: true,
          logs: [
            { id: 1, created_at: '2026-06-01T12:00:00Z', actor: 'pmfig', action: 'CREATE', entity: 'Strategic Plan', entity_id: 1, hash_signature: 'ab12c34def567890ab12c34def567890' },
            { id: 2, created_at: '2026-06-01T12:15:00Z', actor: 'pmfig', action: 'UPDATE', entity: 'Objective', entity_id: 45, hash_signature: 'cd34e56fgh789012cd34e56fgh789012' },
            { id: 3, created_at: '2026-06-02T12:00:00Z', actor: 'system', action: 'VERIFY', entity: 'Kernel', entity_id: null, hash_signature: 'ef56g78hijklmnopqrs1234567890abc' }
          ]
        }
      });
    });
  });

  test('should match visual baseline for Audit Dashboard', async ({ page }) => {
    await page.goto('/audit');
    
    // Wait for the table to appear and stabilize
    await expect(page.getByRole('heading', { name: 'Registro Forense (Event Sourcing)' })).toBeVisible();
    await expect(page.getByText('pmfig').first()).toBeVisible();

    // Disable animations for visual regression
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
      `
    });

    // Give it a tiny bit of time to settle
    await page.waitForTimeout(500);

    // Take snapshot of the full page
    await expect(page).toHaveScreenshot('audit-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });
});
