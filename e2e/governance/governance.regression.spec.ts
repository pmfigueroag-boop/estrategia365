import { test, expect } from '@playwright/test';

test.describe('Governance Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage for context
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', '1');
      window.localStorage.setItem('institution_id', '1');
    });

    // Mock Governance core API calls
    await page.route(/\/audit-trail/, async route => {
      await route.fulfill({
        status: 200,
        json: {
          is_valid: true,
          logs: [
            { id: 1, created_at: '2026-06-01T12:00:00Z', actor: 'pmfig', action: 'APPROVE', entity: 'Strategic Plan', entity_id: 1, hash_signature: 'ab12c34def567890ab12c34def567890' },
            { id: 2, created_at: '2026-06-02T12:00:00Z', actor: 'system', action: 'VERIFY', entity: 'Kernel', entity_id: null, hash_signature: 'ef56g78hijklmnopqrs1234567890abc' }
          ]
        }
      });
    });

    await page.route(/\/strategy\/kernel\/.*\/history/, async route => {
      await route.fulfill({
        status: 200,
        json: []
      });
    });

    await page.route(/\/strategy\/kernel\/.*\/status/, async route => {
      await route.fulfill({
        status: 200,
        json: { status: 'active', version: '3.1.0' }
      });
    });

    await page.route(/\/sso\/status/, async route => {
      await route.fulfill({
        status: 200,
        json: {
          sso_status: 'CONFIGURED',
          detail: 'SAML 2.0 active for gov domain',
          supported_protocols: ['SAML 2.0', 'OIDC'],
          supported_providers: ['Microsoft Entra ID', 'Okta']
        }
      });
    });
  });

  test('should match visual baseline for Governance Dashboard (Audit/Security)', async ({ page }) => {
    // Load page and navigate to Audit tab (avoids visual flakiness of animations from charts in default tab)
    await page.goto('/governance');
    
    // Switch to Audit tab to have a static table for regression
    await page.getByRole('button', { name: '📋 Auditoría (2)' }).click();
    
    // Wait for the table to appear and stabilize
    await expect(page.getByText('Registro Forense (Event Sourcing)')).toBeVisible();
    await expect(page.getByText('pmfig')).toBeVisible();

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
    await expect(page).toHaveScreenshot('governance-audit-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });
});
