import { useFormContext } from 'react-hook-form';

const MARKET_POSITIONS = [
  { value: '', label: '— Seleccionar —' },
  { value: 'leader', label: '🏆 Líder del mercado' },
  { value: 'challenger', label: '⚔️ Retador / Competidor activo' },
  { value: 'follower', label: '📋 Seguidor del mercado' },
  { value: 'niche', label: '🎯 Nicho especializado' },
];

export default function StepMission({ onPrev, onNext }) {
  const { register } = useFormContext();

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-2">🎯 Fundamento Estratégico</h2>
      <p className="text-gray-400 text-sm mb-6">
        Comparte la misión, visión y valores actuales de tu organización. 
        Estos son los declarados actualmente — podrán reformularse durante el análisis estratégico.
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <label className="form-label">Misión Actual</label>
          <textarea 
            className="form-textarea min-h-[100px]" 
            {...register('mission')}
            placeholder="¿Cuál es la razón de ser de tu organización? ¿Qué necesidad satisface? ¿Para quién existe?"
          />
        </div>

        <div>
          <label className="form-label">Visión Actual</label>
          <textarea 
            className="form-textarea min-h-[100px]" 
            {...register('vision')}
            placeholder="¿Hacia dónde quiere llegar la organización en 3-5 años? ¿Cuál es el estado futuro deseado?"
          />
        </div>

        <div>
          <label className="form-label">Valores Organizacionales</label>
          <textarea 
            className="form-textarea min-h-[80px]" 
            {...register('values')}
            placeholder="¿Cuáles son los valores fundamentales que guían el comportamiento de la organización? (ej: integridad, innovación, excelencia, servicio)"
          />
        </div>

        <div>
          <label className="form-label accent">Productos y Servicios</label>
          <textarea 
            className="form-textarea min-h-[100px]" 
            {...register('products_services')}
            placeholder="¿Qué productos o servicios ofrece tu organización? ¿Cuáles son los principales? ¿Cuáles generan más valor?"
          />
        </div>

        <div>
          <label className="form-label">Posición en el Mercado</label>
          <select className="form-textarea min-h-[auto] py-2 px-3" {...register('market_position')}>
            {MARKET_POSITIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            ¿Cómo describirías la posición competitiva actual de tu organización?
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
