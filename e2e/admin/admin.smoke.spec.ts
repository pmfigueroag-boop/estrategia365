import { test, expect } from '@playwright/test';

test.describe('Admin Module - Smoke Tests', () => {
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

  test('should render user management and calculate metrics correctly', async ({ page }) => {
    await page.goto('/admin');
    
    // Check header
    await expect(page.getByRole('heading', { name: /Tenant Admin Console/i })).toBeVisible();

    // Check stats bar
    // Users: 4, Admins: 1, Activos: 3, SSO: Activo
    await expect(page.getByText('4', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Activo', { exact: true })).toBeVisible();

    // Ensure we are on the 'users' tab
    await expect(page.getByRole('heading', { name: /Usuarios del Tenant/i })).toBeVisible();
    
    // Check users table content
    await expect(page.getByText('Admin User')).toBeVisible();
    await expect(page.getByText('admin@test.com')).toBeVisible();
    await expect(page.getByText('Strategist User')).toBeVisible();
    await expect(page.getByText('Analyst User')).toBeVisible();
    await expect(page.getByText('Viewer User')).toBeVisible();
    
    // Check role badges
    await expect(page.getByText('ADMIN', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('STRATEGIST', { exact: true }).first()).toBeVisible();

    // Navigate to Roles tab
    await page.getByRole('button', { name: /Roles & Permisos/i }).click();
    await expect(page.getByRole('heading', { name: /Roles & Permisos \(RBAC\)/i })).toBeVisible();
    await expect(page.getByText('Acceso total al sistema')).toBeVisible();

    // Navigate to Usage tab
    await page.getByRole('button', { name: /Uso & Cuotas/i }).click();
    await expect(page.getByRole('heading', { name: /Uso del Período Actual/i })).toBeVisible();
    await expect(page.getByText('45%')).toBeVisible(); // Gauge value

    // Navigate to SSO tab
    await page.getByRole('button', { name: /SSO Config/i }).click();
    await expect(page.getByRole('heading', { name: /Single Sign-On \(SSO\/OIDC\)/i })).toBeVisible();
    await expect(page.getByText('Google Workspace', { exact: true })).toBeVisible();
    await expect(page.getByText('Microsoft Entra ID', { exact: true })).toBeVisible();
  });
});
