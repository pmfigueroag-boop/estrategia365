import { test, expect } from '@playwright/test';

test.describe('Audit Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage for context
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('e365_access_token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', '1');
      window.localStorage.setItem('institution_id', '1');
    });

    // Mock Audit API call
    await page.route(/\/audit-trail/, async route => {
      await route.fulfill({
        status: 200,
        json: {
          is_valid: true,
          logs: [
            { id: 1, created_at: '2026-06-01T12:00:00Z', actor: 'pmfig', action: 'CREATE', entity: 'Strategic Plan', entity_id: 1, hash_signature: 'ab12c34def567890ab12c34def567890' },
            { id: 2, created_at: '2026-06-01T12:15:00Z', actor: 'pmfig', action: 'UPDATE', entity: 'Objective', entity_id: 45, hash_signature: 'cd34e56fgh789012cd34e56fgh789012' },
            { id: 3, created_at: '2026-06-02T12:00:00Z', actor: 'system', action: 'VERIFY', entity: 'Kernel', entity_id: null, hash_signature: 'ef56g78hijklmnopqrs1234567890abc' }
          ]
        }
      });
    });
  });

  test('should load Audit view, calculate metrics and display table correctly', async ({ page }) => {
    await page.goto('/audit');

    // Headers
    await expect(page.getByRole('heading', { name: 'Compliance & Auditoría' })).toBeVisible();

    // Verification banner
    await expect(page.getByRole('heading', { name: 'Estado de Cadena SHA-256' })).toBeVisible();
    await expect(page.getByText('VÁLIDA', { exact: true })).toBeVisible();

    // Metrics calculation checks
    // We expect 3 total events, 2 human, 1 system.
    // The ul > li structure contains <span>Total Eventos:</span> <strong>3</strong>
    // Let's find the strong tags that follow the specific spans or just check by text.
    await expect(page.locator('li').filter({ hasText: 'Total Eventos:' }).getByText('3')).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Firma Humana:' }).getByText('2')).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Firma Sistema:' }).getByText('1')).toBeVisible();

    // Table checks
    await expect(page.getByRole('heading', { name: 'Registro Forense (Event Sourcing)' })).toBeVisible();
    await expect(page.getByText('pmfig').first()).toBeVisible();
    await expect(page.getByText('system')).toBeVisible();
    await expect(page.getByText('Strategic Plan #1')).toBeVisible();
    await expect(page.getByText('ab12c34def567890...')).toBeVisible();

    // Interactive element - Verify button
    await page.getByRole('button', { name: '🔄 Re-Verificar Hashes' }).click();
    
    // Toast appears
    await expect(page.getByText('Cadena verificada: Integrad Criptográfica 100%')).toBeVisible();
  });
});
