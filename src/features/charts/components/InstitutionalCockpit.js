/**
 * InstitutionalCockpit — Cross-Module Strategic Command Center
 * ==============================================================
 * El dashboard ejecutivo definitivo. Unifica señales de:
 *   Porter → intensidad competitiva
 *   PESTEL → volatilidad del entorno
 *   FODA  → balance estratégico
 *   VRIO  → ventaja competitiva
 *   BCG   → salud del portafolio
 *   Blue Ocean → potencial de océano azul
 *
 * Visual: terminal de control de misión con KPIs transversales,
 * alertas prioritarias, radar de preparación y action queue.
 * Board-ready single view.
 */
"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const MODULE_META = {
  porter:    { label: 'Porter 5F',    icon: '⚔️', color: '#6366f1', desc: 'Intensidad competitiva' },
  pestel:    { label: 'PESTEL',       icon: '🌍', color: '#10b981', desc: 'Volatilidad del entorno' },
  foda:      { label: 'FODA/SWOT',    icon: '🎯', color: '#f59e0b', desc: 'Balance estratégico' },
  vrio:      { label: 'VRIO',         icon: '💎', color: '#8b5cf6', desc: 'Ventaja competitiva' },
  bcg:       { label: 'BCG',          icon: '📊', color: '#ec4899', desc: 'Salud del portafolio' },
  blueocean: { label: 'Blue Ocean',   icon: '🌊', color: '#06b6d4', desc: 'Potencial de diferenciación' },
};

function assessModule(key, data) {
  if (!data || (Array.isArray(data) && data.length === 0)) return { ready: false, score: 0, signal: 'Sin datos' };
  switch (key) {
    case 'porter': {
      const forces = data.forces || [];
      const avg = forces.length ? forces.reduce((s, f) => s + (f.intensity || 3), 0) / forces.length : 0;
      return { ready: true, score: Math.round((5 - avg) / 4 * 100), signal: avg >= 3.5 ? 'Alta presión competitiva' : avg >= 2.5 ? 'Presión moderada' : 'Entorno favorable' };
    }
    case 'pestel': {
      const signals = data.signals || data;
      const count = Array.isArray(signals) ? signals.length : 0;
      const highImpact = Array.isArray(signals) ? signals.filter(s => (s.impact_score || s.impact) >= 4).length : 0;
      return { ready: count > 0, score: count > 0 ? Math.round(Math.max(20, 100 - highImpact * 12)) : 0, signal: highImpact > 3 ? 'Múltiples señales críticas' : highImpact > 0 ? `${highImpact} señal(es) de alto impacto` : 'Entorno estable' };
    }
    case 'foda': {
      const items = Array.isArray(data) ? data : [];
      const strengths = items.filter(i => i.quadrant === 'strength').length;
      const weaknesses = items.filter(i => i.quadrant === 'weakness').length;
      const balance = items.length ? Math.round((strengths / Math.max(1, strengths + weaknesses)) * 100) : 0;
      return { ready: items.length > 0, score: balance, signal: balance >= 60 ? 'Posición interna sólida' : balance >= 40 ? 'Balance mixto' : 'Predominan debilidades' };
    }
    case 'vrio': {
      const resources = data.resources || [];
      const sustained = resources.filter(r => r.vrio_result === 'sustained_advantage').length;
      return { ready: resources.length > 0, score: resources.length ? Math.round((sustained / resources.length) * 100) : 0, signal: sustained > 0 ? `${sustained} ventaja(s) sostenible(s)` : 'Sin ventaja sostenible' };
    }
    case 'bcg': {
      const units = data.units || [];
      const stars = units.filter(u => u.quadrant === 'star').length;
      const cows = units.filter(u => u.quadrant === 'cow').length;
      return { ready: units.length > 0, score: units.length ? Math.round(((stars + cows) / units.length) * 100) : 0, signal: stars > 0 && cows > 0 ? 'Portafolio saludable' : stars > 0 ? 'Crecimiento activo' : cows > 0 ? 'Generación de caja' : 'Portafolio débil' };
    }
    case 'blueocean': {
      const factors = data.factors || [];
      const totalDiv = factors.reduce((s, f) => s + Math.abs((f.proposed_score || 0) - (f.industry_score || 0)), 0);
      const maxDiv = factors.length * 4;
      return { ready: factors.length > 0, score: maxDiv > 0 ? Math.round((totalDiv / maxDiv) * 100) : 0, signal: totalDiv / Math.max(1, factors.length) >= 1.5 ? 'Divergencia activa' : 'Océano rojo' };
    }
    default: return { ready: false, score: 0, signal: 'Desconocido' };
  }
}

function gaugeArc(cx, cy, r, pct) {
  const startAngle = -Math.PI * 0.75;
  const angle = pct * Math.PI * 1.5 + startAngle;
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
  const large = pct > 0.5 ? 1 : 0;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function MiniGauge({ score, color, size = 52 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <path d={gaugeArc(cx, cy, r, 1)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.09} strokeLinecap="round" />
      <path d={gaugeArc(cx, cy, r, score / 100)} fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round" />
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size * 0.24} fontWeight="900">{score}</text>
    </svg>
  );
}

