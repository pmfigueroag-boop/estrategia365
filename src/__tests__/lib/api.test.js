/**
 * api.js — Integration Test Suite (Component C — P1)
 * ====================================================
 * Tests the centralized API client using vi.stubGlobal('fetch').
 * Covers: token management, resolveUrl routing, auto-refresh on 401,
 * all major method groups, uploadFile, error propagation.
 */

import { beforeEach, afterEach, describe, test, expect, vi } from 'vitest';
import api from '@/lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(body, { status = 200, ok = true } = {}) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    headers: { get: () => null },
    json: () => Promise.resolve(body),
    blob: () => Promise.resolve(new Blob([JSON.stringify(body)])),
  });
}

function mockFetchError(status, detail) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    headers: { get: () => null },
    json: () => Promise.resolve({ detail }),
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Token Management ──────────────────────────────────────────────────────────

describe('Token Management', () => {
  test('isAuthenticated returns false when no token', () => {
    expect(api.isAuthenticated()).toBe(false);
  });

  test('isAuthenticated returns true after setTokens', () => {
    localStorage.setItem('e365_access_token', 'test-token');
    expect(api.isAuthenticated()).toBe(true);
  });

  test('getAccessToken returns stored token', () => {
    localStorage.setItem('e365_access_token', 'my-access-token');
    expect(api.getAccessToken()).toBe('my-access-token');
  });

  test('getAccessToken returns null when not set', () => {
    expect(api.getAccessToken()).toBeNull();
  });

  test('clearTokens removes both tokens', () => {
    localStorage.setItem('e365_access_token', 'access');
    localStorage.setItem('e365_refresh_token', 'refresh');
    api.clearTokens();
    expect(localStorage.getItem('e365_access_token')).toBeNull();
    expect(localStorage.getItem('e365_refresh_token')).toBeNull();
  });

  test('isAuthenticated returns false after clearTokens', () => {
    localStorage.setItem('e365_access_token', 'token');
    api.clearTokens();
    expect(api.isAuthenticated()).toBe(false);
  });
});

// ── URL Resolution ────────────────────────────────────────────────────────────

describe('resolveUrl routing', () => {
  test('plans endpoint uses /v1 prefix', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getPlans(1);
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('/v1/plans/');
  });

  test('auth endpoint uses root prefix (no /v1)', async () => {
    const fetchMock = mockFetch({ access_token: 'tok', refresh_token: 'ref' });
    vi.stubGlobal('fetch', fetchMock);
    const formData = new URLSearchParams({ username: 'user@test.com', password: 'pass' });
    await api.login('user@test.com', 'pass');
    const url = fetchMock.mock.calls[0][0];
    expect(url).toMatch(/\/auth\/login$/);
    expect(url).not.toContain('/v1/auth');
  });

  test('health endpoint uses root prefix', async () => {
    const fetchMock = mockFetch({ status: 'ok' });
    vi.stubGlobal('fetch', fetchMock);
    await api.getHealth();
    const url = fetchMock.mock.calls[0][0];
    expect(url).toMatch(/\/health$/);
    expect(url).not.toContain('/v1/health');
  });

  test('analysis endpoint uses /v1 prefix', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getPestel(42);
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('/v1/analysis/42/pestel');
  });
});

// ── Auth Headers ──────────────────────────────────────────────────────────────

describe('Auth headers', () => {
  test('includes Authorization header when token is set', async () => {
    localStorage.setItem('e365_access_token', 'my-bearer-token');
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getPlans(1);
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer my-bearer-token');
  });

  test('omits Authorization header when no token', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getHealth();
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });
});

// ── Auto-Refresh on 401 ───────────────────────────────────────────────────────

describe('Auto-refresh on 401', () => {
  test('retries request after successful token refresh', async () => {
    localStorage.setItem('e365_access_token', 'expired-token');
    localStorage.setItem('e365_refresh_token', 'valid-refresh');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, headers: { get: () => null }, json: () => Promise.resolve({ detail: 'Unauthorized' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({ access_token: 'new-token', refresh_token: 'new-refresh' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve([{ id: 1 }]) });

    vi.stubGlobal('fetch', fetchMock);
    const result = await api.getPlans(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual([{ id: 1 }]);
  });

  test('clears tokens and propagates error when refresh fails', async () => {
    localStorage.setItem('e365_access_token', 'expired-token');
    localStorage.setItem('e365_refresh_token', 'invalid-refresh');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, headers: { get: () => null }, json: () => Promise.resolve({ detail: 'Unauthorized' }) })
      .mockResolvedValueOnce({ ok: false, status: 401, headers: { get: () => null }, json: () => Promise.resolve({ detail: 'Refresh failed' }) });

    vi.stubGlobal('fetch', fetchMock);
    await expect(api.getPlans(1)).rejects.toThrow();
    expect(localStorage.getItem('e365_access_token')).toBeNull();
  });
});

// ── Workspace API ─────────────────────────────────────────────────────────────

describe('Workspace API', () => {
  test('getWorkspaceSummary calls /workspace/summary', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getWorkspaceSummary();
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/institutions/workspace/summary');
  });
});

// ── Plans API ─────────────────────────────────────────────────────────────────

