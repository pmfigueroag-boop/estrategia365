/**
 * PorterRadar — Premium Competitive Intelligence Radar (Phase 1 Premium)
 * ======================================================================
 * CPS 0-100 scale with severity color-coding, industry benchmark overlay,
 * confidence indicators, and executive-grade tooltips.
 * Ref: Porter, M.E. (2008). The Five Competitive Forces That Shape Strategy.
 */
"use client";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const FORCE_LABELS = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
  substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
  supplier_power: 'Poder Proveedor',
};

const SEVERITY = [
  { min: 75, label: 'Crítico', color: '#ff4d6a', icon: '🔴' },
  { min: 60, label: 'Elevado', color: '#f0a500', icon: '🟠' },
  { min: 40, label: 'Moderado', color: '#6366f1', icon: '🟡' },
  { min: 0,  label: 'Bajo', color: '#00c896', icon: '🟢' },
];

function getSeverity(cps) {
  return SEVERITY.find(s => cps >= s.min) || SEVERITY[3];
}

// Industry benchmark defaults (Higher Education / Services avg)
const BENCHMARK = {
  rivalry: 65, new_entrants: 50, substitutes: 55,
  buyer_power: 60, supplier_power: 40,
};

export default function PorterRadar({ forces = [] }) {
  if (!forces.length) return null;

  const data = forces.map(f => {
    const force = f.force_name || f.force || 'unknown';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    const sev = getSeverity(cps);
    return {
      force: FORCE_LABELS[force] || force,
      forceKey: force,
      cps: Math.round(cps),
      score: f.score || 3,
      trend: f.trend || 'stable',
      probability: f.probability || 50,
      benchmark: BENCHMARK[force] || 50,
      severity: sev.label,
      severityColor: sev.color,
      severityIcon: sev.icon,
      fullMark: 100,
    };
  });

  const avgCPS = data.reduce((s, d) => s + d.cps, 0) / (data.length || 1);
  const maxCPS = Math.max(...data.map(d => d.cps));
  const dominant = data.find(d => d.cps === maxCPS);
  const sev = getSeverity(avgCPS);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(10,15,26,0.97)', border: `1px solid ${d.severityColor}40`,
        borderRadius: '10px', padding: '0.85rem', minWidth: '200px',
        boxShadow: `0 4px 20px ${d.severityColor}20`,
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: d.severityColor }}>
          {d.severityIcon} {d.force}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>CPS:</span>
          <span style={{ fontWeight: 700, color: d.severityColor }}>{d.cps}/100</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Score:</span>
          <span>{d.score}/5</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Tendencia:</span>
          <span>{d.trend === 'improving' ? '📈 Intensificando' : d.trend === 'declining' ? '📉 Disminuyendo' : '➡️ Estable'}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Probabilidad:</span>
          <span>{d.probability}%</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Benchmark:</span>
          <span style={{ color: 'rgba(99,102,241,0.8)' }}>{d.benchmark}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Severidad:</span>
          <span style={{ color: d.severityColor, fontWeight: 600 }}>{d.severity}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>⚔️ Radar Competitivo Ejecutivo</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Competitive Pressure Score (0-100) • Porter Five Forces</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: sev.color, lineHeight: 1 }}>{Math.round(avgCPS)}</div>
          <div style={{ fontSize: '0.65rem', color: sev.color, fontWeight: 600 }}>{sev.icon} {sev.label}</div>
        </div>
      </div>

      {/* Radar */}
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="force"
            tick={({ x, y, payload, index }) => {
              const d = data[index];
              return (
                <g>
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                        fill={d?.severityColor || 'var(--text-secondary)'} fontSize={11} fontWeight={600}>
                    {payload.value}
                  </text>
                  <text x={x} y={y + 14} textAnchor="middle"
                        fill={d?.severityColor || 'var(--text-tertiary)'} fontSize={10} fontWeight={700}>
                    {d?.cps}
                  </text>
                </g>
              );
            }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }}
                           tickCount={5} />
          {/* Benchmark layer */}
          <Radar name="Benchmark Industria" dataKey="benchmark"
                 stroke="rgba(99,102,241,0.5)" fill="rgba(99,102,241,0.08)"
                 strokeWidth={1} strokeDasharray="4 4" />
          {/* CPS layer */}
          <Radar name="CPS Actual" dataKey="cps"
                 stroke={sev.color} fill={`${sev.color}25`}
                 strokeWidth={2.5} dot={{ r: 5, fill: sev.color, strokeWidth: 2, stroke: '#0a0f1a' }} />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Bottom strip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span>🎯 Dominante: <strong style={{ color: dominant?.severityColor }}>{dominant?.force} ({dominant?.cps})</strong></span>
          <span>📊 Max: <strong style={{ color: '#ff4d6a' }}>{maxCPS}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem' }}>
          {SEVERITY.map((s, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: s.color }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              {s.label}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'rgba(99,102,241,0.7)' }}>
            <span style={{ width: 12, height: 0, borderTop: '2px dashed rgba(99,102,241,0.5)', display: 'inline-block' }} />
            Benchmark
          </span>
        </div>
      </div>
    </div>
  );
}
