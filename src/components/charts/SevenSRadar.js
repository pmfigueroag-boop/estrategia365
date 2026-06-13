/**
 * SevenSRadar — McKinsey 7S Radar Chart (Phase 4)
 * ==================================================
 */
"use client";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const S_LABELS = {
  strategy: 'Estrategia',
  structure: 'Estructura',
  systems: 'Sistemas',
  shared_values: 'Valores',
  style: 'Estilo',
  staff: 'Personal',
  skills: 'Habilidades',
};

export default function SevenSRadar({ assessment, targetScores }) {
  if (!assessment) return null;

  // assessment can be an object with {strategy: 4, structure: 3, ...} or array
  const dimensions = Object.keys(S_LABELS);
  const data = dimensions.map(dim => ({
    dimension: S_LABELS[dim],
    current: assessment[dim] || assessment[dim + '_score'] || 0,
    target: targetScores?.[dim] || 5,
    fullMark: 5,
  }));

  const avgScore = data.reduce((s, d) => s + d.current, 0) / (data.length || 1);
  const alignment = avgScore >= 4 ? 'Alta' : avgScore >= 2.5 ? 'Moderada' : 'Baja';
  const alignColor = avgScore >= 4 ? '#10b981' : avgScore >= 2.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>🔷 Radar 7S</h3>
        <span style={{ fontSize: '0.85rem', color: alignColor, fontWeight: 600 }}>
          Alineación: {alignment} ({avgScore.toFixed(1)}/5)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
          <Radar name="Actual" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
          {targetScores && (
            <Radar name="Objetivo" dataKey="target" stroke="#10b981" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
          )}
          <Tooltip
            contentStyle={{ background: 'rgba(10,15,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
            formatter={(val) => [`${val}/5`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
