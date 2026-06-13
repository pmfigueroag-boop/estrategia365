/**
 * Estrategia 365 — E2E: Onboarding Full Flows
 * ========================================================================
 * Complete browser-based test of the 11-step onboarding flow.
 * Validates: full happy path, resume flow from DB, and error handling.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('e365_access_token', 'fake-token');
    window.localStorage.setItem('e365_refresh_token', 'fake-refresh-token');
  });

  page.on('console', msg => console.log(`Browser console: ${msg.type()} - ${msg.text()}`));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`API Error: ${response.request().method()} ${response.url()} returned ${response.status()}`);
    }
  });

  await page.route('**/auth/me', async route => {
    await route.fulfill({ status: 200, json: { id: 1, email: 'admin@estrategia365.local', role: 'admin' } });
  });

  await page.route('**/health', async route => {
    await route.fulfill({ status: 200, json: { status: 'ok' } });
  });

  await page.route('**/institutions/workspace/summary', async route => {
    await route.fulfill({ status: 200, json: [] });
  });

  // Prevent auto-refresh 401 cascades
  await page.route('**/auth/refresh', async route => {
    await route.fulfill({ status: 200, json: { access_token: 'fake-token', refresh_token: 'fake-refresh' } });
  });
});

test.describe('Onboarding — Full Happy Path', () => {
  test('Completes all 11 steps and redirects to select-plan', async ({ page }) => {
    // 1. Intercept API calls to prevent DB pollution and speed up test
    await page.route('**/v1/onboarding/progress', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.continue();
      } else if (route.request().method() === 'GET') {
        await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      } else {
        await route.fulfill({ status: 200, json: { status: 'saved' } });
      }
    });

    await page.route('**/v1/institutions/', async (route) => {
      // The API exactly calls /v1/institutions/ (with trailing slash)
      if (route.request().method() === 'OPTIONS') {
        await route.continue();
      } else if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { id: 999, name: 'E2E Corp' } });
      } else {
        await route.continue();
      }
    });

    await page.route('**/v1/institutions/999', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.continue();
      } else {
        await route.fulfill({ status: 200, json: { id: 999, name: 'E2E Corp' } });
      }
    });

    await page.route('**/v1/plans/*', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.continue();
      } else if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { id: 888, status: 'active' } });
      } else {
        await route.continue();
      }
    });

    await page.route('**/v1/stakeholders/*', async (route) => {
      if (route.request().method() === 'OPTIONS') { await route.continue(); }
      else { await route.fulfill({ status: 200, json: [] }); }
    });

    await page.route('**/v1/institutions/*/maturity', async (route) => {
      if (route.request().method() === 'OPTIONS') { await route.continue(); }
      else { await route.fulfill({ status: 200, json: { level: 1 } }); }
    });

    await page.route('**/v1/twin/*', async (route) => {
      if (route.request().method() === 'OPTIONS') { await route.continue(); }
      else { await route.fulfill({ status: 200, json: { health: 100 } }); }
    });

    // Go to onboarding directly
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('domcontentloaded');

    // STEP 1: Identidad
    await expect(page.locator('h1')).toContainText('Onboarding Institucional', { timeout: 15000 });
    await page.locator('input[name="name"]').fill('E2E Corp');
    await page.getByRole('button', { name: /Sector Privado/i }).click();
    await page.locator('select[name="industry"]').selectOption('Tecnología');
    await page.locator('select[name="size"]').selectOption('pyme');
    await page.getByRole('button', { name: /siguiente/i }).click();

    // STEP 2: Misión
    await expect(page.locator('h2')).toContainText('Fundamento Estratégico');
    await page.locator('textarea[name="mission"]').fill('Misión E2E');
    await page.getByRole('button', { name: /siguiente/i }).click();

    // STEP 3: Contexto
    await expect(page.locator('h2')).toContainText('Contexto Estratégico');
    await page.locator('textarea[name="description"]').fill('E2E testing description');
    await page.getByRole('button', { name: /Guardar y Continuar/i }).click();

    // The component might wait for the API here, wait for next step
    await expect(page.locator('h2')).toContainText('Partes Interesadas');

    // STEPS 4-9: Fast-forward through optional entity steps
    for (let i = 4; i < 10; i++) {
      await page.getByRole('button', { name: /siguiente/i }).click();
    }

    // STEP 10: Summary
    await page.getByRole('button', { name: /crear plan/i }).click();

    // STEP 11: Plan
    await expect(page.locator('h2')).toContainText('Configuración del Plan Estratégico');
    await page.getByRole('button', { name: /completar/i }).click();

    // Validate Redirection
    await page.waitForURL('**/analysis');
    expect(page.url()).toContain('/analysis');
  });
});

test.describe('Onboarding — Resume Flow', () => {
  test('Loads directly into Step 4 with pre-filled data', async ({ page }) => {
    // Intercept to return existing progress
    await page.route('**/v1/onboarding/progress', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: {
            current_step: 4,
            institution_id: 123,
            form_data: JSON.stringify({ name: 'Resumed Corp' })
          }
        });
      } else {
        await route.fulfill({ status: 200, json: {} });
      }
    });

    await page.route('**/v1/institutions/123', async (route) => {
      await route.fulfill({ status: 200, json: { id: 123, name: 'Resumed Corp', tier: 'premium' } });
    });
    
    // Mock other entity endpoints returning empty to avoid 404s/401s
    await page.route('**/v1/governance/**', async (route) => route.fulfill({ status: 200, json: [] }));
    await page.route('**/v1/risk-culture/**', async (route) => route.fulfill({ status: 200, json: [] }));
    await page.route('**/v1/operations/**', async (route) => route.fulfill({ status: 200, json: [] }));
    await page.route('**/v1/documents/**', async (route) => route.fulfill({ status: 200, json: [] }));
    await page.route('**/v1/stakeholders/**', async (route) => route.fulfill({ status: 200, json: [] }));

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('domcontentloaded');

    // Should be on Step 4
    await expect(page.locator('h2')).toContainText('Partes Interesadas', { timeout: 15000 });
    
    // Go back to Step 1 to verify data
    // Use precise locator to avoid strict mode violation with menu buttons
    await page.locator('button[title="Identidad"]').click();
    await expect(page.locator('input[name="name"]')).toHaveValue('Resumed Corp');
  });
});

test.describe('Onboarding — Error Handling', () => {
  test('Handles auto-save failures gracefully without crashing', async ({ page }) => {
    // Intercept and force a 500 error on sync
    await page.route('**/v1/onboarding/progress', async (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
        await route.fulfill({ status: 500, json: { detail: 'Internal Server Error' } });
      } else {
        await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      }
    });

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('domcontentloaded');

    const nameInput = page.locator('input[name="name"]');
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });
    await nameInput.fill('Error Corp');
    await page.locator('select[name="industry"]').selectOption({ index: 1 });
    await page.locator('select[name="size"]').selectOption({ index: 1 });
    
    // Click next. This triggers syncProgress, which fails with 500.
    // The UI should still navigate because syncProgress is fire-and-forget in page 1.
    await page.getByRole('button', { name: /siguiente/i }).click();
    
    // UI should advance to Step 2
    await expect(page.locator('h2')).toContainText('Fundamento Estratégico');
  });
});
