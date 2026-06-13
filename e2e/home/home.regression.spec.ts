import { test, expect } from '@playwright/test';

test.describe('Home Page (Visual Regression)', () => {
  const mockProjects = [
    {
      id: 1,
      name: 'Global Corp',
      sector: 'private',
      document_count: 5,
      plans: [
        { id: 101, paradigm_id: 'competitive', has_kernel: true, confidence: 0.85, decision_count: 10 }
      ]
    },
    {
      id: 2,
      name: 'Ministry of Education',
      sector: 'public',
      document_count: 0,
      plans: []
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Inject exact state to avoid flakiness in snapshots
    await page.addInitScript(() => {
      window.localStorage.setItem('e365_access_token', 'reg-token');
      window.localStorage.setItem('e365_refresh_token', 'reg-refresh');
      window.localStorage.setItem('current_institution_id', '1');
    });

    await page.route('**/auth/me', async route => {
      await route.fulfill({ json: { id: 1, email: 'reg@test.com', role: 'admin' } });
    });
    
    // Serve consistent mock data so the visual render is always identical
    await page.route('**/workspace/summary', async route => {
      await route.fulfill({ json: mockProjects });
    });

    // Remove CSS animations for deterministic snapshots
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
  });

  test('La estructura visual del Layout debe mantenerse exacta (Screenshot)', async ({ page }) => {
    await page.goto('/');

    // Wait for the grid to render completely
    await expect(page.getByText('10 decisiones')).toBeVisible();

    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('home-layout-grid.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // 5% tolerance for minor anti-aliasing variations
    });
  });

  test('El estado vacío (Empty State) debe mantenerse visualmente intacto', async ({ page }) => {
    await page.route('**/workspace/summary', async route => {
      await route.fulfill({ json: [] });
    });

    await page.goto('/');

    await expect(page.getByText('Sin proyectos todavía')).toBeVisible();

    await expect(page).toHaveScreenshot('home-layout-empty.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
