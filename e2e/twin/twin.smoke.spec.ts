import { test, expect } from '@playwright/test';

test.describe('Digital Twin Module - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept SWR hooks for Twin
    await page.route('**/v1/twin/1/health', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          completeness: { overall: 85, data_quality: 90, alignment: 80 },
          trend: { direction: 'up', delta: 2.5 }
        }) 
      });
    });

    await page.route('**/v1/twin/1/snapshots?limit=20&offset=0', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([
          { id: 'snap-1', version: 1, trigger: 'manual', captured_at: '2026-01-01T10:00:00Z', completeness_score: 85 }
        ]) 
      });
    });

    await page.route('**/v1/twin/1/timeline?days=90', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([
          { id: 'evt-1', event_type: 'strategic_shift', severity: 'medium', occurred_at: '2026-01-01T10:00:00Z', snapshot_version: 1, description: 'Shift in policy' }
        ]) 
      });
    });

    await page.route('**/v1/twin/1/metrics/completeness.overall', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([
          { recorded_at: '2026-01-01T10:00:00Z', value: 85 }
        ]) 
      });
    });

    // Mock snapshot capture POST
    await page.route('**/v1/twin/1/snapshot', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'snap-2', version: 2 }) });
    });

    // Auth context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_institution_id', '1');
    });
  });

  test('should load digital twin view and display overall health', async ({ page }) => {
    await page.goto('/twin');
    
    // Verify header
    await expect(page.getByRole('heading', { name: /Digital Twin/i })).toBeVisible();

    // Verify KPI loaded
    await expect(page.locator('text=85%').first()).toBeVisible();
    await expect(page.locator('text=Completitud General')).toBeVisible();
    
    // Verify Snapshot history
    await expect(page.locator('text=v1').first()).toBeVisible();
    await expect(page.locator('text=manual').first()).toBeVisible();
    
    // Verify Timeline
    await expect(page.locator('text=strategic shift').first()).toBeVisible();
  });
});
