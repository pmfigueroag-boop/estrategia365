/**
 * PorterBscBridge — Porter → BSC Competitive KPI Bridge (Gap 1)
 * ================================================================
 * Cross-module integration connecting Porter force analysis to
 * BSC perspective objectives. Maps competitive pressures to
 * strategic KPIs across Financial, Customer, Process, Learning.
 * Ref: Porter (1980), Kaplan & Norton (1992).
 */
"use client";

const BSC_PERSPECTIVES = [
  { id: 'financial', label: 'Financiera', icon: '💰', color: '#f0a500' },
  { id: 'customer', label: 'Cliente', icon: '👥', color: '#3b82f6' },
  { id: 'process', label: 'Procesos', icon: '⚙️', color: '#6366f1' },
  { id: 'learning', label: 'Aprendizaje', icon: '📚', color: '#00c896' },
];

const FORCE_TO_BSC = {
  rivalry: [
    { perspective: 'financial', kpi: 'Market Share %', impact: 'Rivalidad alta presiona márgenes y cuota de mercado', urgency: 'high' },
    { perspective: 'customer', kpi: 'Customer Retention Rate', impact: 'Competencia intensifica rotación de clientes', urgency: 'high' },
    { perspective: 'process', kpi: 'Innovation Pipeline', impact: 'Necesidad de diferenciación operativa', urgency: 'medium' },
  ],
  new_entrants: [
    { perspective: 'financial', kpi: 'Revenue Growth Rate', impact: 'Nuevos competidores fragmentan ingresos', urgency: 'medium' },
    { perspective: 'process', kpi: 'Entry Barrier Index', impact: 'Fortalecer ventajas competitivas sostenibles', urgency: 'high' },
    { perspective: 'learning', kpi: 'Patent/IP Portfolio', impact: 'Proteger conocimiento como barrera de entrada', urgency: 'medium' },
  ],
  substitutes: [
    { perspective: 'customer', kpi: 'Value Proposition Score', impact: 'Sustitutos reducen valor percibido', urgency: 'high' },
    { perspective: 'process', kpi: 'R&D Investment %', impact: 'Innovar para mantenerse relevante', urgency: 'high' },
    { perspective: 'learning', kpi: 'Technology Readiness', impact: 'Capacidad de adoptar tecnologías disruptivas', urgency: 'medium' },
  ],
  buyer_power: [
    { perspective: 'financial', kpi: 'Price Elasticity', impact: 'Compradores fuertes comprimen precios', urgency: 'high' },
    { perspective: 'customer', kpi: 'Customer Satisfaction NPS', impact: 'Mantener lealtad vs. sensibilidad de precio', urgency: 'medium' },
    { perspective: 'process', kpi: 'Cost Efficiency Ratio', impact: 'Optimizar estructura de costos', urgency: 'medium' },
  ],
  supplier_power: [
    { perspective: 'financial', kpi: 'COGS/Revenue Ratio', impact: 'Proveedores fuertes incrementan costos', urgency: 'medium' },
    { perspective: 'process', kpi: 'Supply Chain Diversification', impact: 'Reducir dependencia de proveedores clave', urgency: 'high' },
    { perspective: 'learning', kpi: 'Strategic Partnerships', impact: 'Construir alianzas alternativas', urgency: 'low' },
  ],
};

const FORCE_LABELS = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
  substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
  supplier_power: 'Poder Proveedor',
};

const URGENCY_CONFIG = {
  high: { label: 'URGENTE', color: '#ff4d6a', bg: '#ff4d6a15' },
  medium: { label: 'MONITOR', color: '#f0a500', bg: '#f0a50012' },
  low: { label: 'BAJO', color: '#00c896', bg: '#00c89612' },
};

export default function PorterBscBridge({ forces = [] }) {
  if (!forces.length) return null;

  const forceData = forces.map(f => {
    const key = f.force_name || f.force || '';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    return { key, cps: Math.round(cps), score: f.score || 3 };
  });

  // Build KPI map: aggregate all KPIs from all forces, sorted by urgency
  const allKpis = [];
  forceData.forEach(f => {
    const mappings = FORCE_TO_BSC[f.key] || [];
    mappings.forEach(m => {
      // Upgrade urgency if force CPS is critical
      const adjustedUrgency = f.cps >= 75 ? 'high' : m.urgency;
      allKpis.push({ ...m, force: f.key, cps: f.cps, urgency: adjustedUrgency });
    });
  });

  // Group by perspective
  const byPerspective = {};
  BSC_PERSPECTIVES.forEach(p => { byPerspective[p.id] = []; });
  allKpis.forEach(k => {
    if (byPerspective[k.perspective]) byPerspective[k.perspective].push(k);
  });

  const totalKpis = allKpis.length;
  const urgentKpis = allKpis.filter(k => k.urgency === 'high').length;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
            🔗 Porter → BSC Strategic KPI Bridge
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Mapeo de presiones competitivas a objetivos BSC • Porter (1980) × Kaplan & Norton (1992)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
            background: '#ff4d6a15', color: '#ff4d6a', border: '1px solid #ff4d6a33',
          }}>
            {urgentKpis} URGENTES
          </span>
          <span style={{
            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
            background: '#6366f115', color: '#6366f1', border: '1px solid #6366f133',
          }}>
            {totalKpis} KPIs
          </span>
        </div>
      </div>

      {/* BSC Perspectives */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {BSC_PERSPECTIVES.map(perspective => {
          const kpis = byPerspective[perspective.id] || [];
          if (kpis.length === 0) return null;
          return (
            <div key={perspective.id} style={{
              padding: '0.75rem', borderRadius: '8px',
              background: `${perspective.color}06`, border: `1px solid ${perspective.color}18`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem',
                paddingBottom: '0.4rem', borderBottom: `1px solid ${perspective.color}15`,
              }}>
                <span style={{ fontSize: '1rem' }}>{perspective.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: perspective.color }}>
                  {perspective.label}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  {kpis.length} KPIs vinculados
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {kpis.map((kpi, i) => {
                  const urg = URGENCY_CONFIG[kpi.urgency];
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '130px 1fr auto',
                      alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem',
                      borderRadius: '6px', background: 'rgba(255,255,255,0.02)',
                      borderLeft: `2px solid ${urg.color}`,
                    }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {kpi.kpi}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                          ← {FORCE_LABELS[kpi.force]} (CPS {kpi.cps})
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {kpi.impact}
                      </div>
                      <span style={{
                        padding: '0.15rem 0.35rem', borderRadius: '4px', fontSize: '0.6rem',
                        fontWeight: 700, color: urg.color, background: urg.bg,
                      }}>
                        {urg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology */}
      <div style={{
        marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        🔗 Bridge doctrinario: las fuerzas competitivas de Porter se traducen a KPIs medibles
        dentro del BSC de Kaplan & Norton. Las urgencias se ajustan automáticamente cuando CPS ≥75.
      </div>
    </div>
  );
}
