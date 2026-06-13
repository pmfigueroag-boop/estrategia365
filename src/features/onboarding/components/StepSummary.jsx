'use client';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/features/plan/context/ToastContext';
import api from '@/core/infrastructure/api';

const DIMENSION_LABELS = {
  identity: '🏛️ Identidad',
  mission_vision: '🎯 Misión & Visión',
  stakeholders: '👥 Stakeholders',
  governance: '⚖️ Gobernanza',
  risk_culture: '🛡️ Riesgo & Cultura',
  operations: '🔗 Operaciones',
  metrics: '📊 Métricas',
  documents: '📄 Documentos',
};

const MATURITY_LABELS = {
  organization: '🏛️ Organización',
  governance: '⚖️ Gobernanza',
  strategy: '🎯 Estrategia',
  stakeholders: '👥 Stakeholders',
  operations: '🔗 Operaciones',
  culture: '🧬 Cultura',
  talent: '👤 Talento',
  risk: '🛡️ Riesgo',
  digital: '💻 Digital',
  transformation: '🔄 Transformación',
  analytics: '📈 Analítica',
  ai: '🤖 IA',
  staas: '🚀 StaaS',
};

const LEVEL_COLORS = {
  basic: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/50' },
  intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  advanced: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  enterprise: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/50' },
};

const LEVEL_NAMES = {
  basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado', enterprise: 'Enterprise',
};

const TIER_FEATURES = {
  free: { label: 'Free', steps: 5, color: 'text-gray-400' },
  professional: { label: 'Professional', steps: 8, color: 'text-blue-400' },
  enterprise: { label: 'Enterprise', steps: 11, color: 'text-purple-400' },
  sovereign: { label: 'Sovereign', steps: 11, color: 'text-amber-400' },
};

