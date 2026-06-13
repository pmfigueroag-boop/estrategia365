import { test, expect } from '@playwright/test';

test.describe('Hoshin Kanri Module - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    const fullPayload = {
      stats: { total_objectives: 10, breakthroughs: 3, fundamentals: 7, total_cells: 20, strong_correlations: 8 },
      summary: 'Ser la plataforma líder global en 3 años.',
      north: [
        { id: 'n1', title: 'Expansión Internacional', catchball_status: 'agreed', progress_pct: 45, current_value: 4.5, target_value: 10, unit: 'M', owner: 'CEO' }
      ],
      west: [
        { id: 'w1', title: 'Abrir 5 oficinas nuevas', catchball_status: 'negotiating', progress_pct: 20, current_value: 1, target_value: 5, unit: 'offices', owner: 'COO' }
      ],
      cells: [
        { id: 'c1', correlation: 'strong', quadrant_pair: 'north-west', notes: 'Dependencia crítica' }
      ]
    };

    await page.route('**/v1/hoshin/plan-123/x-matrix', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fullPayload) });
    });
    await page.route('**/v1/hoshin/plan-123/catchball', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/v1/hoshin/plan-123/cascade', async route => {
      await route.fulfill({ 
        status: 200, contentType: 'application/json', 
        body: JSON.stringify({ 
          alignment: { agreed_pct: 80, total_objectives: 5, negotiating_count: 2, fully_deployed: true },
          cascade: { corporate: [{ id: 10, title: 'Corporate Obj 1', progress_pct: 50, owner: 'CEO' }] }
        }) 
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Hoshin Kanri X-Matrix View', async ({ page }) => {
    await page.goto('/hoshin');
    
    // Wait for data to load and render
    await page.waitForSelector('text=Ser la plataforma líder global en 3 años.');
    await page.waitForSelector('text=Expansión Internacional');
    await page.waitForTimeout(1000); // Allow animations/graphs to settle

    await expect(page).toHaveScreenshot('hoshin-xmatrix-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });

  test('should match visual baseline for Hoshin Kanri Cascade View', async ({ page }) => {
    await page.goto('/hoshin');
    await page.waitForSelector('text=Ser la plataforma líder global en 3 años.');
    
    await page.click('button:has-text("Cascada")');
    await page.waitForSelector('text=Corporate Obj 1');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('hoshin-cascade-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });
});
