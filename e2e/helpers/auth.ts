import { Page, expect } from '@playwright/test';

/**
 * Perform login using the UI.
 * Assumes the existence of /auth/login route with email and password inputs.
 */
export async function loginAs(page: Page, email: string, password: string = 'Password123!') {
  await page.goto('/login');
  
  // Wait for the form to be visible
  await expect(page.getByRole('heading', { name: /estrategia 365/i })).toBeVisible();
  
  // Fill credentials
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  
  // Submit
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  
  // Expect to be redirected to dashboard or onboarding
  await expect(page).toHaveURL(/.*(dashboard|institutions|onboarding|select-tenant|select-plan)/);
}

/**
 * Perform logout using the UI.
 */
export async function logout(page: Page) {
  // Navigate to dashboard where the Header component (and Salir button) is present
  await page.goto('/dashboard');

  // Click the Salir button
  await page.getByRole('button', { name: /cerrar sesión|logout|salir/i }).click();

  // Expect to be back at login
  await expect(page).toHaveURL(/.*login/);
}
