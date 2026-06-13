import { test, expect } from '@playwright/test';

test.describe('Admin Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage for context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'mock_token');
      window.localStorage.setItem('tenant_id', '1');
    });

    // Mock Admin core API calls
    await page.route(/\/tenant\/members/, async route => {
      await route.fulfill({
        status: 200,
        json: [
          { id: 1, full_name: 'Admin User', email: 'admin@test.com', role: 'admin', is_active: true, sso_provider: null, last_login: '2026-06-01T10:00:00Z' },
          { id: 2, full_name: 'Strategist User', email: 'strat@test.com', role: 'strategist', is_active: true, sso_provider: 'google', last_login: '2026-06-02T11:00:00Z' },
          { id: 3, full_name: 'Analyst User', email: 'analyst@test.com', role: 'analyst', is_active: true, sso_provider: 'microsoft', last_login: '2026-06-03T12:00:00Z' },
          { id: 4, full_name: 'Viewer User', email: 'viewer@test.com', role: 'viewer', is_active: false, sso_provider: null, last_login: '2026-06-04T13:00:00Z' }
        ]
      });
    });

    await page.route(/\/ai-governance\/budget\/1/, async route => {
      await route.fulfill({
        status: 200,
        json: { utilization_pct: 45 }
      });
    });

    await page.route(/\/auth\/sso\/providers/, async route => {
      await route.fulfill({
        status: 200,
        json: [
          { name: 'google', display_name: 'Google Workspace', enabled: true, login_url: '/auth/login/google', icon: '🇬' },
          { name: 'microsoft', display_name: 'Microsoft Entra ID', enabled: false, icon: 'Ⓜ️' }
        ]
      });
    });
  });

  test('admin dashboard visual match (users tab)', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for the data to be loaded
    await expect(page.getByRole('heading', { name: /Usuarios del Tenant/i })).toBeVisible();

    // Disable animations to avoid flakiness
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });

    // Capture visual regression of the default tab (Users)
    await expect(page).toHaveScreenshot('admin-dashboard-users.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });
});
