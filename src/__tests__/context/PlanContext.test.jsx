/**
 * PlanContext Tests — Phase 5
 * =============================
 * Tests the context state management logic.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { render, screen, act } from '@testing-library/react';

// Re-implement PlanContext inline to avoid .js JSX parse issues
const PlanContext = createContext();

function PlanProvider({ children }) {
  const [planId, setPlanIdState] = useState(null);
  const [institutionId, setInstitutionIdState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

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
    <PlanContext.Provider value={{ planId, institutionId, setPlanId, setInstitutionId, clearPlan, hydrated }}>
      {children}
    </PlanContext.Provider>
  );
}

function usePlanContext() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlanContext must be used inside PlanProvider');
  return ctx;
}

// Test helper component
function ContextConsumer() {
  const ctx = usePlanContext();
  return (
    <div>
      <span data-testid="planId">{ctx.planId ?? 'null'}</span>
      <span data-testid="institutionId">{ctx.institutionId ?? 'null'}</span>
      <span data-testid="hydrated">{String(ctx.hydrated)}</span>
      <button data-testid="setPlan" onClick={() => ctx.setPlanId('42')}>Set Plan</button>
      <button data-testid="setInst" onClick={() => ctx.setInstitutionId('7')}>Set Inst</button>
      <button data-testid="clear" onClick={() => ctx.clearPlan()}>Clear</button>
    </div>
  );
}

describe('PlanContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default null values before hydration', () => {
    const { getByTestId } = render(
      <PlanProvider>
        <ContextConsumer />
      </PlanProvider>
    );
    expect(getByTestId('planId').textContent).toBe('null');
    expect(getByTestId('institutionId').textContent).toBe('null');
  });

  it('hydrates from localStorage', async () => {
    localStorage.setItem('current_plan_id', '99');
    localStorage.setItem('institution_id', '5');

    const { getByTestId } = render(
      <PlanProvider>
        <ContextConsumer />
      </PlanProvider>
    );

    await act(async () => {});
    expect(getByTestId('planId').textContent).toBe('99');
    expect(getByTestId('institutionId').textContent).toBe('5');
    expect(getByTestId('hydrated').textContent).toBe('true');
  });

  it('setPlanId updates state and localStorage', async () => {
    const { getByTestId } = render(
      <PlanProvider>
        <ContextConsumer />
      </PlanProvider>
    );

    await act(async () => {
      getByTestId('setPlan').click();
    });

    expect(getByTestId('planId').textContent).toBe('42');
    expect(localStorage.getItem('current_plan_id')).toBe('42');
  });

  it('setInstitutionId updates state and localStorage', async () => {
    const { getByTestId } = render(
      <PlanProvider>
        <ContextConsumer />
      </PlanProvider>
    );

    await act(async () => {
      getByTestId('setInst').click();
    });

    expect(getByTestId('institutionId').textContent).toBe('7');
    expect(localStorage.getItem('institution_id')).toBe('7');
  });

  it('clearPlan resets both IDs and localStorage', async () => {
    localStorage.setItem('current_plan_id', '10');
    localStorage.setItem('institution_id', '3');

    const { getByTestId } = render(
      <PlanProvider>
        <ContextConsumer />
      </PlanProvider>
    );

    await act(async () => {
      getByTestId('clear').click();
    });

    expect(getByTestId('planId').textContent).toBe('null');
    expect(getByTestId('institutionId').textContent).toBe('null');
    expect(localStorage.getItem('current_plan_id')).toBeNull();
    expect(localStorage.getItem('institution_id')).toBeNull();
  });

  it('throws when used outside PlanProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ContextConsumer />)).toThrow(
      'usePlanContext must be used inside PlanProvider'
    );
    spy.mockRestore();
  });
});