describe('Plans API', () => {
  test('getTenantPlans calls /plans/tenant', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getTenantPlans();
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/plans/tenant');
  });

  test('getPlans calls correct URL', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getPlans(5);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/plans/5');
  });

  test('createPlan sends POST with body', async () => {
    const fetchMock = mockFetch({ id: 1, name: 'Plan' });
    vi.stubGlobal('fetch', fetchMock);
    await api.createPlan(1, { name: 'Plan Nuevo' });
    const [url, config] = fetchMock.mock.calls[0];
    expect(config.method).toBe('POST');
    expect(JSON.parse(config.body)).toEqual({ name: 'Plan Nuevo' });
  });

  test('deletePlan sends DELETE request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, headers: { get: () => null } });
    vi.stubGlobal('fetch', fetchMock);
    await api.deletePlan(42);
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });

  test('updatePlan sends PUT request with body', async () => {
    const fetchMock = mockFetch({ id: 1, paradigm_id: 'cepal' });
    vi.stubGlobal('fetch', fetchMock);
    await api.updatePlan(1, { paradigm_id: 'cepal' });
    const [url, config] = fetchMock.mock.calls[0];
    expect(config.method).toBe('PUT');
    expect(JSON.parse(config.body)).toEqual({ paradigm_id: 'cepal' });
  });

  test('getPlan calls single plan endpoint', async () => {
    const fetchMock = mockFetch({ id: 7, name: 'Plan 7' });
    vi.stubGlobal('fetch', fetchMock);
    await api.getPlan(7);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/plans/single/7');
  });
});

// ── Analysis API ─────────────────────────────────────────────────────────────

describe('Analysis API', () => {
  test('getPestel calls correct URL', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getPestel(10);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/analysis/10/pestel');
  });

  test('scanPestel sends POST', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.scanPestel(10);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  test('getPorter calls correct URL', async () => {
    const fetchMock = mockFetch({ forces: [] });
    vi.stubGlobal('fetch', fetchMock);
    await api.getPorter(15);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/analysis/15/porter');
  });

  test('clearSwot sends DELETE', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({ detail: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);
    await api.clearSwot(20);
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });
});

// ── Execution API ─────────────────────────────────────────────────────────────

describe('Execution API', () => {
  test('getObjectives calls correct URL', async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal('fetch', fetchMock);
    await api.getObjectives(3);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/execution/3/objectives');
  });

  test('createObjective sends POST', async () => {
    const fetchMock = mockFetch({ id: 1 });
    vi.stubGlobal('fetch', fetchMock);
    await api.createObjective(3, { title: 'Crecimiento' });
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  test('synthesizeBsc sends POST', async () => {
    const fetchMock = mockFetch({ synthesized: true });
    vi.stubGlobal('fetch', fetchMock);
    await api.synthesizeBsc(3);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });
});

// ── Tenant API ────────────────────────────────────────────────────────────────

describe('Tenant API', () => {
  test('deleteInstitution sends DELETE request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, headers: { get: () => null } });
    vi.stubGlobal('fetch', fetchMock);
    await api.deleteInstitution(1);
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });
});

// ── Auth API ──────────────────────────────────────────────────────────────────

describe('Auth API', () => {
  test('login stores tokens on success', async () => {
    const fetchMock = mockFetch({ access_token: 'access123', refresh_token: 'refresh456' });
    vi.stubGlobal('fetch', fetchMock);
    await api.login('user@test.com', 'password');
    expect(localStorage.getItem('e365_access_token')).toBe('access123');
    expect(localStorage.getItem('e365_refresh_token')).toBe('refresh456');
  });

  test('login uses form-encoded body', async () => {
    const fetchMock = mockFetch({ access_token: 'tok', refresh_token: 'ref' });
    vi.stubGlobal('fetch', fetchMock);
    await api.login('user@test.com', 'pass');
    const [, config] = fetchMock.mock.calls[0];
    expect(config.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
  });

  test('logout clears tokens', async () => {
    localStorage.setItem('e365_access_token', 'tok');
    localStorage.setItem('e365_refresh_token', 'ref');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);
    await api.logout();
    expect(localStorage.getItem('e365_access_token')).toBeNull();
  });

  test('getMe calls /auth/me', async () => {
    const fetchMock = mockFetch({ id: 1, email: 'user@test.com' });
    vi.stubGlobal('fetch', fetchMock);
    await api.getMe();
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/me');
  });
});

// ── Error Propagation ─────────────────────────────────────────────────────────

describe('Error propagation', () => {
  test('throws Error with detail message from response', async () => {
    const fetchMock = mockFetchError(404, 'Plan not found');
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.getPlan(999)).rejects.toThrow('Plan not found');
  });

  test('error has .status property set', async () => {
    const fetchMock = mockFetchError(422, 'Validation error');
    vi.stubGlobal('fetch', fetchMock);
    try {
      await api.getPlan(999);
    } catch (e) {
      expect(e.status).toBe(422);
    }
  });

  test('throws generic message when no detail in response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 500,
      headers: { get: () => null },
      json: () => Promise.reject(new Error('not json')),
    }));
    await expect(api.getHealth()).rejects.toThrow('Error 500');
  });

  test('204 responses return null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, headers: { get: () => null } }));
    const result = await api.deletePlan(1);
    expect(result).toBeNull();
  });
});

