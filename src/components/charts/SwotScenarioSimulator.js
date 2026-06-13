/**
 * SwotScenarioSimulator — Adaptive FODA Scenario Engine (Fase 3)
 * ==============================================================
 * Simula cómo cambia el FODA ante shocks externos.
 * Shocks predefinidos: inflación, IA disruptiva, nuevo competidor,
 * cambio regulatorio, crisis reputacional.
 * Muestra delta de impacto por factor y reposicionamiento estratégico.
 */
"use client";
import { useState } from 'react';

const Q = {
  strength:    { color: '#10b981', icon: '💪', label: 'Fortaleza' },
  weakness:    { color: '#ff4d6a', icon: '⚠️', label: 'Debilidad' },
  opportunity: { color: '#6366f1', icon: '🚀', label: 'Oportunidad' },
  threat:      { color: '#f59e0b', icon: '🔥', label: 'Amenaza' },
};

const SCENARIOS = [
  {
    id: 'ai_disruption',
    icon: '🤖', label: 'Disrupción IA',
    desc: 'Adopción masiva de IA en el sector reemplaza procesos clave',
    deltas: { strength: -0.6, weakness: +1.2, opportunity: +0.8, threat: +1.5 },
    posture: 'DEFENSIVA + TRANSFORMACIÓN',
    postureColor: '#f59e0b',
    doctrine: 'Dynamic Capabilities — Desarrolla capacidades de absorción. Las fortalezas tecnológicas escalan; las operativas colapsan.',
    tows: { FO: 'Pivotar hacia servicios de alto valor con IA embebida', FA: 'Usar marca/relaciones para ganar tiempo ante sustitución', DO: 'Automatizar debilidades antes que el mercado lo exija', DA: 'Reducir exposición en segmentos más vulnerables' },
  },
  {
    id: 'inflation_shock',
    icon: '📈', label: 'Shock Inflacionario',
    desc: 'Inflación sostenida ≥8% durante 18 meses comprime márgenes',
    deltas: { strength: -0.3, weakness: +0.9, opportunity: -0.5, threat: +1.1 },
    posture: 'DEFENSIVA',
    postureColor: '#ff4d6a',
    doctrine: 'Operational Resilience — Priorizar cash flow y pricing power. Las oportunidades se contraen; las amenazas financieras escalan.',
    tows: { FO: 'Aprovechar poder de marca para repricing', FA: 'Eficiencia operativa como escudo competitivo', DO: 'Renegociar cadena de valor para reducir exposición', DA: 'Liquidar posiciones estratégicas no críticas' },
  },
  {
    id: 'new_competitor',
    icon: '🦁', label: 'Nuevo Competidor Agresivo',
    desc: 'Entrante con capital abundante y modelo disruptivo de precios',
    deltas: { strength: -0.4, weakness: +0.7, opportunity: -0.3, threat: +1.8 },
    posture: 'DIFERENCIACIÓN URGENTE',
    postureColor: '#6366f1',
    doctrine: 'Porter Cost Leadership + Blue Ocean — Redefinir el segmento o competir en dimensiones donde el entrante es débil.',
    tows: { FO: 'Acelerar lock-in de clientes clave con valor diferencial', FA: 'Fortalezas relacionales como barrera de entrada', DO: 'Pivotar a segmentos no atractivos para el entrante', DA: 'Alianza estratégica defensiva o consolidación' },
  },
  {
    id: 'regulatory_change',
    icon: '📜', label: 'Cambio Regulatorio',
    desc: 'Nueva regulación sectorial aumenta carga de compliance 40%',
    deltas: { strength: -0.2, weakness: +0.8, opportunity: +0.3, threat: +1.0 },
    posture: 'COMPLIANCE BY DESIGN',
    postureColor: '#10b981',
    doctrine: 'Compliance como ventaja competitiva — Las organizaciones con capacidades de gobernanza robustas convierten el compliance en barrera de entrada.',
    tows: { FO: 'Liderar estándares del sector y capturar mercado de los rezagados', FA: 'Capacidades regulatorias como escudo ante penalizaciones', DO: 'Invertir en compliance para cerrar brecha ante competidores', DA: 'Lobby estratégico y adaptación progresiva' },
  },
  {
    id: 'reputational_crisis',
    icon: '🔥', label: 'Crisis Reputacional',
    desc: 'Evento mediático severo afecta percepción de marca durante 6 meses',
    deltas: { strength: -1.2, weakness: +1.5, opportunity: -0.8, threat: +2.0 },
    posture: 'SUPERVIVENCIA → RECUPERACIÓN',
    postureColor: '#ff4d6a',
    doctrine: 'Kotter Change Management + Stakeholder Recovery — La crisis erosiona fortalezas de marca y amplifica todas las debilidades existentes.',
    tows: { FO: 'Activar embajadores internos y socios como escudos reputacionales', FA: 'Fortalezas operativas para sostener confianza en entrega', DO: 'Reestructurar narrativa corporativa con acciones tangibles', DA: 'Reducir exposición pública y priorizar recuperación silenciosa' },
  },
];

