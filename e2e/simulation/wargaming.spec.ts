import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { switchTenant } from '../helpers/tenant';
import { runSimulation } from '../helpers/flows';

test.describe('E2E Simulation (Wargaming)', () => {
  test('User runs a simulation and views AI generated results', async ({ page }) => {
    // 1. Mock the AI backend route to prevent flakiness and save LLM costs during CI/CD
    await page.route('**/api/v1/simulations/run', async route => {
      const json = {
        status: 'success',
        scenario: 'Escenario Pesimista Inflacionario',
        results: {
          revenue_impact: '-15%',
          recommended_actions: [
            'Acelerar recortes de CAPEX',
            'Congelar contrataciones'
          ]
        }
      };
      await route.fulfill({ json, status: 200 });
    });

    // 2. Login
    await loginAs(page, 'planner@example.com', 'Pass123!');
    await switchTenant(page, 'E2E Tenant A');

    // 3. Run flow
    await runSimulation(page, 'Escenario Pesimista Inflacionario');

    // 4. Verify the mocked AI results are rendered in the UI
    await expect(page.getByText('-15%')).toBeVisible();
    await expect(page.getByText('Congelar contrataciones')).toBeVisible();
  });
});
