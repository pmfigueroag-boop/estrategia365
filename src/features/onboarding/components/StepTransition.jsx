'use client';
/**
 * StepTransition — Animated wrapper for step changes
 * ====================================================
 * Provides smooth slide+fade transitions between onboarding steps.
 * Uses CSS animations triggered by key change.
 */
import { useState, useEffect } from 'react';

export default function StepTransition({ stepKey, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedKey, setDisplayedKey] = useState(stepKey);

  useEffect(() => {
    if (stepKey === displayedKey) return;

    let rAF;
    rAF = requestAnimationFrame(() => {
      setIsVisible(false);
    });

    // After exit, swap content and trigger enter
    const timer = setTimeout(() => {
      setDisplayedKey(stepKey);
      setIsVisible(true);
    }, 150); // matches CSS exit duration

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rAF);
    };
  }, [stepKey, displayedKey]);

  // On mount, show immediately
  useEffect(() => {
    const rAF = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(rAF);
  }, []);

  return (
    <div
      className={`step-transition ${isVisible ? 'step-transition--enter' : 'step-transition--exit'}`}
      key={displayedKey}
    >
      {children}
    </div>
  );
}
