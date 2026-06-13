import { useFormContext } from 'react-hook-form';

export default function StepContext({ onPrev, onSave, isSaving }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-6">🌍 Contexto Estratégico</h2>
      <div className="flex flex-col gap-6">
        <div>
          <label className="form-label">Descripción de la Organización *</label>
          <textarea 
            className={`form-textarea min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
            {...register('description')}
            placeholder="¿Qué hace tu organización? ¿Cuál es su historia? ¿Qué productos/servicios ofrece? Cuanto más detalle, mejores serán los análisis de IA."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <label className="form-label accent">Contexto Competitivo</label>
          <textarea 
            className="form-textarea min-h-[120px]" 
            {...register('competitive_context')}
            placeholder="¿Quiénes son los principales competidores? ¿Cuál es tu posición en el mercado? ¿Qué ventajas competitivas tienes? (Para sector público: ¿Qué instituciones similares existen?)"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onSave} disabled={isSaving} className={`btn btn-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isSaving ? '⏳ Guardando...' : '💾 Guardar y Continuar →'}
        </button>
      </div>
    </div>
  );
}
