// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import onboardingService from '@/app/onboarding/services/onboardingService';
import api from '@/core/infrastructure/api';

vi.mock('@/core/infrastructure/api', () => ({
  default: {
    getOnboardingProgress: vi.fn(),
    getInstitution: vi.fn(),
    getGovernance: vi.fn(),
    getOrgUnits: vi.fn(),
    getCapabilities: vi.fn(),
    getKnownRisks: vi.fn(),
    getCultureProfile: vi.fn(),
    getValueChain: vi.fn(),
    getDependencies: vi.fn(),
    getTechSystems: vi.fn(),
    getDocuments: vi.fn(),
    getStakeholders: vi.fn(),
    updateInstitution: vi.fn(),
    createInstitution: vi.fn(),
    createPlan: vi.fn(),
    updateOnboardingProgress: vi.fn(),
  }
}));

describe('onboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});
  });

  describe('mapInstitutionToForm', () => {
    it('returns default form values if institution is null', () => {
      const result = onboardingService.mapInstitutionToForm(null);
      expect(result.sector).toBe('private');
      expect(result.name).toBe('');
    });

    it('maps correctly from valid institution object', () => {
      const inst = { name: 'Test Corp', sector: 'public', employees: 100 };
      const result = onboardingService.mapInstitutionToForm(inst);
      expect(result.name).toBe('Test Corp');
      expect(result.sector).toBe('public');
      expect(result.employees).toBe(100);
      expect(result.annual_revenue_currency).toBe('USD'); // Default fallback tested
    });
  });

  describe('loadFullProgress', () => {
    it('returns clean state if no API progress and no localStorage', async () => {
      api.getOnboardingProgress.mockRejectedValue(new Error('Not found'));
      const result = await onboardingService.loadFullProgress();
      expect(result).toBeNull();
    });

    it('loads full progress and merges form_data', async () => {
      api.getOnboardingProgress.mockResolvedValue({
        current_step: 4,
        institution_id: 1,
        form_data: JSON.stringify({ name: 'Draft Corp' })
      });
      api.getInstitution.mockResolvedValue({ id: 1, name: 'Saved Corp', tier: 'premium' });
      // Mock all H2/H3 calls to resolve empty/null
      api.getGovernance.mockResolvedValue(null);
      api.getOrgUnits.mockResolvedValue([]);
      api.getCapabilities.mockResolvedValue([]);
      api.getKnownRisks.mockResolvedValue([]);
      api.getCultureProfile.mockResolvedValue(null);
      api.getValueChain.mockResolvedValue([]);
      api.getDependencies.mockResolvedValue([]);
      api.getTechSystems.mockResolvedValue([]);
      api.getDocuments.mockResolvedValue([]);
      api.getStakeholders.mockResolvedValue([]);

      const result = await onboardingService.loadFullProgress();
      
      expect(result.step).toBe(4);
      expect(result.institutionId).toBe(1);
      expect(result.formValues.name).toBe('Draft Corp'); // Draft overrides saved
      expect(result.tier).toBe('premium');
      expect(result.orgUnits).toEqual([]);
      expect(localStorage.setItem).toHaveBeenCalledWith('current_institution_id', 1);
    });
  });

  describe('saveInstitutionProfile', () => {
    it('creates new institution if no id provided', async () => {
      api.createInstitution.mockResolvedValue({ id: 99 });
      api.updateInstitution.mockResolvedValue({ id: 99, name: 'New Corp' });

      const result = await onboardingService.saveInstitutionProfile(null, { name: 'New Corp', sector: 'private' });
      
      expect(api.createInstitution).toHaveBeenCalledWith({ name: 'New Corp', sector: 'private' });
      expect(api.updateInstitution).toHaveBeenCalledWith(99, expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith('current_institution_id', 99);
      expect(result.id).toBe(99);
    });

    it('updates existing institution if id is provided', async () => {
      api.updateInstitution.mockResolvedValue({ id: 55, name: 'Old Corp' });

      const result = await onboardingService.saveInstitutionProfile(55, { name: 'Old Corp Updated' });
      
      expect(api.createInstitution).not.toHaveBeenCalled();
      expect(api.updateInstitution).toHaveBeenCalledWith(55, expect.any(Object));
      expect(result.id).toBe(55);
    });
  });

  describe('createPlan', () => {
    it('creates plan and sets localStorage', async () => {
      api.createPlan.mockResolvedValue({ id: 77 });

      const result = await onboardingService.createPlan(55, { paradigmId: 'porter', mission: 'To serve', vision: 'To lead' });

      expect(api.createPlan).toHaveBeenCalledWith(55, expect.objectContaining({
        paradigm_id: 'porter',
        mission: 'To serve',
        vision: 'To lead'
      }));
      expect(localStorage.setItem).toHaveBeenCalledWith('current_plan_id', 77);
      expect(result.id).toBe(77);
    });
  });

  describe('syncProgress', () => {
    it('calls updateOnboardingProgress and catches errors silently', () => {
      api.updateOnboardingProgress.mockRejectedValue(new Error('Network error'));
      
      expect(() => {
        onboardingService.syncProgress({ current_step: 5 });
      }).not.toThrow();

      expect(api.updateOnboardingProgress).toHaveBeenCalledWith({ current_step: 5 });
    });
  });
});
