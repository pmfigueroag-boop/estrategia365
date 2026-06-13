'use client';
import { useState } from 'react';

/**
 * OkrForm — Manual objective creation form
 * Extracted from execution/page.js (Phase 2)
 */
export default function OkrForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [squad, setSquad] = useState('');
  return (
    <div className="glass-panel animate-fade-in" style={{padding:'1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-primary)'}}>
      <h3 style={{fontSize:'1rem', marginBottom:'1rem'}}>➕ Nuevo Objetivo Estratégico</h3>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem'}}>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Título del Objetivo</label>
          <input className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Aumentar penetración de mercado en 30%"/>
        </div>
        <div>
          <label className="form-label" style={{fontSize:'0.8rem'}}>Squad Responsable</label>
          <input className="form-textarea" style={{minHeight:'auto', padding:'0.5rem'}} value={squad} onChange={e => setSquad(e.target.value)} placeholder="Ej: Growth Team"/>
        </div>
      </div>
      <div style={{marginTop:'1rem', display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
        <button onClick={onCancel} className="btn glass-panel" style={{background:'transparent', fontSize:'0.85rem'}}>Cancelar</button>
        <button onClick={() => { if(title.trim()) onSubmit({title, responsible_squad: squad || 'TBD', status: 'formulated', key_results: []}); }} className="btn btn-primary" style={{fontSize:'0.85rem'}}>Guardar</button>
      </div>
    </div>
  );
}