// ── SVG Radar Chart (CSS-only, no external libraries) ──────
function RadarChart({ scores, size = 280 }) {
  const dims = Object.entries(scores);
  const count = dims.length;
  if (count < 3) return null;

  const cx = size / 2, cy = size / 2;
  const radius = size * 0.38;
  const angleStep = (2 * Math.PI) / count;

  const getPoint = (i, value) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [2.5, 5, 7.5, 10];
  const labelPoints = dims.map(([, ], i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius + 22;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const dataPoints = dims.map(([, score], i) => getPoint(i, score));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {/* Grid circles */}
      {gridLevels.map(level => {
        const points = Array.from({ length: count }, (_, i) => getPoint(i, level));
        const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={level} d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {/* Axis lines */}
      {dims.map(([,], i) => {
        const end = getPoint(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {/* Data fill */}
      <path d={dataPath} fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.8)" strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="rgb(99,102,241)" stroke="white" strokeWidth="1" />
      ))}
      {/* Labels */}
      {labelPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="500">
          {dims[i][0].slice(0, 4).toUpperCase()}
        </text>
      ))}
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function StepSummary({ onPrev, onNext, institutionId, tier }) {
  const toast = useToast();
  const [twin, setTwin] = useState(null);
  const [maturity, setMaturity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    let active = true;
    if (!institutionId) { 
      Promise.resolve().then(() => { if (active) setLoading(false); }); 
      return () => { active = false; };
    }
    async function load() {
      Promise.resolve().then(() => { if (active) setLoading(true); });
      try {
        const [t, m] = await Promise.allSettled([
          api.getDigitalTwin(institutionId),
          api.getMaturityAssessment(institutionId),
        ]);
        if (!active) return;
        if (t.status === 'fulfilled') setTwin(t.value);
        if (m.status === 'fulfilled') setMaturity(m.value);
      } catch { /* ignore */ }
      if (active) setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [institutionId]);

  const handleAssess = async () => {
    setAssessing(true);
    try {
      const result = await api.triggerMaturityAssessment(institutionId);
      setMaturity(result);
      toast.success(`Diagnóstico completado: ${LEVEL_NAMES[result.level] || result.level} (${result.overall_score}/10)`);
    } catch (e) { toast.error(e.message); }
    setAssessing(false);
  };

  const toggleSection = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const completeness = twin?.completeness || { overall: 0, dimensions: {} };
  const levelColors = LEVEL_COLORS[maturity?.level] || LEVEL_COLORS.basic;
  const tierInfo = TIER_FEATURES[tier] || TIER_FEATURES.free;

  const highPriorityRecs = useMemo(() => 
    (maturity?.recommendations || []).filter(r => r.priority === 'high').slice(0, 5),
    [maturity]
  );

  if (loading) {
    return (
      <div className="glass-panel card animate-fade-in text-center py-16">
        <div className="text-4xl mb-4 animate-pulse">🔮</div>
        <p className="text-gray-400">Ensamblando tu Gemelo Digital...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel card animate-fade-in space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">🔮 Resumen Estratégico</h2>
        <p className="text-gray-400 text-sm">Vista holística de tu organización, diagnóstico de madurez y recomendaciones.</p>
      </div>

      {/* ── A: Completeness Score ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-indigo-400">📊 Completitud del Perfil</h3>
          <span className="text-2xl font-bold text-white">{completeness.overall}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
          <div className="h-3 rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-purple-600"
            style={{ width: `${completeness.overall}%` }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(completeness.dimensions || {}).map(([key, score]) => (
            <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: `conic-gradient(${score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'} ${score * 3.6}deg, transparent 0)`,
                }}>
                <span className="bg-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-[10px]">
                  {score}
                </span>
              </div>
              <span className="text-xs text-gray-400">{DIMENSION_LABELS[key] || key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── B: Maturity Assessment ──────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-purple-400">🎯 Diagnóstico de Madurez</h3>
          <button type="button" onClick={handleAssess} disabled={assessing}
            className="btn glass-panel border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-xs px-3 py-1">
            {assessing ? '⏳ Evaluando...' : maturity ? '🔄 Re-evaluar' : '▶️ Ejecutar Diagnóstico'}
          </button>
        </div>

        {maturity ? (
          <div className="space-y-4">
            {/* Level badge + score */}
            <div className={`flex items-center gap-4 p-4 rounded-lg border ${levelColors.bg} ${levelColors.border}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${levelColors.text}`}>{maturity.overall_score}</div>
                <div className="text-xs text-gray-500">/10</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${levelColors.text}`}>{LEVEL_NAMES[maturity.level] || maturity.level}</div>
                <div className="text-xs text-gray-500">Nivel de madurez organizacional</div>
              </div>
              <div className="ml-auto text-xs text-gray-600">
                {maturity.assessed_at ? new Date(maturity.assessed_at).toLocaleDateString() : ''}
              </div>
            </div>

            {/* Radar chart */}
            {maturity.dimension_scores && (
              <RadarChart scores={maturity.dimension_scores} />
            )}

            {/* Dimension scores breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(maturity.dimension_scores || {}).map(([key, score]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                  <div className={`w-2 h-8 rounded-full ${score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 truncate">{MATURITY_LABELS[key] || key}</div>
                    <div className="text-sm font-semibold text-white">{score}/10</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-gray-700 rounded-lg">
            <div className="text-3xl mb-2">🔬</div>
            <p className="text-gray-500 text-sm">Ejecuta el diagnóstico para evaluar tu madurez organizacional en 13 dimensiones</p>
          </div>
        )}
      </div>

      {/* ── C: Recommendations ─────────────────────────────── */}
      {highPriorityRecs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">💡 Recomendaciones Prioritarias</h3>
          <div className="space-y-2">
            {highPriorityRecs.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm text-white">{rec.gap}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{rec.dimension_label || rec.dimension}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── D: Tier Badge & Upgrade CTA ────────────────────── */}
      <div className={`p-4 rounded-lg border border-gray-700 flex items-center justify-between`}>
        <div>
          <div className="text-xs text-gray-500 mb-1">Tier Actual</div>
          <div className={`text-lg font-bold ${tierInfo.color}`}>{tierInfo.label}</div>
        </div>
        {(tier === 'free' || tier === 'professional') && (
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Desbloquea más dimensiones</div>
            <button type="button" className="btn btn-primary text-xs px-4 py-1.5"
              onClick={() => toast.info('Contacte ventas para actualizar su tier')}>
              ⬆️ Upgrade a {tier === 'free' ? 'Professional' : 'Enterprise'}
            </button>
          </div>
        )}
      </div>

      {/* ── E: Digital Twin Preview (Collapsible) ──────────── */}
      {twin && (
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">🧬 Gemelo Digital</h3>
          <div className="space-y-2">
            {[
              { key: 'identity', label: '🏛️ Identidad', data: twin.identity },
              { key: 'mission_vision', label: '🎯 Misión & Visión', data: twin.mission_vision },
              { key: 'stakeholders', label: `👥 Stakeholders (${twin.stakeholders?.length || 0})`, data: twin.stakeholders },
              { key: 'governance', label: '⚖️ Gobernanza', data: twin.governance },
              { key: 'risk_culture', label: '🛡️ Riesgo & Cultura', data: twin.risk_culture },
              { key: 'operations', label: '🔗 Operaciones', data: twin.operations },
              { key: 'metrics', label: '📊 Métricas', data: twin.metrics },
            ].map(({ key, label, data }) => (
              <div key={key} className="border border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-all text-left">
                  <span className="text-sm font-medium text-white">{label}</span>
                  <span className="text-gray-500 text-xs">{expanded[key] ? '▼' : '▶'}</span>
                </button>
                {expanded[key] && (
                  <div className="p-3 text-xs text-gray-400 bg-gray-900/50">
                    <pre className="whitespace-pre-wrap overflow-auto max-h-48 text-[11px]">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────── */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Crear Plan →</button>
      </div>
    </div>
  );
}
