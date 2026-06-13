'use client';
import { useState } from 'react';

/**
 * ManualPestelForm — Manual PESTEL signal entry form
 * Sprint 2: Added trend, probability, timeframe fields
 */
export default function ManualPestelForm({ onSubmit, onCancel }) {
  const [factor, setFactor] = useState('P');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [trend, setTrend] = useState('stable');
  const [probability, setProbability] = useState(50);
  const [timeframe, setTimeframe] = useState('medium');

  return (
    <div className="glass-panel animate-fade-in" style={{padding:'1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-primary)'}}>
      <h3 style={{fontSize:'1rem', marginBottom:'1rem'}}>➕ Agregar Señal PESTEL</h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Factor</label>
          <select className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={factor} onChange={e => setFactor(e.target.value)}>
            {Object.entries({P:'Político',E:'Económico',S:'Social',T:'Tecnológico',E2:'Ecológico',L:'Legal'}).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Severidad</label>
          <select className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option>
          </select>
        </div>
        <div style={{gridColumn:'span 2'}}>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Título</label>
          <input className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Reforma fiscal 2026"/>
        </div>
        <div style={{gridColumn:'span 2'}}>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Descripción</label>
          <textarea className="form-textarea" style={{minHeight:'60px'}} value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción de la señal..."/>
        </div>
        <div style={{gridColumn:'span 2'}}>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Impacto Estratégico</label>
          <input className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={impact} onChange={e => setImpact(e.target.value)} placeholder="¿Cómo impacta al plan?"/>
        </div>

        {/* Sprint 2: New fields */}
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>📈 Tendencia</label>
          <select className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={trend} onChange={e => setTrend(e.target.value)}>
            <option value="improving">Mejorando</option><option value="stable">Estable</option><option value="declining">Empeorando</option>
          </select>
        </div>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>🕐 Horizonte</label>
          <select className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={timeframe} onChange={e => setTimeframe(e.target.value)}>
            <option value="short">Corto plazo (0-1 año)</option><option value="medium">Mediano plazo (1-3 años)</option><option value="long">Largo plazo (3-5+ años)</option>
          </select>
        </div>
        <div style={{gridColumn:'span 2'}}>
          <label className="form-label" style={{fontSize:'0.8rem'}}>🎯 Probabilidad de materialización: <strong style={{color: probability >= 70 ? '#f87171' : probability >= 40 ? '#facc15' : '#4ade80'}}>{probability}%</strong></label>
          <input type="range" min="0" max="100" step="5" value={probability} onChange={e => setProbability(Number(e.target.value))}
            style={{width:'100%', accentColor:'var(--accent-primary)'}} />
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-secondary)'}}>
            <span>Improbable</span><span>Posible</span><span>Muy probable</span>
          </div>
        </div>
      </div>
      <div style={{marginTop:'1rem', display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
        <button onClick={onCancel} className="btn glass-panel" style={{background:'transparent', fontSize:'0.85rem'}}>Cancelar</button>
        <button onClick={() => { if(title.trim()) onSubmit({factor, severity, title, description, strategic_impact: impact, trend, probability, timeframe}); }} className="btn btn-primary" style={{fontSize:'0.85rem'}}>Guardar</button>
      </div>
    </div>
  );
}
