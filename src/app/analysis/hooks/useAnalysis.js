import { useState, useCallback } from 'react';
import { 
  usePestel, usePestelDeepAnalysis, usePestelDrift, usePestelEarlyWarnings, 
  usePorter, usePorterDeepAnalysis, useSwot, useTows 
} from '@/lib/swr-hooks';
import api from '@/lib/api';

export function useAnalysis(planId, toast) {
  const [activeTab, setActiveTab] = useState('institucional');
  const [isLoading, setIsLoading] = useState(false);
  const [towsLoading, setTowsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(null);
  const [readinessKey, setReadinessKey] = useState(0);

  // PESTEL State
  const { data: pestel = [], mutate: mutatePestel } = usePestel(planId);
  const { data: pestelDeepAnalysis, mutate: mutatePestelDeep } = usePestelDeepAnalysis(planId);
  const { data: pestelDriftData } = usePestelDrift(planId);
  const { data: pestelEarlyWarnings } = usePestelEarlyWarnings(planId);
  const [pestelView, setPestelView] = useState('cockpit');
  const [selectedSignal, setSelectedSignal] = useState(null);

  // Porter State
  const { data: porterData = {}, mutate: mutatePorter } = usePorter(planId);
  const porterForces = porterData?.forces || (Array.isArray(porterData) ? porterData : []);
  const { data: porterDeepAnalysis, mutate: mutatePorterDeep } = usePorterDeepAnalysis(planId);
  const [porterView, setPorterView] = useState('forces');

  // SWOT State
  const { data: swot = [], mutate: mutateSwot } = useSwot(planId);
  const { data: tows = [], mutate: mutateTows } = useTows(planId);
  const [swotView, setSwotView] = useState('cockpit');

  // Institutional State
  const [instView, setInstView] = useState('cockpit');

  const refreshReadiness = useCallback(() => {
    setReadinessKey(k => k + 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('readiness-update'));
    }
  }, []);

  const handleScan = useCallback(async (type) => {
    if (!planId) {
      if (toast) toast.warning("No hay un plan activo.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (type === 'pestel') { 
        const d = await api.scanPestel(planId); 
        mutatePestel(d, false); 
        mutatePestelDeep(); 
        if (toast) toast.success("PESTEL actualizado"); 
      }
      if (type === 'porter') { 
        const d = await api.scanPorter(planId); 
        mutatePorter(d, false); 
        mutatePorterDeep();
        if (toast) toast.success("Porter 5F actualizado"); 
      }
      if (type === 'swot') { 
        const d = await api.generateSwot(planId); 
        mutateSwot(d, false); 
        if (toast) toast.success("FODA generado"); 
      }
      refreshReadiness();
    } catch (e) { 
      if (toast) toast.error(e.message); 
    } finally {
      setIsLoading(false);
    }
  }, [planId, toast, mutatePestel, mutatePestelDeep, mutatePorter, mutatePorterDeep, mutateSwot, refreshReadiness]);

  const handleScanTows = useCallback(async () => {
    if (!planId) return;
    setTowsLoading(true);
    try {
      const d = await api.generateTows(planId);
      mutateTows(d, false);
      if (toast) toast.success('Matriz TOWS generada');
      refreshReadiness();
    } catch (e) {
      if (toast) toast.error(e.message);
    } finally {
      setTowsLoading(false);
    }
  }, [planId, toast, mutateTows, refreshReadiness]);

  const handleManualAdd = useCallback(async (type, data) => {
    if (!planId) return;
    try {
      if (type === 'pestel') { 
        const item = await api.createPestel(planId, data); 
        mutatePestel(prev => [...(prev || []), item], false); 
        mutatePestelDeep(); 
      }
      if (type === 'porter') { 
        const item = await api.createPorter(planId, data); 
        mutatePorter(prev => [...(prev || []), item], false); 
      }
      if (type === 'swot') { 
        const item = await api.createSwot(planId, data); 
        mutateSwot(prev => [...(prev || []), item], false); 
      }
      if (toast) toast.success("Agregado manualmente");
      setShowAddForm(null);
      refreshReadiness();
    } catch (e) { 
      if (toast) toast.error(e.message); 
    }
  }, [planId, toast, mutatePestel, mutatePestelDeep, mutatePorter, mutateSwot, refreshReadiness]);

  return {
    state: {
      planId,
      activeTab,
      isLoading,
      towsLoading,
      showAddForm,
      readinessKey,
      
      pestel,
      pestelDeepAnalysis,
      pestelDriftData,
      pestelEarlyWarnings,
      pestelView,
      selectedSignal,
      
      porterData,
      porterForces,
      porterDeepAnalysis,
      porterView,
      
      swot,
      tows,
      swotView,
      
      instView
    },
    actions: {
      setActiveTab,
      setShowAddForm,
      setPestelView,
      setSelectedSignal,
      setPorterView,
      setSwotView,
      setInstView,
      handleScan,
      handleScanTows,
      handleManualAdd,
      refreshReadiness
    }
  };
}
