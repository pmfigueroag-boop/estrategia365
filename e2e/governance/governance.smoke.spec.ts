import { test, expect } from '@playwright/test';

test.describe('Governance Module - Smoke Tests', () => {
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
            { id: 1, created_at: '2026-06-01T12:00:00Z', actor: 'pmfig', action: 'APPROVE', entity: 'Strategic Plan', entity_id: 1, hash_signature: 'ab12c34d' },
            { id: 2, created_at: '2026-06-02T12:00:00Z', actor: 'system', action: 'VERIFY', entity: 'Kernel', entity_id: null, hash_signature: 'ef56g78h' }
          ]
        }
      });
    });

    await page.route(/\/strategy\/kernel\/.*\/history/, async route => {
      await route.fulfill({
        status: 200,
        json: [
          { version: '3.1.0', created_at: '2026-06-01T00:00:00Z', diagnosis: 'Stability confirmed', confidence_score: 0.96, decision_count: 15 }
        ]
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

    // Mock specific subcomponent calls to avoid failures when switching tabs
    await page.route(/\/budget\//, async route => {
      await route.fulfill({ status: 200, json: { budget: { state: 'GREEN', utilization_pct: 25 }, usage: {} } });
    });

    await page.route(/\/maturity\//, async route => {
      await route.fulfill({ status: 200, json: { score: 85, dimensions: [] } });
    });

    await page.route(/\/reasoning-history/, async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route(/\/bad-strategy-detector/, async route => {
      await route.fulfill({ status: 200, json: { score: 90, findings: [] } });
    });

    await page.route(/\/telemetry\/stats/, async route => {
      await route.fulfill({ status: 200, json: { modules: [{ name: 'Strategy', score: 95 }] } });
    });
  });

  test('should load Governance view and cycle through all tabs without crashing', async ({ page }) => {
    // Navigate to governance
    await page.goto('/governance');

    // Wait for the banner to be visible meaning the page loaded and audit trail resolved
    await expect(page.getByText('Cadena SHA-256: VÁLIDA')).toBeVisible({ timeout: 10000 });

    // The default tab should be 'ai-budget' (Presupuesto IA)
    await expect(page.getByText('Saludable')).toBeVisible();

    // 1. Switch to Quality Gate
    await page.getByRole('button', { name: '🛡️ Quality Gate' }).click();
    await expect(page.getByRole('heading', { name: '🛡️ Quality Gate' })).toBeVisible();

    // 2. Switch to Maturity
    await page.getByRole('button', { name: '🧠 Madurez IA' }).click();
    await expect(page.getByText('Score global')).toBeVisible();

    // 3. Switch to Reasoning
    await page.getByRole('button', { name: '🔗 Razonamiento' }).click();
    await expect(page.getByRole('heading', { name: '🔗 Cadena de Razonamiento (CoT)' })).toBeVisible();

    // 4. Switch to Audit
    await page.getByRole('button', { name: '📋 Auditoría (2)' }).click();
    await expect(page.getByText('Registro Forense (Event Sourcing)')).toBeVisible();
    await expect(page.getByText('pmfig')).toBeVisible();

    // 5. Switch to History
    await page.getByRole('button', { name: '📜 Historial Kernel' }).click();
    await expect(page.getByText('📜 Historial de Versiones del Kernel')).toBeVisible();
    await expect(page.getByText('v3.1.0')).toBeVisible();

    // 6. Switch to Exports
    await page.getByRole('button', { name: '📥 Exportaciones' }).click();
    await expect(page.getByText('Plan Estratégico Institucional (PEI)')).toBeVisible();

    // 7. Switch to Security
    await page.getByRole('button', { name: '🔐 Seguridad' }).click();
    await expect(page.getByText('🔐 SSO/SAML — CONFIGURED')).toBeVisible();

    // Test verifying the chain
    await page.getByRole('button', { name: '🔄 Re-Verificar' }).click();
    await expect(page.getByText('Cadena verificada: Integridad Criptográfica 100%')).toBeVisible();
  });
});
