'use client';
/**
 * useOnboardingPersistence — Autosave + Progress Recovery
 * ========================================================
 * Provides:
 * - Debounced autosave of form data every 30s or on step change
 * - Visual save status indicator (saved/saving/error)
 * - Recovery detection on mount (resume previous session)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/core/infrastructure/api';

const AUTOSAVE_INTERVAL_MS = 30_000; // 30 seconds
const DEBOUNCE_MS = 2_000; // 2s after last change

export function useOnboardingPersistence({ methods, institutionId, step }) {
  // Save status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const debounceRef = useRef(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // ── Core save function ─────────────────────────────────
  const doSave = useCallback(async (silent = false) => {
    if (!institutionId || !methods) return;
    if (!silent) setSaveStatus('saving');

    try {
      const formData = methods.getValues();
      await api.updateOnboardingProgress({
        current_step: step,
        institution_id: institutionId,
        form_data: JSON.stringify(formData),
      });

      if (isMountedRef.current) {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        // Reset to 'idle' after 3s
        setTimeout(() => {
          if (isMountedRef.current) setSaveStatus('idle');
        }, 3000);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setSaveStatus('error');
        setTimeout(() => {
          if (isMountedRef.current) setSaveStatus('idle');
        }, 5000);
      }
    }
  }, [institutionId, methods, step]);

  // ── Debounced save on form change ──────────────────────
  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSave(true), DEBOUNCE_MS);
  }, [doSave]);

  // ── Periodic autosave ──────────────────────────────────
  useEffect(() => {
    if (!institutionId) return;

    intervalRef.current = setInterval(() => {
      doSave(true);
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [institutionId, doSave]);

  // ── Save on step change ────────────────────────────────
  useEffect(() => {
    if (institutionId && step > 1) {
      Promise.resolve().then(() => doSave(true));
    }
  }, [step]); // intentionally only step dependency

  // ── Cleanup ────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Save before unload ────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (institutionId && methods) {
        // Synchronous save attempt via navigator.sendBeacon
        const formData = methods.getValues();
        const payload = JSON.stringify({
          current_step: step,
          institution_id: institutionId,
          form_data: JSON.stringify(formData),
        });
        navigator.sendBeacon?.('/api/v1/onboarding/progress', payload);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [institutionId, methods, step]);

  return {
    saveStatus,
    lastSavedAt,
    scheduleSave,
    forceSave: () => doSave(false),
  };
}
