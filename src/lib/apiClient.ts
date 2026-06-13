/**
 * Estrategia 365 — Centralized API Client Core
 * ==========================================
 * Full-parity client covering all backend endpoints.
 * Includes JWT authentication with automatic token refresh.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Routes mounted at root level (no /v1 prefix)
const ROOT_PREFIXES = ['/auth', '/health', '/ready', '/metrics', '/docs'];

export function resolveUrl(path: string): string {
  const isRootRoute = ROOT_PREFIXES.some(p => path.startsWith(p));
  return isRootRoute ? `${API_BASE}${path}` : `${API_BASE}/v1${path}`;
}

// ── Token Management ──────────────────────────────────────────
const TOKEN_KEY = 'e365_access_token';
const REFRESH_KEY = 'e365_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ── Auth Headers ──────────────────────────────────────────────
export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const csrf = typeof window !== 'undefined' ? localStorage.getItem('e365_csrf_token') : null;
  const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
  if (csrf) headers['x-csrf-token'] = csrf;
  return headers;
}

// Flag to prevent concurrent refresh attempts
let _refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return false;
  }
  if (_refreshPromise) return _refreshPromise;
  
  _refreshPromise = (async () => {
    try {
      const res = await fetch(resolveUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ refresh_token: refresh }),
        credentials: 'include',
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const csrfToken = res.headers.get('x-csrf-token');
      if (csrfToken && typeof window !== 'undefined') {
        localStorage.setItem('e365_csrf_token', csrfToken);
      }
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

// ── Core Request Function ─────────────────────────────────────
export async function request<T = any>(path: string, options: RequestInit & { _retried?: boolean } = {}): Promise<T> {
  const url = resolveUrl(path);
  const config: RequestInit & { _retried?: boolean } = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };
  let res = await fetch(url, config);
  
  const csrfToken = res.headers.get('x-csrf-token');
  if (csrfToken && typeof window !== 'undefined') {
    localStorage.setItem('e365_csrf_token', csrfToken);
  }

  // Auto-refresh on 401 and retry once
  if (res.status === 401 && !options._retried) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      config.headers = { ...config.headers, ...getAuthHeaders() } as any;
      config._retried = true;
      res = await fetch(url, config);
      const newCsrf = res.headers.get('x-csrf-token');
      if (newCsrf && typeof window !== 'undefined') localStorage.setItem('e365_csrf_token', newCsrf);
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData.detail || `Error ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  if (res.status === 204) return null as any;
  return res.json();
}

export async function uploadFile<T = any>(path: string, file: File, extraFields: Record<string, string> = {}): Promise<T> {
  const url = resolveUrl(path);
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));
  const headers = getAuthHeaders();
  let res = await fetch(url, { method: 'POST', body: formData, headers, credentials: 'include' });

  // Auto-refresh on 401 and retry once
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await fetch(url, { method: 'POST', body: formData, headers: getAuthHeaders(), credentials: 'include' });
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Error ${res.status}`);
  }
  return res.json();
}
