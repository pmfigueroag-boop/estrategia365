'use client';
import { useState } from 'react';

/**
 * BscForm — BSC KPI creation form
 * Extracted from execution/page.js (Phase 2)
 */
export default function BscForm({ onSubmit, onCancel }) {
  const [perspective, setPerspective] = useState('financial');
  const [objective, setObjective] = useState('');
  const [kpi, setKpi] = useState('');
  const [target, setTarget] = useState(100);
  return (
    <div className="glass-panel animate-fade-in" style={{padding:'1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-secondary)'}}>
      <h3 style={{fontSize:'1rem', marginBottom:'1rem'}}>➕ Nuevo KPI del Balanced Scorecard</h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Perspectiva</label>
          <select className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={perspective} onChange={e => setPerspective(e.target.value)}>
            <option value="financial">💰 Financiera</option>
            <option value="customer">👥 Cliente</option>
            <option value="process">⚙️ Procesos</option>
            <option value="learning">🧠 Aprendizaje</option>
          </select>
        </div>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>KPI</label>
          <input className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={kpi} onChange={e => setKpi(e.target.value)} placeholder="Ej: NPS Score"/>
        </div>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Objetivo</label>
          <input className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ej: Mejorar satisfacción del cliente"/>
        </div>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Meta</label>
          <input type="number" className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={target} onChange={e => setTarget(e.target.value)}/>
        </div>
      </div>
      <div style={{marginTop:'1rem', display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
        <button onClick={onCancel} className="btn glass-panel" style={{background:'transparent', fontSize:'0.85rem'}}>Cancelar</button>
        <button onClick={() => { if(objective.trim()) onSubmit({perspective, objective, kpi: kpi||'TBD', target_value: parseFloat(target), current_value: 0, unit: '%'}); }} className="btn btn-primary" style={{fontSize:'0.85rem'}}>Guardar</button>
      </div>
    </div>
  );
}
