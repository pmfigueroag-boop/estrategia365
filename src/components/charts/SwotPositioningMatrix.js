/**
 * SwotPositioningMatrix — Strategic Positioning Matrix (Fase 2)
 * =============================================================
 * Evolución premium del cuadrante FODA clásico.
 * Ejes: Impacto (Y) vs Controlabilidad (X).
 * Tamaño del nodo = Urgencia. Color = cuadrante FODA.
 * Clusters, filtros, tooltip rico.
 * McKinsey / Gartner strategy board aesthetic.
 */
"use client";
import { useState } from 'react';

const Q = {
  strength:    { color: '#10b981', icon: '💪', label: 'Fortaleza',    zone: 'Capitalizar' },
  weakness:    { color: '#ff4d6a', icon: '⚠️', label: 'Debilidad',    zone: 'Resolver' },
  opportunity: { color: '#6366f1', icon: '🚀', label: 'Oportunidad',  zone: 'Capturar' },
  threat:      { color: '#f59e0b', icon: '🔥', label: 'Amenaza',      zone: 'Mitigar' },
};

function getControllability(item) {
  // Internal factors are more controllable
  return (item.quadrant === 'strength' || item.quadrant === 'weakness') ? 65 + (item.priority || 3) * 5 : 25 + (item.priority || 3) * 5;
}

