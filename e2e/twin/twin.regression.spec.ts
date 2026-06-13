import { test, expect } from '@playwright/test';

test.describe('Digital Twin Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/twin/1/health', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          completeness: { overall: 85, data_quality: 90, alignment: 80, execution: 70 },
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
          { recorded_at: '2026-01-01T10:00:00Z', value: 80 },
          { recorded_at: '2026-01-02T10:00:00Z', value: 85 }
        ]) 
      });
    });

    // Auth context
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_institution_id', '1');
    });
  });

  test('should match visual baseline for Digital Twin View', async ({ page }) => {
    await page.goto('/twin');
    
    // Wait for data to load and render
    await page.waitForSelector('text=Completitud General');
    await page.waitForSelector('text=data quality');
    await page.waitForTimeout(1000); // Allow animations/graphs to settle

    // Hide the chart area if it fluctuates, but since it's an AreaChart with static data, it should be fine.
    // Recharts draws `<path>` elements which are deterministic for static data.
    
    await expect(page).toHaveScreenshot('twin-dashboard-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });
});
