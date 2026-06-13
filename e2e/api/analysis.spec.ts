/**
 * Estrategia 365 — E2E: Analysis Workflow Tests (Phase 8)
 * =========================================================
 * End-to-end tests for AI-powered strategic analysis flows.
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8000';

test.describe('Analysis Workflow — PESTEL', () => {
  test('POST /api/v1/analysis/pestel returns valid analysis', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/analysis/pestel`, {
      data: {
        plan_id: 'e2e-test-plan',
        context: 'Test company in renewable energy sector',
        country: 'DO',
      },
    });

    // AI endpoint may return 200 or 503 if Gemini unavailable
    expect([200, 503]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
      // PESTEL should have 6 dimensions
      const data = body.data;
      const dimensions = ['political', 'economic', 'social', 'technological', 'environmental', 'legal'];
      for (const dim of dimensions) {
        expect(data).toHaveProperty(dim);
      }
    }
  });
});

test.describe('Analysis Workflow — Porter Five Forces', () => {
  test('POST /api/v1/analysis/porter returns valid analysis', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/analysis/porter`, {
      data: {
        plan_id: 'e2e-test-plan',
        context: 'E-commerce marketplace in Latin America',
        industry: 'retail',
      },
    });

    expect([200, 503]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
    }
  });
});

test.describe('Analysis Workflow — SWOT', () => {
  test('POST /api/v1/analysis/swot returns valid analysis', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/analysis/swot`, {
      data: {
        plan_id: 'e2e-test-plan',
        context: 'Fintech startup in Caribbean region',
      },
    });

    expect([200, 503]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
      const data = body.data;
      const quadrants = ['strengths', 'weaknesses', 'opportunities', 'threats'];
      for (const q of quadrants) {
        expect(data).toHaveProperty(q);
      }
    }
  });
});

test.describe('Analysis Workflow — Strategy Kernel', () => {
  test('POST /api/v1/strategy/kernel returns valid kernel', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/strategy/kernel`, {
      data: {
        plan_id: 'e2e-test-plan',
        context: 'Digital transformation for government agency',
      },
    });

    expect([200, 503]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
      const data = body.data;
      // Rumelt's kernel: diagnosis, guiding_policy, coherent_actions
      expect(data).toHaveProperty('diagnosis');
      expect(data).toHaveProperty('guiding_policy');
    }
  });
});
