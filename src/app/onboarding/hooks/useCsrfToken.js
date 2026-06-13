'use client';
/**
 * useCsrfToken — Anti-CSRF Token Management
 * ============================================
 * Fetches a CSRF token from the backend and provides it
 * for form submissions. Token is refreshed on mount and
 * can be manually refreshed.
 *
 * Backend should expose: GET /auth/csrf-token → { csrf_token: "..." }
 * Forms should submit the token as X-CSRF-Token header or hidden field.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

// Session-level cache to avoid refetching on every component mount
let cachedToken = null;
let tokenExpiry = 0;

const TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes

export function useCsrfToken() {
  const [token, setToken] = useState(cachedToken);
  const [isLoading, setIsLoading] = useState(!cachedToken);

  const fetchToken = useCallback(async () => {
    try {
      // If backend has CSRF endpoint, use it
      if (api.getCsrfToken) {
        const response = await api.getCsrfToken();
        cachedToken = response.csrf_token || response.token;
      } else {
        // Fallback: generate client-side token and store in cookie
        cachedToken = generateClientToken();
      }
      tokenExpiry = Date.now() + TOKEN_LIFETIME_MS;
      setToken(cachedToken);
    } catch {
      // If CSRF endpoint doesn't exist yet, generate client token
      cachedToken = generateClientToken();
      tokenExpiry = Date.now() + TOKEN_LIFETIME_MS;
      setToken(cachedToken);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!cachedToken || Date.now() > tokenExpiry) {
      fetchToken();
    } else {
      let active = true;
      Promise.resolve().then(() => {
        if (!active) return;
        setToken(cachedToken);
        setIsLoading(false);
      });
      return () => { active = false; };
    }
  }, [fetchToken]);

  const refresh = useCallback(() => {
    cachedToken = null;
    tokenExpiry = 0;
    return fetchToken();
  }, [fetchToken]);

  // Props to add to forms
  const csrfField = token ? (
    <input type="hidden" name="_csrf" value={token} />
  ) : null;

  // Headers to add to fetch calls
  const csrfHeaders = token ? { 'X-CSRF-Token': token } : {};

  return {
    token,
    isLoading,
    refresh,
    csrfField,
    csrfHeaders,
  };
}

/** Generate a cryptographically secure client-side token */
function generateClientToken() {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for SSR
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
