'use client';
/**
 * useAccessibleStep — WCAG Level A Compliance Hook
 * ==================================================
 * Provides:
 * - Focus management on step change (moves focus to step heading)
 * - Live region announcements for step transitions
 * - Keyboard navigation (Escape to go back)
 * - Skip navigation link support
 */
import { useEffect, useRef, useCallback } from 'react';

export function useAccessibleStep({ step, totalSteps, onPrev }) {
  const stepRef = useRef(null);
  const announcerRef = useRef(null);

  // Focus management: move focus to step content on step change
  useEffect(() => {
    // Small delay to let transition animation start
    const timer = setTimeout(() => {
      const heading = stepRef.current?.querySelector('h2, h3, [role="heading"]');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: false });
      }
    }, 350); // after StepTransition animation

    return () => clearTimeout(timer);
  }, [step]);

  // Announce step change to screen readers
  useEffect(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent = `Paso ${step} de ${totalSteps}`;
    }
  }, [step, totalSteps]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      // Escape → go back (unless on step 1)
      if (e.key === 'Escape' && step > 1 && onPrev) {
        e.preventDefault();
        onPrev();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, onPrev]);

  // Props to spread on the step container
  const stepContainerProps = {
    ref: stepRef,
    role: 'region',
    'aria-label': `Paso ${step} de ${totalSteps}`,
    'aria-live': 'polite',
  };

  // Live announcer (render as invisible element)
  const AnnouncerElement = () => (
    <div
      ref={announcerRef}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
      }}
    />
  );

  return {
    stepContainerProps,
    AnnouncerElement,
    stepRef,
  };
}

/**
 * SkipToContent — Skip navigation link for keyboard users
 */
export function SkipToContent({ targetId = 'onboarding-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content"
      style={{
        position: 'absolute',
        top: '-100%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '0.75rem 1.5rem',
        background: 'var(--accent-primary)',
        color: 'white',
        borderRadius: '0 0 8px 8px',
        zIndex: 1000,
        transition: 'top 0.2s ease',
        fontWeight: 600,
        textDecoration: 'none',
      }}
      onFocus={(e) => { e.target.style.top = '0'; }}
      onBlur={(e) => { e.target.style.top = '-100%'; }}
    >
      Ir al contenido
    </a>
  );
}