export default function SwotScenarioSimulator({ swot = [] }) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [intensity, setIntensity] = useState(1.0); // 0.5 = mild, 1 = base, 1.5 = severe

  if (!swot.length) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</div>
      <p>Genera el análisis FODA para activar el Scenario Simulator.</p>
    </div>
  );

  const scenario = SCENARIOS.find(s => s.id === activeScenario);

  const byQ = { strength: [], weakness: [], opportunity: [], threat: [] };
  swot.forEach(s => { if (byQ[s.quadrant]) byQ[s.quadrant].push(s); });

  const baseAvg = q => {
    const items = byQ[q];
    if (!items.length) return 3;
    return items.reduce((s, i) => s + (i.impact_score || 3), 0) / items.length;
  };

  const simAvg = q => {
    if (!scenario) return baseAvg(q);
    return Math.max(1, Math.min(5, baseAvg(q) + scenario.deltas[q] * intensity));
  };

  const delta = q => scenario ? (simAvg(q) - baseAvg(q)).toFixed(1) : 0;

  const INTENSITY_LABELS = { 0.5: 'Leve', 1.0: 'Moderado', 1.5: 'Severo' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>FODA Scenario Simulator</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            ¿Qué pasa con tu FODA si…? · Simulación de shocks estratégicos · Modelo adaptativo vivo
          </div>
        </div>
        {scenario && (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[0.5, 1.0, 1.5].map(v => (
              <button key={v} onClick={() => setIntensity(v)} style={{
                padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
                border: `1px solid ${intensity === v ? scenario.postureColor : 'rgba(255,255,255,0.08)'}`,
                background: intensity === v ? `${scenario.postureColor}18` : 'transparent',
                color: intensity === v ? scenario.postureColor : 'var(--text-tertiary)', fontWeight: intensity === v ? 700 : 400,
              }}>{INTENSITY_LABELS[v]}</button>
            ))}
          </div>
        )}
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
        {SCENARIOS.map(s => {
          const isActive = activeScenario === s.id;
          return (
            <div key={s.id} onClick={() => setActiveScenario(isActive ? null : s.id)} style={{
              padding: '0.85rem 0.65rem', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              background: isActive ? `${s.postureColor}12` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? s.postureColor + '55' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s', transform: isActive ? 'translateY(-2px)' : 'none',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: isActive ? 700 : 400, color: isActive ? s.postureColor : 'var(--text-secondary)', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {!scenario ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>☝️</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selecciona un escenario para simular su impacto en el FODA</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>5 shocks estratégicos disponibles · Intensidad ajustable</div>
        </div>
      ) : (
        <>
          {/* Scenario info */}
          <div style={{
            padding: '1rem 1.25rem', borderRadius: 12,
            background: `${scenario.postureColor}08`, border: `1px solid ${scenario.postureColor}33`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{scenario.icon}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{scenario.label}</span>
                <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: 6, background: `${scenario.postureColor}25`, color: scenario.postureColor, fontWeight: 700 }}>
                  {INTENSITY_LABELS[intensity].toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{scenario.desc}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.6rem 1rem', borderRadius: 10, background: `${scenario.postureColor}15`, border: `1px solid ${scenario.postureColor}33` }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>POSTURA</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: scenario.postureColor }}>{scenario.posture}</div>
            </div>
          </div>

          {/* Delta bars */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Impacto del Shock sobre los Cuadrantes FODA (Base → Simulado)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {Object.entries(Q).map(([q, cfg]) => {
                const base = baseAvg(q);
                const sim = simAvg(q);
                const d = parseFloat(delta(q));
                const isNeg = d < 0;
                const isThreaten = q === 'threat' || q === 'weakness';
                const isGood = (isThreaten && d < 0) || (!isThreaten && d > 0);
                const deltaColor = isGood ? '#10b981' : Math.abs(d) > 0.8 ? '#ff4d6a' : '#f59e0b';
                return (
                  <div key={q} style={{ padding: '1rem', borderRadius: 10, background: `${cfg.color}06`, border: `1px solid ${cfg.color}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: deltaColor }}>
                        {d > 0 ? '+' : ''}{d} {d > 0 ? '↑' : d < 0 ? '↓' : '—'}
                      </span>
                    </div>
                    {/* Base bar */}
                    <div style={{ marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>
                        <span>Base</span><span>{base.toFixed(1)}/5</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(base / 5) * 100}%`, background: `${cfg.color}66`, borderRadius: 3 }} />
                      </div>
                    </div>
                    {/* Simulated bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>
                        <span>Simulado</span><span style={{ color: deltaColor, fontWeight: 700 }}>{sim.toFixed(1)}/5</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(sim / 5) * 100}%`, background: deltaColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doctrine + TOWS response */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: `3px solid ${scenario.postureColor}` }}>
              <div style={{ fontSize: '0.65rem', color: scenario.postureColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                📘 Marco Doctrinal
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{scenario.doctrine}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                ⚡ Respuestas TOWS Adaptadas
              </div>
              {Object.entries(scenario.tows).map(([ct, strat]) => {
                const colors = { FO: '#10b981', FA: '#6366f1', DO: '#f59e0b', DA: '#ff4d6a' };
                return (
                  <div key={ct} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: colors[ct], padding: '0.15rem 0.35rem', borderRadius: 4, background: `${colors[ct]}18`, whiteSpace: 'nowrap', flexShrink: 0 }}>{ct}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{strat}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item-level impact */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Factores Más Afectados
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {swot.sort((a, b) => (b.impact_score || 3) - (a.impact_score || 3)).slice(0, 6).map((item, i) => {
                const cfg = Q[item.quadrant];
                const d = scenario.deltas[item.quadrant] * intensity;
                const newImpact = Math.max(1, Math.min(5, (item.impact_score || 3) + d));
                const deltaColor = d < -0.5 ? '#ff4d6a' : d > 0.5 ? (item.quadrant === 'threat' || item.quadrant === 'weakness' ? '#ff4d6a' : '#10b981') : '#6366f1';
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 80px 80px 50px', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.9rem' }}>{cfg.icon}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {item.description?.length > 55 ? item.description.slice(0, 55) + '…' : item.description}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>{item.impact_score || 3}</span>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                      <span style={{ color: deltaColor, fontWeight: 700 }}>{newImpact.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(newImpact / 5) * 100}%`, background: deltaColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: deltaColor, fontWeight: 700, textAlign: 'right' }}>
                      {d > 0 ? '+' : ''}{d.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
