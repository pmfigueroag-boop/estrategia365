/**
 * PlanContext — Centralized Plan State (Phase 4)
 * =================================================
 * Replaces localStorage-based plan/institution tracking.
 * Provides reactive state across all pages.
 */
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PlanContext = createContext<any>(null);

export function PlanProvider({ children }) {
  const [planId, setPlanIdState] = useState(null);
  const [institutionId, setInstitutionIdState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setPlanIdState(localStorage.getItem('current_plan_id'));
      setInstitutionIdState(localStorage.getItem('institution_id'));
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const setPlanId = useCallback((id) => {
    setPlanIdState(id);
    if (id) {
      localStorage.setItem('current_plan_id', id);
    } else {
      localStorage.removeItem('current_plan_id');
    }
  }, []);

  const setInstitutionId = useCallback((id) => {
    setInstitutionIdState(id);
    if (id) {
      localStorage.setItem('institution_id', id);
    } else {
      localStorage.removeItem('institution_id');
    }
  }, []);

  const clearPlan = useCallback(() => {
    setPlanId(null);
    setInstitutionId(null);
  }, [setPlanId, setInstitutionId]);

  return (
    <PlanContext.Provider value={{
      planId,
      institutionId,
      setPlanId,
      setInstitutionId,
      clearPlan,
      hydrated,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlanContext() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlanContext must be used inside PlanProvider');
  return ctx;
}
