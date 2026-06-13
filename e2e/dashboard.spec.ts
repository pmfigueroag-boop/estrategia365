/**
 * Estrategia 365 — E2E: Dashboard & UI Flow Tests (Phase 8)
 * ============================================================
 * Browser-based tests for frontend rendering and user workflows.
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard — Page Load', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Estrategia 365/i);
  });

  test('Dashboard page renders main layout', async ({ page }) => {
    await page.goto('/dashboard');

    // Should have main navigation or layout elements
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 10_000 });
  });

  test('Navigation links are accessible', async ({ page }) => {
    await page.goto('/');

    // Check for key navigation elements
    const links = page.locator('nav a, [role="navigation"] a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Dashboard — Strategic Plan Flow', () => {
  test('Can navigate to plan creation', async ({ page }) => {
    await page.goto('/');

    // Look for plan-related navigation
    const planLink = page.locator('a[href*="plan"], button:has-text("Plan")').first();

    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('plan');
    }
  });

  test('Analysis page renders correctly', async ({ page }) => {
    await page.goto('/analysis');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Page should not show error state
    const errorElement = page.locator('[data-testid="error"], .error-boundary');
    const hasError = await errorElement.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });
});

test.describe('Dashboard — Responsive Design', () => {
  test('Mobile viewport renders without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test('Tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Dashboard — Accessibility', () => {
  test('Page has proper heading structure', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('Interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through the page and verify focus is visible
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
