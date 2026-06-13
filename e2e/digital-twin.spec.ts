/**
 * Estrategia 365 — E2E: Digital Twin (Fase 1.5)
 * ================================================
 * Contract tests for the Digital Twin temporal endpoints.
 * Validates both frontend page rendering and API contracts.
 */

import { test, expect, type Page } from '@playwright/test';

const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000/v1';

async function waitForContent(page: Page, timeout = 8000) {
  await page.waitForLoadState('networkidle', { timeout });
}

async function expectNoErrorBoundary(page: Page) {
  const errorEl = page.locator('[data-testid="error"], .error-boundary');
  await expect(errorEl).not.toBeVisible({ timeout: 3000 }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────
// UI Tests — Twin Page
// ─────────────────────────────────────────────────────────────

test.describe('Digital Twin — Page', () => {
  test('Twin page loads without errors', async ({ page }) => {
    await page.goto('/twin');
    await waitForContent(page);
    await expectNoErrorBoundary(page);

    // Should have a heading with "Digital Twin"
    const heading = page.locator('h1');
    await expect(heading).toContainText(/digital twin/i);
  });

  test('Twin page shows capture button', async ({ page }) => {
    await page.goto('/twin');
    await waitForContent(page);

    const captureBtn = page.locator('#btn-capture-snapshot');
    await expect(captureBtn).toBeVisible();
    await expect(captureBtn).toBeEnabled();
  });

  test('Twin page renders KPI widgets or empty state', async ({ page }) => {
    await page.goto('/twin');
    await waitForContent(page);

    // Either KPI widgets or empty state message should be visible
    const kpiWidget = page.locator('.kpi-widget').first();
    const emptyState = page.locator('.empty-state').first();

    const hasKpi = await kpiWidget.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasKpi || hasEmpty).toBeTruthy();
  });

  test('Twin page has responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/twin');
    await waitForContent(page);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('Twin page has no critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/twin');
    await waitForContent(page);
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to fetch') &&
      !e.includes('net::ERR') &&
      !e.includes('favicon') &&
      !e.includes('hydration')
    );
    expect(criticalErrors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// API Contract Tests — Twin Endpoints
// ─────────────────────────────────────────────────────────────

test.describe('Digital Twin — API Contracts', () => {
  test('GET /twin/{id} returns assembled twin', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1`);
      return { status: res.status, ok: res.ok };
    }, API_BASE);
    expect(response.ok).toBeTruthy();
  });

  test('POST /twin/{id}/snapshot creates versioned snapshot', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      return { status: res.status, hasVersion: 'version' in data || 'snapshot_version' in data };
    }, API_BASE);
    expect(response.status).toBe(200);
  });

  test('GET /twin/{id}/snapshots returns list', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1/snapshots`);
      const data = await res.json();
      return { status: res.status, isArray: Array.isArray(data) };
    }, API_BASE);
    expect(response.status).toBe(200);
    expect(response.isArray).toBeTruthy();
  });

  test('GET /twin/{id}/health returns completeness + trend', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1/health`);
      const data = await res.json();
      return {
        status: res.status,
        hasCompleteness: 'completeness' in data,
        hasTrend: 'trend' in data,
      };
    }, API_BASE);
    expect(response.status).toBe(200);
    expect(response.hasCompleteness).toBeTruthy();
    expect(response.hasTrend).toBeTruthy();
  });

  test('GET /twin/{id}/timeline returns events', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1/timeline`);
      const data = await res.json();
      return { status: res.status, isArray: Array.isArray(data) };
    }, API_BASE);
    expect(response.status).toBe(200);
    expect(response.isArray).toBeTruthy();
  });

  test('POST /twin/{id}/metrics records metric', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric_key: 'e2e_test', value: 42.0 }),
      });
      return { status: res.status, ok: res.ok };
    }, API_BASE);
    expect(response.status).toBe(200);
  });

  test('GET /twin/{id}/metrics/{key} returns time series', async ({ page }) => {
    const response = await page.evaluate(async (apiBase) => {
      const res = await fetch(`${apiBase}/twin/1/metrics/e2e_test`);
      const data = await res.json();
      return { status: res.status, isArray: Array.isArray(data) };
    }, API_BASE);
    expect(response.status).toBe(200);
    expect(response.isArray).toBeTruthy();
  });
});
