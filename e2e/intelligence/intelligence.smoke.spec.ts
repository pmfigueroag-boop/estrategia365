import { test, expect } from '@playwright/test';

test.describe('Intelligence Hub - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock all backend requests to return 200 by default (prevents SWR 401 retries)
    await page.route('**/v1/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    // 2. Mock specific responses
    await page.route('**/v1/intelligence/*/summary*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        coverage: { pct: 85 },
        analyses: {
          pestel: { freshness: 'fresh', count: 12, age_days: 2 }
        },
        twin_health: {
          current_completeness: { overall: 90 },
          total_snapshots: 5,
          total_events: 100
        }
      }) });
    });

    await page.route('**/v1/intelligence/*/gaps*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        gaps: [
          { analysis: 'porter', severity: 'high', reason: 'Falta escaneo de competidores', action: 'run_scan' }
        ]
      }) });
    });

    await page.route('**/v1/intelligence/*/recommendations*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        recommendations: [
          { analysis: 'swot', priority: 'critical', recommendation: 'Actualizar debilidades', trigger: 'twin_change' }
        ]
      }) });
    });

    // 3. Set localStorage to bypass login
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-jwt-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should render Intelligence Hub and display all sections', async ({ page }) => {
    await page.goto('/intelligence');
    
    // Wait for the title
    await expect(page.locator('h1')).toHaveText('Intelligence Hub', { timeout: 10000 });
    
    // Check Coverage Matrix
    await expect(page.getByText('📋 Matriz de Cobertura')).toBeVisible();
    await expect(page.getByText('PESTEL')).toBeVisible();
    await expect(page.getByText('Fresco')).toBeVisible();
    
    // Check Recommendations
    await expect(page.getByText('💡 Recomendaciones')).toBeVisible();
    await expect(page.getByText('Actualizar debilidades')).toBeVisible();
    
    // Check Gaps
    await expect(page.getByText('⚠️ Brechas de Inteligencia')).toBeVisible();
    await expect(page.getByText('Falta escaneo de competidores')).toBeVisible();

    // Check Twin Health
    await expect(page.getByText('🏥 Salud del Digital Twin')).toBeVisible();
    await expect(page.getByText('90%')).toBeVisible();
  });

  test('should render gracefully when API returns empty arrays', async ({ page }) => {
    // Override with empty mocks
    await page.route('**/v1/intelligence/*/summary*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });
    await page.route('**/v1/intelligence/*/gaps*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ gaps: [] }) });
    });
    await page.route('**/v1/intelligence/*/recommendations*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recommendations: [] }) });
    });

    await page.goto('/intelligence');
    
    await expect(page.getByText('No hay brechas de inteligencia — todos los análisis están al día')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Cobertura completa — sin brechas detectadas')).toBeVisible();
  });
});
