'use client';
/**
 * useOnboardingAnalytics — Internal Event Tracking
 * ==================================================
 * Tracks 7 onboarding events for measuring:
 * - Start/completion rates
 * - Drop-off per step
 * - Average completion time
 * - Document upload success/failure
 *
 * Events are stored in-memory and flushed to the backend
 * analytics endpoint. Falls back to console.log in dev.
 */
import { useRef, useCallback } from 'react';
import api from '@/core/infrastructure/api';

const EVENT_TYPES = {
  STARTED: 'onboarding_started',
  STEP_COMPLETED: 'onboarding_step_completed',
  STEP_FAILED: 'onboarding_step_failed',
  DOCUMENT_UPLOADED: 'onboarding_document_uploaded',
  DOCUMENT_REJECTED: 'onboarding_document_rejected',
  PROGRESS_SAVED: 'onboarding_progress_saved',
  COMPLETED: 'onboarding_completed',
};

const STEP_NAMES = {
  1: 'identity', 2: 'mission', 3: 'context', 4: 'stakeholders',
  5: 'governance', 6: 'risk_culture', 7: 'operations', 8: 'metrics',
  9: 'documents', 10: 'summary', 11: 'plan',
};

export function useOnboardingAnalytics(institutionId) {
  const startTimeRef = useRef(Date.now());
  const stepTimesRef = useRef({});
  const eventsRef = useRef([]);

  const emit = useCallback((eventType, payload = {}) => {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      institution_id: institutionId,
      elapsed_ms: Date.now() - startTimeRef.current,
      ...payload,
    };

    eventsRef.current.push(event);

    // Dev logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventType}`, payload);
    }

    // Fire-and-forget to backend
    api.trackEvent?.(event)?.catch?.(() => {});
  }, [institutionId]);

  // ── Public API ──────────────────────────────────────────

  const trackStart = useCallback(() => {
    startTimeRef.current = Date.now();
    emit(EVENT_TYPES.STARTED);
  }, [emit]);

  const trackStepCompleted = useCallback((stepNumber, fromStep) => {
    const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`;
    const stepStart = stepTimesRef.current[fromStep] || Date.now();
    const duration = Date.now() - stepStart;

    emit(EVENT_TYPES.STEP_COMPLETED, {
      step: stepNumber,
      step_name: stepName,
      from_step: fromStep,
      step_duration_ms: duration,
    });

    // Track when the new step starts
    stepTimesRef.current[stepNumber] = Date.now();
  }, [emit]);

  const trackStepFailed = useCallback((stepNumber, error) => {
    emit(EVENT_TYPES.STEP_FAILED, {
      step: stepNumber,
      step_name: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
      error: typeof error === 'string' ? error : error?.message || 'Unknown',
    });
  }, [emit]);

  const trackDocumentUploaded = useCallback((fileName, fileSize) => {
    emit(EVENT_TYPES.DOCUMENT_UPLOADED, {
      file_name: fileName,
      file_size_bytes: fileSize,
    });
  }, [emit]);

  const trackDocumentRejected = useCallback((fileName, reason) => {
    emit(EVENT_TYPES.DOCUMENT_REJECTED, {
      file_name: fileName,
      reason,
    });
  }, [emit]);

  const trackProgressSaved = useCallback((step) => {
    emit(EVENT_TYPES.PROGRESS_SAVED, {
      step,
      step_name: STEP_NAMES[step] || `step_${step}`,
    });
  }, [emit]);

  const trackCompleted = useCallback((planId) => {
    const totalDuration = Date.now() - startTimeRef.current;
    emit(EVENT_TYPES.COMPLETED, {
      plan_id: planId,
      total_duration_ms: totalDuration,
      total_events: eventsRef.current.length,
    });
  }, [emit]);

  return {
    trackStart,
    trackStepCompleted,
    trackStepFailed,
    trackDocumentUploaded,
    trackDocumentRejected,
    trackProgressSaved,
    trackCompleted,
    // Expose for testing/admin
    getEvents: () => [...eventsRef.current],
    EVENT_TYPES,
  };
}
