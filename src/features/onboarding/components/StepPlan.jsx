import { useParadigm } from '@/features/plan/context/ParadigmContext';
import { useState } from 'react';

export default function StepPlan({ onPrev, onFinish, isSaving }) {
  const { paradigms } = useParadigm();
  const [selectedParadigm, setSelectedParadigm] = useState('competitive');

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-2">🎯 Configuración del Plan Estratégico</h2>
      <p className="text-gray-400 text-sm mb-6">
        Selecciona el marco doctrinal que guiará el análisis y la formulación. Podrás cambiarlo después desde el selector de Lente en el header.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {paradigms.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedParadigm(p.id)}
            className={`text-left p-4 rounded-xl border-2 transition-colors ${
              selectedParadigm === p.id 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-gray-700 bg-gray-800/30 hover:border-indigo-400'
            }`}
          >
            <div className="font-semibold text-sm mb-1 text-white">{p.short}</div>
            <div className="text-xs text-gray-400">{p.name}</div>
          </button>
        ))}
      </div>

      <div className="glass-panel p-4 mb-6 border-l-4 border-indigo-400 text-sm bg-gray-800/50">
        <strong className="text-indigo-400">💡 Nota:</strong> Al completar este paso se creará el plan y pasarás directamente al <strong>Análisis del Entorno</strong> (PESTEL → Porter → FODA). La formulación de Misión, Visión y estrategia se realiza <em>después</em> del análisis, informada por los datos.
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={() => onFinish(selectedParadigm)} disabled={isSaving} className={`btn btn-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isSaving ? '⏳ Creando plan...' : '✅ Completar y Comenzar Análisis'}
        </button>
      </div>
    </div>
  );
}
