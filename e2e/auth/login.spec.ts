import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000';

test.describe('Login & Authentication Flows', () => {
  const TEST_EMAIL = `test_e2e_${Date.now()}@example.com`;
  const TEST_PASSWORD = 'Password123!';

  test.beforeAll(async ({ request }) => {
    // Attempt to register a user for testing
    await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        full_name: 'E2E User',
        role: 'strategist'
      }
    });
  });

  // E2E 01 — Login exitoso con credenciales válidas
  test('E2E 01: Successful login with valid credentials', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    
    // Verify we are either in dashboard or tenant selection
    await expect(page).toHaveURL(/.*(dashboard|select-tenant|institutions)/);
    
    // Verify LocalStorage contains tokens
    const tokens = await page.evaluate(() => {
      return {
        access: localStorage.getItem('e365_access_token'),
        refresh: localStorage.getItem('e365_refresh_token')
      };
    });
    
    expect(tokens.access).toBeTruthy();
    expect(tokens.refresh).toBeTruthy();
  });

  // E2E 02 — Login fallido por credenciales incorrectas
  test('E2E 02: Failed login due to incorrect credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('#login-email').fill(TEST_EMAIL);
    await page.locator('#login-password').fill('WrongPassword!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Verify error message
    await expect(page.getByText(/incorrecto|inválido/i)).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/); // Should not redirect
  });

  // E2E 03 — Login con usuario inactivo (Bloqueo por backend)
  test('E2E 03: Inactive user block', async ({ page }) => {
    // Intercept login request to mock an inactive user response
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 403,
        json: { detail: 'Account inactive or disabled.' }
      });
    });

    await page.goto('/login');
    await page.locator('#login-email').fill('inactive@example.com');
    await page.locator('#login-password').fill('Password123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/inactive|disabled/i)).toBeVisible();
  });

  // E2E 04 — Login con múltiples tenants (Validación de pantalla /select-tenant)
  // Covered partially by 01, but we can explicitly test multiple tenants if the API supports creating them.
  // For now, we mock the tenant list endpoint to return multiple tenants.
  test('E2E 04: Multi-tenant selection screen', async ({ page }) => {
    // Mock successful login
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        json: { access_token: 'fake-jwt', refresh_token: 'fake-refresh', token_type: 'bearer' }
      });
    });

    // Mock tenant list to return more than 1
    await page.route('**/tenants/me', async route => {
      await route.fulfill({
        status: 200,
        json: [
          { id: 1, name: 'Tenant A' },
          { id: 2, name: 'Tenant B' }
        ]
      });
    });

    await page.goto('/login');
    await page.locator('#login-email').fill('multitenant@example.com');
    await page.locator('#login-password').fill('Pass123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Verify it asks to select tenant
    await expect(page).toHaveURL(/.*\/select-tenant/);
  });

  // E2E 05 — Logout y revocación de token (Verificación de inaccesibilidad)
  test('E2E 05: Logout and token revocation', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    await logout(page);
    
    // Tokens should be gone
    const tokens = await page.evaluate(() => {
      return {
        access: localStorage.getItem('e365_access_token'),
        refresh: localStorage.getItem('e365_refresh_token')
      };
    });
    
    expect(tokens.access).toBeNull();
    expect(tokens.refresh).toBeNull();
  });

  // E2E 06 — Expiración de sesión y revalidación simulada (Intercepción de API a 401)
  test('E2E 06: Session expiration redirects to login', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    
    // Now intercept the next API call and force a 401
    await page.route('**/api/**', async route => {
      // Allow auth/refresh to fail as well to simulate complete expiration
      await route.fulfill({ status: 401, json: { detail: 'Token expired' } });
    });

    await page.goto('/dashboard');
    
    // It should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  // E2E 07 — Refresh Token silencioso válido (Renovación de token)
  test('E2E 07: Silent Refresh Token', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    
    // Delete access token from local storage
    await page.evaluate(() => {
      localStorage.removeItem('e365_access_token');
    });

    // Now reload the page. The app should use refresh_token to get a new access_token
    await page.goto('/select-tenant');
    
    // Wait for the token to be refreshed
    const access = await page.waitForFunction(() => localStorage.getItem('e365_access_token'), { timeout: 5000 });
    expect(access).toBeTruthy(); // Successfully refreshed
  });

  // E2E 08 — Refresh Token inválido o manipulado
  test('E2E 08: Invalid refresh token clears session', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    
    // Replace refresh token with garbage
    await page.evaluate(() => {
      localStorage.setItem('e365_refresh_token', 'garbage-token');
      localStorage.removeItem('e365_access_token');
    });

    await page.goto('/dashboard');
    
    // The refresh will fail and redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  // E2E 09 — Bloqueo por intentos fallidos (Seguridad contra fuerza bruta)
  test('E2E 09: Brute force lockout', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 429,
        json: { detail: 'Too many login attempts. Please try again later.' }
      });
    });

    await page.goto('/login');
    await page.locator('#login-email').fill('brute@example.com');
    await page.locator('#login-password').fill('Pass');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/too many|intentos/i)).toBeVisible();
  });

  // E2E 10 — Recuperación de contraseña -> Login exitoso
  test('E2E 10: Password Recovery Flow', async ({ page }) => {
    await page.goto('/login');
    
    // Click "Forgot password"
    await page.getByText(/olvidaste tu contraseña/i).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);

    // Mock the forgot endpoint
    await page.route('**/auth/forgot', async route => {
      await route.fulfill({ status: 200, json: { detail: 'Recovery email sent' } });
    });

    await page.locator('#recovery-email').fill('test@example.com');
    await page.getByRole('button', { name: /enviar/i }).click();

    await expect(page.getByText(/enviado/i)).toBeVisible();
  });

  // E2E 11 — Validación doctrinal en el login
  test('E2E 11: Doctrinal Gate Validation', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 403,
        json: { detail: 'Tenant locked due to massive doctrinal violations' }
      });
    });

    await page.goto('/login');
    await page.locator('#login-email').fill('doctrinal@example.com');
    await page.locator('#login-password').fill('Pass');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/doctrinal/i)).toBeVisible();
  });

  // E2E 12 — Validación de sesión al recargar la página (Persistencia con F5 / Reload)
  test('E2E 12: Session persists across page reloads', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    
    // Ensure we are inside
    await expect(page).toHaveURL(/.*(dashboard|institutions)/);

    // Hard reload
    await page.reload();

    // Still inside, not redirected to login
    await expect(page).not.toHaveURL(/.*\/login/);
    await expect(page).toHaveURL(/.*(dashboard|institutions)/);
  });

  // E2E 13 — Carga pantalla Login
  test('E2E 13: UI Elements load correctly on login screen', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByText(/Estrategia 365/i).first()).toBeVisible();
  });

  // E2E 14 — Credenciales Vacías
  test('E2E 14: Empty credentials prevent submission', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for load
    await page.waitForSelector('#login-email');

    // Click submit without filling anything
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // The page URL should not change
    await expect(page).toHaveURL(/.*\/login/);
    
    // HTML5 validation check
    const isEmailValid = await page.$eval('#login-email', (el) => (el as HTMLInputElement).checkValidity());
    expect(isEmailValid).toBe(false);
  });

  // E2E 15 — Sin Tenant / Aislamiento
  test('E2E 15: Zero tenants isolation handling', async ({ page }) => {
    // Mock successful login
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        json: { access_token: 'fake-jwt', refresh_token: 'fake-refresh', token_type: 'bearer' }
      });
    });

    // Mock tenant list to return empty array
    await page.route('**/tenants/me', async route => {
      await route.fulfill({
        status: 200,
        json: []
      });
    });

    await page.goto('/login');
    await page.locator('#login-email').fill('notenants@example.com');
    await page.locator('#login-password').fill('Pass123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Verify it navigated to select-tenant and shows the empty state we just built
    await expect(page).toHaveURL(/.*\/select-tenant/);
    await expect(page.getByText(/Sin acceso/i)).toBeVisible();
    await expect(page.getByText(/No tienes ninguna organización/i)).toBeVisible();
  });
});
