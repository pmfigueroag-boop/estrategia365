"use client";
import { useToast } from '@/context/ToastContext';
import { usePlanContext } from '@/context/PlanContext';
import { useState } from 'react';
import { useSevenS } from '@/lib/swr-hooks';
import api from '@/lib/api';
import { SevenSRadar } from '@/components/charts';

const DIMENSIONS = [
  { id: 'strategy', label: 'Strategy', icon: '🎯', desc: 'Dirección y plan competitivo', type: 'hard' },
  { id: 'structure', label: 'Structure', icon: '🏛️', desc: 'Organización jerárquica y funcional', type: 'hard' },
  { id: 'systems', label: 'Systems', icon: '⚙️', desc: 'Procesos, TI y flujos de trabajo', type: 'hard' },
  { id: 'shared_values', label: 'Shared Values', icon: '💎', desc: 'Cultura, misión y valores centrales', type: 'soft' },
  { id: 'style', label: 'Style', icon: '👔', desc: 'Estilo de liderazgo y gestión', type: 'soft' },
  { id: 'staff', label: 'Staff', icon: '👥', desc: 'Talento, perfiles y desarrollo', type: 'soft' },
  { id: 'skills', label: 'Skills', icon: '🧠', desc: 'Capacidades y competencias clave', type: 'soft' },
];

const SCORE_LABELS = ['', 'Crítico', 'Débil', 'Adecuado', 'Fuerte', 'Excepcional'];
const SCORE_COLORS = ['', 'var(--danger-color)', 'var(--warning-color)', 'var(--text-secondary)', 'var(--accent-primary)', 'var(--success-color)'];

export default function AlignmentPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const { data: sevenS = [], mutate: mutateSevenS } = useSevenS(planId);
  const [isLoading, setIsLoading] = useState(false);

  const gapAnalysis = sevenS.length > 0 && sevenS[0].gap_analysis ? sevenS[0].gap_analysis : '';

  const handleDiagnose = async () => {
    if (!planId) { toast.warning("No hay un plan activo."); return; }
    setIsLoading(true);
    try {
      const data = await api.diagnoseSevenS(planId);
      mutateSevenS(data, false);
      toast.success("Diagnóstico 7S completado");
    } catch (e) { toast.error(e.message); }
    setIsLoading(false);
  };

  const getScoreForDim = (dimId) => {
    const found = sevenS.find(s => s.dimension === dimId);
    return found ? found.score : 0;
  };

  const getNotesForDim = (dimId) => {
    const found = sevenS.find(s => s.dimension === dimId);
    return found ? found.notes : '';
  };

  const avgScore = sevenS.length > 0 ? (sevenS.reduce((a, s) => a + s.score, 0) / sevenS.length).toFixed(1) : '—';

  if (!planId) return (
    <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{fontWeight:600}}>Formulación</a> para crear uno.</div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Alineación Organizacional</h1>
          <p className="page-subtitle">McKinsey 7S Model: Coherencia entre estrategia y organización <span className="plan-badge">(Plan #{planId})</span></p>
        </div>
        <button onClick={handleDiagnose} disabled={isLoading} className="btn btn-primary" style={{opacity:isLoading?0.5:1}}>
          {isLoading ? '⏳ Diagnosticando...' : '🤖 Diagnosticar con IA'}
        </button>
      </div>

      {/* Score Overview + Radar Chart */}
      {sevenS.length > 0 && (
        <>
        {/* 7S Radar Chart (Phase 4) */}
        <SevenSRadar assessment={(() => {
          const obj = {};
          sevenS.forEach(s => { obj[s.dimension] = s.score; });
          return obj;
        })()} />
        <div className="glass-panel" style={{padding:'2rem', marginBottom:'2rem', textAlign:'center'}}>
          <p style={{color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:'0.5rem'}}>Score Promedio de Alineación</p>
          <div style={{fontSize:'3rem', fontWeight:700}} className="text-gradient">{avgScore}/5</div>
          <div style={{display:'flex', justifyContent:'center', gap:'2rem', marginTop:'1.5rem', flexWrap:'wrap'}}>
            {DIMENSIONS.map(dim => {
              const score = getScoreForDim(dim.id);
              return (
                <div key={dim.id} style={{textAlign:'center', minWidth:'60px'}}>
                  <div style={{fontSize:'1.5rem', marginBottom:'0.25rem'}}>{dim.icon}</div>
                  <div style={{fontSize:'1.2rem', fontWeight:700, color:SCORE_COLORS[score]}}>{score || '—'}</div>
                  <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>{dim.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}

      {/* Dimension Cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'1.5rem', marginBottom:'2rem'}}>
        {DIMENSIONS.map((dim, idx) => {
          const score = getScoreForDim(dim.id);
          const notes = getNotesForDim(dim.id);
          const pct = (score / 5) * 100;
          return (
            <div key={dim.id} className="glass-panel animate-fade-in" style={{padding:'1.5rem', borderTop:`3px solid ${SCORE_COLORS[score] || 'var(--surface-border)'}`, animationDelay:`${idx*60}ms`}}>
              <div className="flex justify-between items-center" style={{marginBottom:'0.75rem'}}>
                <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.1rem'}}>
                  {dim.icon} {dim.label}
                  <span style={{fontSize:'0.7rem', padding:'0.15rem 0.5rem', borderRadius:'10px', background: dim.type === 'hard' ? 'rgba(59,130,246,0.2)' : 'rgba(139,92,246,0.2)', color: dim.type === 'hard' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}}>{dim.type === 'hard' ? 'HARD' : 'SOFT'}</span>
                </h3>
                <span style={{fontSize:'1.2rem', fontWeight:700, color:SCORE_COLORS[score]}}>{score ? `${score}/5` : '—'}</span>
              </div>
              <p style={{color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:'0.75rem'}}>{dim.desc}</p>
              {score > 0 && (
                <>
                  <div className="progress-track sm" style={{marginBottom:'0.5rem'}}>
                    <div className="progress-fill" style={{width:`${pct}%`, background:SCORE_COLORS[score]}}></div>
                  </div>
                  <p style={{fontSize:'0.85rem', color:SCORE_COLORS[score], fontWeight:500}}>{SCORE_LABELS[score]}</p>
                  {notes && <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'0.5rem', lineHeight:1.4}}>{notes}</p>}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Gap Analysis */}
      {gapAnalysis && (
        <div className="glass-panel card-bordered danger animate-fade-in" style={{padding:'2rem'}}>
          <h3 style={{marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>🔍 Análisis de Brechas (AI)</h3>
          <p style={{lineHeight:1.6, color:'var(--text-secondary)'}}>{gapAnalysis}</p>
        </div>
      )}

      {sevenS.length === 0 && (
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <p style={{color:'var(--text-secondary)', fontSize:'1.1rem'}}>Presiona "Diagnosticar con IA" para evaluar la alineación organizacional con el Modelo 7S de McKinsey.</p>
        </div>
      )}
    </div>
  );
}
