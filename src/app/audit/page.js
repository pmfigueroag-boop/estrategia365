"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';

export default function AuditPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [chainStatus, setChainStatus] = useState(null);

  useEffect(() => {
    let active = true;
    if (!planId) { 
      Promise.resolve().then(() => { if (active) setIsLoading(false); }); 
      return () => { active = false; };
    }
    api.getAuditTrail(planId)
      .then(data => {
        if (!active) return;
        setLogs(data.logs || []);
        setChainStatus(data.is_valid);
        setIsLoading(false);
      })
      .catch(err => {
        if (!active) return;
        toast.error(err.message);
        setIsLoading(false);
      });
    return () => { active = false; };
  }, [planId]);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const data = await api.getAuditTrail(planId);
      setChainStatus(data.is_valid);
      if (data.is_valid) toast.success("Cadena verificada: Integrad Criptográfica 100%");
      else toast.error("Cadena comprometida.");
    } catch (e) {
      toast.error(e.message);
    }
    setIsVerifying(false);
  };

  if (!planId) return <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a Formulación.</div>;
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando Cadena de Auditoría...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Compliance & Auditoría</h1>
          <p className="page-subtitle">Control Forense Inmutable y Exportaciones Gubernamentales <span className="plan-badge">(Plan #{planId})</span></p>
        </div>
        <div style={{display:'flex', gap:'0.75rem'}}>
          <a href={api.getInstitutionalExportUrl(planId, 'pei')} target="_blank" rel="noreferrer" className="btn btn-primary" style={{textDecoration:'none', fontSize:'0.85rem'}}>
            📥 Exportar PEI
          </a>
          <a href={api.getInstitutionalExportUrl(planId, 'snpip')} target="_blank" rel="noreferrer" className="btn glass-panel" style={{textDecoration:'none', fontSize:'0.85rem', background:'rgba(255,255,255,0.1)'}}>
            📥 Exportar SNPIP
          </a>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 3fr', gap:'2rem'}}>
        {/* Sidebar Status */}
        <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
          <div className="glass-panel" style={{padding:'1.5rem', textAlign:'center', borderTop:`4px solid ${chainStatus ? 'var(--success-color)' : 'var(--danger-color)'}`}}>
            <h3 style={{fontSize:'1rem', marginBottom:'0.5rem'}}>Estado de Cadena SHA-256</h3>
            <div style={{fontSize:'1.5rem', fontWeight:800, color: chainStatus ? 'var(--success-color)' : 'var(--danger-color)', marginBottom:'1rem'}}>
              {chainStatus ? 'VÁLIDA' : 'COMPROMETIDA'}
            </div>
            <button onClick={handleVerifyChain} disabled={isVerifying} className="btn" style={{width:'100%', fontSize:'0.8rem', padding:'0.5rem', background:'rgba(255,255,255,0.1)', border:'1px solid var(--surface-border)'}}>
              {isVerifying ? 'Verificando...' : '🔄 Re-Verificar Hashes'}
            </button>
          </div>
          
          <div className="glass-panel" style={{padding:'1.5rem'}}>
            <h3 style={{fontSize:'0.9rem', marginBottom:'1rem', color:'var(--text-secondary)'}}>Métricas de Auditoría</h3>
            <ul style={{listStyle:'none', padding:0, margin:0, fontSize:'0.85rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              <li style={{display:'flex', justifyContent:'space-between'}}><span>Total Eventos:</span> <strong>{logs.length}</strong></li>
              <li style={{display:'flex', justifyContent:'space-between'}}><span>Firma Humana:</span> <strong>{logs.filter(l => l.actor !== 'system').length}</strong></li>
              <li style={{display:'flex', justifyContent:'space-between'}}><span>Firma Sistema:</span> <strong>{logs.filter(l => l.actor === 'system').length}</strong></li>
            </ul>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="glass-panel" style={{padding:'1.5rem'}}>
          <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Registro Forense (Event Sourcing)</h2>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.8rem', textAlign:'left'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--surface-border)', color:'var(--text-secondary)'}}>
                  <th style={{padding:'0.75rem'}}>Timestamp</th>
                  <th style={{padding:'0.75rem'}}>Actor</th>
                  <th style={{padding:'0.75rem'}}>Acción</th>
                  <th style={{padding:'0.75rem'}}>Entidad</th>
                  <th style={{padding:'0.75rem'}}>Hash SHA-256</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)', backgroundColor: log.actor === 'system' ? 'transparent' : 'rgba(16,185,129,0.05)'}}>
                    <td style={{padding:'0.75rem', whiteSpace:'nowrap', color:'var(--text-secondary)'}}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{padding:'0.75rem', fontWeight:600, color: log.actor === 'system' ? 'var(--text-secondary)' : 'var(--accent-primary)'}}>{log.actor}</td>
                    <td style={{padding:'0.75rem'}}>{log.action}</td>
                    <td style={{padding:'0.75rem', color:'var(--accent-secondary)'}}>{log.entity} #{log.entity_id}</td>
                    <td style={{padding:'0.75rem', fontFamily:'monospace', color:'var(--text-secondary)', fontSize:'0.75rem'}} title={log.hash_signature}>
                      {log.hash_signature.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <p style={{textAlign:'center', padding:'2rem', color:'var(--text-secondary)'}}>No hay eventos registrados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
