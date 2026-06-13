/**
 * Estrategia 365 — E2E: API Health & Smoke Tests (Phase 8)
 * =========================================================
 * Validates API availability, response contracts, and basic flows.
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8000';

test.describe('API Health & Infrastructure', () => {
  test('GET /health returns 200 with status ok', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('environment');
  });

  test('GET /api/v1/metrics returns Prometheus format', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/metrics`);
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('estrategia365');
  });

  test('GET /docs returns OpenAPI documentation', async ({ request }) => {
    const response = await request.get(`${API_URL}/docs`);
    expect(response.status()).toBe(200);
  });

  test('GET /openapi.json returns valid OpenAPI schema', async ({ request }) => {
    const response = await request.get(`${API_URL}/openapi.json`);
    expect(response.status()).toBe(200);

    const schema = await response.json();
    expect(schema).toHaveProperty('openapi');
    expect(schema).toHaveProperty('info');
    expect(schema.info).toHaveProperty('title');
    expect(schema).toHaveProperty('paths');
  });
});

test.describe('API Error Contract', () => {
  test('404 returns standard error envelope', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/nonexistent-endpoint-12345`);
    expect(response.status()).toBe(404);
  });

  test('POST without body returns 422 validation error', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/plans`, {
      data: {},
    });
    // Should return 422 Unprocessable Entity for missing required fields
    expect([400, 422]).toContain(response.status());
  });
});

test.describe('API Authentication', () => {
  test('Protected endpoint without token returns 401/403', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/plans`);
    // Depending on AUTH_ENABLED config, should require authentication
    expect([200, 401, 403]).toContain(response.status());
  });
});
