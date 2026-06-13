import { test, expect } from '@playwright/test';

test.describe('Strategy Core - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    const superPayload = { 
      id: 999, 
      confidence_score: 0.99,
      diagnosis: 'Severe disruption detected in supply chain affecting 40% of operations. A rapid strategic realignment is required.',
      guiding_policy: 'Consolidate providers, leverage vertical integration for critical components, and increase cash reserves by 15%.',
      decisions: [
        { id: 1, title: 'Acquire local supplier Alpha', status: 'proposed', esv: 1500000, risk_level: 'High', effort_months: 6 },
        { id: 2, title: 'Divest from non-core asset Beta', status: 'approved', esv: 800000, risk_level: 'Low', effort_months: 2 },
        { id: 3, title: 'Launch agile task force', status: 'executing', esv: 250000, risk_level: 'Medium', effort_months: 3 },
      ],
      capability_gaps: [
        { id: 1, name: 'M&A Legal Expertise', severity: 'High' }
      ],
      risk_nodes: [
        { id: 1, description: 'Regulatory blockage in acquisition', probability: 0.6, impact: 'Severe' }
      ]
    };

    await page.route('**/v1/strategy/kernel/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(superPayload) });
    });

    await page.route('**/v1/strategy/causal/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ chains: [] }) });
    });

    await page.route('**/v1/strategy/pulse/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ overall_pulse: 85 }]) });
    });

    await page.route('**/v1/strategy/graph/plan-123', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ edges: [] }) });
    });
    
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'fake-token');
      window.localStorage.setItem('current_plan_id', 'plan-123');
    });
  });

  test('should match visual baseline for Strategy Decisions (Main View)', async ({ page }) => {
    await page.goto('/strategy');
    await page.waitForSelector('text=Strategy Decision Core');
    await page.waitForSelector('text=Consolidate providers');
    await page.waitForTimeout(1000); // Allow animations

    await expect(page).toHaveScreenshot('strategy-decisions-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });

  test('should match visual baseline for Portfolio Optimizer View', async ({ page }) => {
    await page.route('**/v1/strategy/optimize/plan-123*', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          optimal_portfolio: [{ id: 2, title: 'Divest from non-core asset Beta' }], 
          rejected: [{ id: 1, title: 'Acquire local supplier Alpha' }],
          metrics: { total_esv: 800000, total_budget: 0, total_people: 10 }
        }) 
      });
    });

    await page.goto('/strategy');
    await page.waitForSelector('text=Strategy Decision Core');
    
    // Click Optimizer Tab
    await page.click('button:has-text("Optimizar")');
    await page.waitForSelector('text=Portfolio Optimizer');

    // Run Optimization to populate tables
    await page.click('button:has-text("Optimizar Portafolio")');
    await page.waitForSelector('text=Divest from non-core asset Beta');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('strategy-optimizer-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });
});