export default function SwotPositioningMatrix({ swot = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!swot.length) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
      <p>Genera el análisis FODA para ver la matriz de posicionamiento.</p>
    </div>
  );

  const enriched = swot.map(item => ({
    ...item,
    impact: item.impact_score || 3,
    controllability: getControllability(item),
    urgency: item.priority || 3,
    cfg: Q[item.quadrant] || Q.strength,
  }));

  const filtered = filter === 'all' ? enriched : enriched.filter(i => i.quadrant === filter);

  // Chart dimensions
  const W = 580, H = 380;
  const PAD = { top: 40, right: 30, bottom: 50, left: 55 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const xScale = v => PAD.left + (v / 100) * cW;          // controllability 0-100
  const yScale = v => PAD.top + cH - ((v - 1) / 4) * cH; // impact 1-5

  const sel = selected ? enriched.find(i => (i.id || i.description) === selected) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Positioning Matrix</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Impacto × Controlabilidad · Tamaño = Urgencia · Supera el cuadrante estático
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[{ k: 'all', l: '🔢 Todos' }, ...Object.entries(Q).map(([k,v]) => ({ k, l: `${v.icon} ${v.label.slice(0,4)}` }))].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{
              padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${filter === f.k ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: filter === f.k ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === f.k ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: filter === f.k ? 700 : 400,
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1rem', position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="zoneHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4d6a" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ff4d6a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="zoneLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
              </linearGradient>
            </defs>

            {/* Zone shading */}
            <rect x={PAD.left} y={PAD.top} width={cW / 2} height={cH / 2} fill="url(#zoneHigh)" rx="4" />
            <rect x={PAD.left + cW / 2} y={PAD.top + cH / 2} width={cW / 2} height={cH / 2} fill="url(#zoneLow)" rx="4" />

            {/* Grid */}
            {[1, 2, 3, 4, 5].map(v => (
              <g key={v}>
                <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="9">{v}</text>
              </g>
            ))}
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1={xScale(v)} y1={PAD.top} x2={xScale(v)} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <text x={xScale(v)} y={H - PAD.bottom + 16} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8.5">{v}%</text>
              </g>
            ))}

            {/* Axes */}
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* Axis labels */}
            <text x={PAD.left - 35} y={PAD.top + cH / 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" transform={`rotate(-90 ${PAD.left - 35} ${PAD.top + cH / 2})`}>IMPACTO</text>
            <text x={PAD.left + cW / 2} y={H - PAD.bottom + 36} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">CONTROLABILIDAD →</text>

            {/* Zone labels */}
            <text x={PAD.left + 20} y={PAD.top + 18} fill="rgba(255,77,106,0.4)" fontSize="8.5" fontWeight="700">⚠️ ALTO RIESGO</text>
            <text x={W - PAD.right - 20} y={H - PAD.bottom - 15} textAnchor="end" fill="rgba(16,185,129,0.4)" fontSize="8.5" fontWeight="700">✅ ZONA ESTABLE</text>

            {/* Nodes */}
            {filtered.map((item, i) => {
              const cx = xScale(item.controllability);
              const cy = yScale(item.impact);
              const r = 9 + item.urgency * 4;
              const isSel = selected === (item.id || item.description);
              const dimmed = selected && !isSel;
              const key = item.id || item.description;
              return (
                <g key={i}
                  onClick={() => setSelected(isSel ? null : key)}
                  onMouseEnter={e => setTooltip({ item, cx, cy })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.2 : 1, transition: 'opacity 0.2s' }}>
                  {isSel && <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={item.cfg.color} strokeWidth="1.5" strokeOpacity="0.4" />}
                  <circle cx={cx} cy={cy} r={r}
                    fill={`${item.cfg.color}22`}
                    stroke={item.cfg.color}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    style={{ transition: 'all 0.2s' }} />
                  <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={item.cfg.color} fontSize={r > 14 ? 10 : 8.5} fontWeight="800">{item.cfg.short}</text>
                </g>
              );
            })}

            {/* Tooltip */}
            {tooltip && !selected && (
              <g>
                <rect x={tooltip.cx + 10} y={tooltip.cy - 30} width="140" height="52" rx="6"
                  fill="rgba(8,12,22,0.97)" stroke={tooltip.item.cfg.color} strokeOpacity="0.4" strokeWidth="1" />
                <text x={tooltip.cx + 15} y={tooltip.cy - 12} fill={tooltip.item.cfg.color} fontSize="9" fontWeight="700">
                  {tooltip.item.cfg.icon} {tooltip.item.cfg.label}
                </text>
                <text x={tooltip.cx + 15} y={tooltip.cy + 1} fill="rgba(255,255,255,0.5)" fontSize="7.5">
                  {(tooltip.item.description || '').slice(0, 22)}…
                </text>
                <text x={tooltip.cx + 15} y={tooltip.cy + 14} fill="rgba(255,255,255,0.35)" fontSize="7.5">
                  Imp: {tooltip.item.impact} · Ctrl: {Math.round(tooltip.item.controllability)}%
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: sel.cfg.color }}>{sel.cfg.icon} {sel.cfg.label}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{sel.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                {[
                  { label: 'Impacto', value: `${sel.impact}/5`, color: sel.cfg.color },
                  { label: 'Control', value: `${Math.round(sel.controllability)}%`, color: '#6366f1' },
                  { label: 'Urgencia', value: `${sel.urgency}/5`, color: '#f59e0b' },
                ].map((k, i) => (
                  <div key={i} style={{ padding: '0.4rem', borderRadius: 8, textAlign: 'center', background: `${k.color}08`, border: `1px solid ${k.color}22` }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.6rem', padding: '0.5rem', borderRadius: 8, background: `${sel.cfg.color}08`, border: `1px solid ${sel.cfg.color}22`, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: sel.cfg.color }}>Postura: {sel.cfg.zone}</strong>
                <br />
                {sel.quadrant === 'strength' ? 'Maximiza esta capacidad y úsala como ventaja competitiva.' :
                 sel.quadrant === 'weakness' ? 'Prioriza resolución. Alta controlabilidad = acción inmediata.' :
                 sel.quadrant === 'opportunity' ? 'Ventana de captura. Alinea recursos para explotar antes que rivales.' :
                 'Diseña plan de contingencia. Reducir exposición es prioridad.'}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Guía de Cuadrantes</div>
              {[
                { zone: '↖️ Alto Imp, Baja Ctrl', desc: 'Amenazas externas críticas — planificar contingencias', color: '#ff4d6a' },
                { zone: '↗️ Alto Imp, Alta Ctrl', desc: 'Fortalezas clave — capitalizar y escalar', color: '#10b981' },
                { zone: '↙️ Bajo Imp, Baja Ctrl', desc: 'Señales de monitoreo — vigilar tendencias', color: '#6366f1' },
                { zone: '↘️ Bajo Imp, Alta Ctrl', desc: 'Mejoras internas — eficiencia operativa', color: '#f59e0b' },
              ].map((z, i) => (
                <div key={i} style={{ padding: '0.45rem', borderRadius: 7, marginBottom: '0.3rem', background: `${z.color}08`, border: `1px solid ${z.color}20` }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: z.color, marginBottom: '0.15rem' }}>{z.zone}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{z.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Distribución</div>
            {Object.entries(Q).map(([k, v]) => {
              const count = swot.filter(s => s.quadrant === k).length;
              const pct = Math.round((count / swot.length) * 100);
              return (
                <div key={k} style={{ marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.15rem' }}>
                    <span style={{ color: v.color }}>{v.icon} {v.label}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: v.color, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
