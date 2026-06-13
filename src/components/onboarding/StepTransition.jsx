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
    // Trigger exit animation
    setIsVisible(false);

    // After exit, swap content and trigger enter
    const timer = setTimeout(() => {
      setDisplayedKey(stepKey);
      setIsVisible(true);
    }, 150); // matches CSS exit duration

    return () => clearTimeout(timer);
  }, [stepKey]);

  // On mount, show immediately
  useEffect(() => {
    setIsVisible(true);
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