export default function InstitutionalCockpit({ planId }) {
  const [moduleData, setModuleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    Promise.allSettled([
      api.getPorter(planId).then(d => ['porter', d]),
      api.getPestel(planId).then(d => ['pestel', d]),
      api.getSwot(planId).then(d => ['foda', d]),
      api.getVrio(planId).then(d => ['vrio', d]),
      api.getBCG(planId).then(d => ['bcg', d]),
      api.getBlueOcean(planId).then(d => ['blueocean', d]),
    ]).then(results => {
      const data = {};
      results.forEach(r => { if (r.status === 'fulfilled' && r.value) { data[r.value[0]] = r.value[1]; } });
      setModuleData(data);
      setLoading(false);
    });
  }, [planId]);

  const assessments = Object.entries(MODULE_META).map(([key, meta]) => ({
    key, ...meta, ...assessModule(key, moduleData[key]),
  }));

  const readyCount = assessments.filter(a => a.ready).length;
  const avgScore = assessments.filter(a => a.ready).length > 0
    ? Math.round(assessments.filter(a => a.ready).reduce((s, a) => s + a.score, 0) / assessments.filter(a => a.ready).length) : 0;

  const overallPosture = avgScore >= 65 ? { label: 'POSICIÓN ESTRATÉGICA SÓLIDA', color: '#10b981', icon: '✅' }
    : avgScore >= 45 ? { label: 'POSICIÓN ESTRATÉGICA MIXTA', color: '#f59e0b', icon: '⚠️' }
    : avgScore >= 20 ? { label: 'POSICIÓN ESTRATÉGICA DÉBIL', color: '#ff4d6a', icon: '🔴' }
    : { label: 'ANÁLISIS INCOMPLETO', color: '#94a3b8', icon: '⏳' };

  const alerts = assessments.filter(a => a.ready && a.score < 40).map(a => ({
    icon: a.icon, label: a.label, signal: a.signal, color: '#ff4d6a', priority: 'P1',
  }));
  const positives = assessments.filter(a => a.ready && a.score >= 70).map(a => ({
    icon: a.icon, label: a.label, signal: a.signal, color: '#10b981',
  }));

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
        <div style={{ color: 'var(--text-secondary)' }}>Cargando inteligencia de 6 módulos estratégicos…</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Master header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: `4px solid ${overallPosture.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <span style={{ fontSize: '1.3rem' }}>{overallPosture.icon}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: overallPosture.color }}>{overallPosture.label}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', paddingLeft: '2.2rem' }}>
            Institutional Strategic Command Center · {readyCount}/6 módulos activos · Estrategia 365
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <MiniGauge score={avgScore} color={overallPosture.color} size={68} />
            <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: '-0.2rem' }}>SCORE GLOBAL</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.4rem 0.75rem', borderRadius: 9, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>READINESS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: readyCount === 6 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{readyCount}/6</div>
          </div>
        </div>
      </div>

      {/* Module grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {assessments.map(a => {
          const isExp = expanded === a.key;
          return (
            <div key={a.key} onClick={() => setExpanded(isExp ? null : a.key)} style={{
              padding: '1rem', borderRadius: 12, cursor: 'pointer',
              background: isExp ? `${a.color}12` : a.ready ? `${a.color}06` : 'rgba(255,255,255,0.02)',
              border: `1.5px solid ${isExp ? a.color + '55' : a.ready ? a.color + '25' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s', transform: isExp ? 'translateY(-2px)' : 'none',
              opacity: a.ready ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', marginBottom: '0.1rem' }}>{a.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: a.color }}>{a.label}</div>
                </div>
                <MiniGauge score={a.score} color={a.color} size={48} />
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>{a.desc}</div>
              <div style={{ fontSize: '0.65rem', color: a.score >= 60 ? '#10b981' : a.score >= 35 ? '#f59e0b' : '#ff4d6a', fontWeight: 600 }}>
                {a.ready ? a.signal : '⏳ Pendiente de generación'}
              </div>
              {a.ready && (
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: '0.4rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${a.score}%`, background: a.color, borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Alerts */}
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>🔴 Señales de Alerta</div>
          {alerts.length > 0 ? alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: 8, background: 'rgba(255,77,106,0.07)', border: '1px solid rgba(255,77,106,0.2)' }}>
              <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, background: 'rgba(255,77,106,0.2)', fontSize: '0.58rem', fontWeight: 800, color: '#ff4d6a' }}>P1</span>
              <span style={{ fontSize: '0.7rem' }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                <div style={{ fontSize: '0.6rem', color: '#ff4d6a' }}>{a.signal}</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: '0.5rem', fontSize: '0.7rem', color: '#10b981' }}>✅ Sin alertas críticas activas</div>
          )}
        </div>

        {/* Strengths */}
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>✅ Fortalezas del Portafolio</div>
          {positives.length > 0 ? positives.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', padding: '0.35rem 0.5rem', borderRadius: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ fontSize: '0.7rem' }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.label}</div>
                <div style={{ fontSize: '0.6rem', color: '#10b981' }}>{p.signal}</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Genera más módulos para identificar fortalezas</div>
          )}
        </div>
      </div>

      {/* Readiness radar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>📡 Preparación Estratégica por Módulo</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {assessments.map(a => (
            <div key={a.key} style={{ flex: '1 1 120px', padding: '0.6rem', borderRadius: 9, background: `${a.color}06`, border: `1px solid ${a.color}22`, textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem' }}>{a.icon}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: a.color, marginTop: '0.1rem' }}>{a.label}</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, margin: '0.3rem 0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.score}%`, background: a.color, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: '0.6rem', color: a.ready ? a.color : 'var(--text-tertiary)' }}>
                {a.ready ? `${a.score}%` : 'Pendiente'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>Institutional Strategic Intelligence</strong> — Integra Porter (1979) · PESTEL · Weihrich (1982) · Barney (1991) · Henderson (1970) · Kim & Mauborgne (2005) en una sola vista ejecutiva
      </div>
    </div>
  );
}
