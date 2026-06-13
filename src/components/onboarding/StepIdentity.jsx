import { useFormContext } from 'react-hook-form';

const SECTORS = [
  { value: 'private', label: '🏢 Sector Privado' },
  { value: 'public', label: '🏛️ Sector Público' },
];

const SIZES = [
  { value: 'startup', label: 'Startup (1-50)' },
  { value: 'pyme', label: 'PYME (51-250)' },
  { value: 'enterprise', label: 'Corporación (250+)' },
  { value: 'government', label: 'Entidad Pública' },
];

const INDUSTRIES = [
  'Tecnología', 'Salud', 'Finanzas', 'Educación', 'Energía', 'Manufactura',
  'Retail', 'Telecomunicaciones', 'Construcción', 'Turismo', 'Agroindustria',
  'Gobierno', 'ONG', 'Consultoría', 'Otro'
];

const COUNTRIES = [
  { value: '', label: 'Seleccionar país...' },
  { value: 'DO', label: '🇩🇴 República Dominicana' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'PE', label: '🇵🇪 Perú' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'PA', label: '🇵🇦 Panamá' },
  { value: 'CR', label: '🇨🇷 Costa Rica' },
  { value: 'ES', label: '🇪🇸 España' },
  { value: 'UK', label: '🇬🇧 Reino Unido' },
  { value: 'DE', label: '🇩🇪 Alemania' },
  { value: 'OTHER', label: '🌍 Otro' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'DOP', label: 'DOP (RD$)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'COP', label: 'COP ($)' },
  { value: 'BRL', label: 'BRL (R$)' },
];

const PRESENCE = [
  { value: '', label: '— Seleccionar —' },
  { value: 'local', label: '📍 Local (un solo mercado)' },
  { value: 'regional', label: '🌎 Regional (múltiples países)' },
  { value: 'global', label: '🌐 Global (presencia mundial)' },
];

export default function StepIdentity({ onNext }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const currentSector = watch('sector');

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-6">🏛️ Identidad Institucional</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="md:col-span-2">
          <label className="form-label">Nombre de la Organización *</label>
          <input 
            className={`form-textarea min-h-[auto] p-3 ${errors.name ? 'border-red-500' : ''}`} 
            {...register('name')} 
            placeholder="Ej: Ministerio de Economía o Apple Inc."
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="form-label">Sector *</label>
          <div className="flex gap-3">
            {SECTORS.map(s => (
              <button 
                key={s.value} 
                type="button"
                onClick={() => setValue('sector', s.value, { shouldValidate: true })}
                className={`flex-1 p-2 text-sm rounded-lg transition-all border ${
                  currentSector === s.value 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector.message}</p>}
        </div>

        <div>
          <label className="form-label">Industria *</label>
          <select className={`form-textarea min-h-[auto] p-3 ${errors.industry ? 'border-red-500' : ''}`} {...register('industry')}>
            <option value="">Seleccionar...</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
        </div>

        <div>
          <label className="form-label">Tamaño *</label>
          <select className={`form-textarea min-h-[auto] p-3 ${errors.size ? 'border-red-500' : ''}`} {...register('size')}>
            <option value="">Seleccionar...</option>
            {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size.message}</p>}
        </div>

        <div>
          <label className="form-label">País Principal</label>
          <select className="form-textarea min-h-[auto] p-3" {...register('country')}>
            {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Presencia Internacional</label>
          <select className="form-textarea min-h-[auto] p-3" {...register('international_presence')}>
            {PRESENCE.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Geografía / Mercado</label>
          <input className="form-textarea min-h-[auto] p-3" {...register('geography')} placeholder="Ej: Caribe, LatAm, Norteamérica"/>
        </div>

        <div>
          <label className="form-label">Empleados</label>
          <input type="number" className="form-textarea min-h-[auto] p-3" {...register('employees')} placeholder="250"/>
        </div>

        <div>
          <label className="form-label">Ingresos Anuales (aprox.)</label>
          <div className="flex gap-2">
            <select className="form-textarea min-h-[auto] p-3 w-28" {...register('annual_revenue_currency')}>
              {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input 
              type="number" 
              className="form-textarea min-h-[auto] p-3 flex-1" 
              {...register('annual_revenue_amount')} 
              placeholder="10000000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Monto aproximado en la moneda seleccionada</p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
