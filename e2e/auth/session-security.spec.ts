import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth';

test.describe('E2E 09: Session Security & Logout Invalidation', () => {
  test('@synthetic [Login] Session is properly invalidated upon logout preventing back-navigation', async ({ page }) => {
    // 1. Login
    await loginAs(page, 'session_user@example.com', 'Pass123!');

    // 2. Navigate to a protected route
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

    // 3. Logout
    await logout(page);

    // 4. Verify redirected to login
    await expect(page).toHaveURL(/.*\/auth\/login/);

    // 5. Attempt to use browser back button to return to dashboard
    await page.goBack();

    // 6. Wait and verify that the app redirects back to login or shows 401
    // The Frontend should either detect no JWT and redirect, or the backend should reject the API call causing a redirect
    await page.waitForTimeout(1000); // give it a moment to check auth state
    
    const isLogin = page.url().includes('/auth/login');
    const isUnauthorized = await page.getByText(/401|No autorizado|Inicia sesión/i).isVisible();
    
    expect(isLogin || isUnauthorized).toBeTruthy();
    
    // Explicitly verify we don't see dashboard data
    await expect(page.getByTestId('dashboard-metrics')).toBeHidden();
  });
});
