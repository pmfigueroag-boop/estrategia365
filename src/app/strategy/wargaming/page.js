"use client";
import { useParadigm } from '@/context/ParadigmContext';
import { useToast } from '@/context/ToastContext';
import { usePlanContext } from '@/context/PlanContext';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';

// Lightweight HTML sanitizer: only allow safe tags from Gemini output
function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  // Remove all script, iframe, object, embed, form, and event handler attributes
  div.querySelectorAll('script,iframe,object,embed,form,link,style').forEach(el => el.remove());
  div.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'href' && attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return div.innerHTML;
}

export default function WargamingPage() {
  const { activeParadigm } = useParadigm();
  const toast = useToast();
  const { planId } = usePlanContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAgentRole = () => {
    if (lastResponse) return lastResponse.agent_role;
    switch(activeParadigm.id) {
      case 'competitive': return 'Analista Competitivo (5 Fuerzas)';
      case 'harvard': return 'Estratega de Ajuste (DOFA)';
      case 'resources': return 'Evaluador de Activos (VRIO)';
      case 'japanese': return 'Sensei de Calidad (Hoshin)';
      case 'cepal': return 'Analista de Políticas Públicas (Gestión Pública)';
      case 'mepyd': return 'Experto en Sistema Inversión Pública (SNPIP)';
      default: return 'Analista Cuantitativo de Riesgos';
    }
  };

  const handleSimulate = async () => {
    if (!input.trim()) return;
    
    if (!planId) {
      toast.warning("No hay un plan activo. Ve a Formulación primero.");
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await api.simulate(parseInt(planId), input);
      
      setLastResponse(data);
      setMessages(prev => [...prev, { role: 'agent', content: data.message }]);
    } catch(err) {
      setMessages(prev => [...prev, { role: 'agent', content: `<strong>Error:</strong> ${err.message || 'API AI Backend no responde.'}` }]);
    }
    
    setIsLoading(false);
  };

  const handleDevilsAdvocate = async () => {
    if (!planId) {
      toast.warning("No hay un plan activo.");
      return;
    }
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: '<em>[INICIANDO ATAQUE DE RED TEAM AUTÓNOMO]</em>' }]);
    
    try {
      const data = await api.runDevilsAdvocate(parseInt(planId));
      setLastResponse(data);
      setMessages(prev => [...prev, { role: 'agent', content: `<strong>🔴 ALERTA DEL ABOGADO DEL DIABLO:</strong><br/>${data.analysis}` }]);
      toast.error('El Abogado del Diablo ha encontrado vulnerabilidades.');
    } catch(err) {
      setMessages(prev => [...prev, { role: 'agent', content: `<strong>Error:</strong> ${err.message}` }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="text-gradient">Agentic AI Laboratory</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Simulación de escenarios evaluados a través de la lente de <strong style={{ color: 'var(--accent-primary)' }}>{activeParadigm.name}</strong>.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
        
        {/* Simulation Chat Interface */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Terminal Wargaming</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Agente Activo: <strong style={{ color: 'var(--accent-secondary)' }}>{getAgentRole()}</strong>
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                Ingresa un escenario hipotético, BANI, o cambio macro-económico para arrancar la simulación.
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                padding: '1rem', 
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                border: msg.role === 'user' ? 'none' : '1px solid var(--surface-border)', 
                maxWidth: '80%' 
              }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content) }} />
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px 12px 12px 0', border: '1px solid var(--surface-border)' }}>
                <span className="dot-pulse"></span> Calculando entropía estocástica...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid var(--surface-border)' }}>
            <form onSubmit={e => { e.preventDefault(); handleSimulate(); }} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Simular evento (ej. 'Colapso de cadena suministro en Asia')..."
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }} 
              />
              <button disabled={isLoading || input.length < 3} type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', opacity: (isLoading || input.length < 3) ? 0.5 : 1 }}>Ejecutar</button>
              <button type="button" onClick={handleDevilsAdvocate} disabled={isLoading} className="btn" style={{ padding: '0 1.5rem', background: '#dc2626', color: 'white', border: 'none', opacity: isLoading ? 0.5 : 1 }}>
                🔴 Abogado del Diablo (Auto-Attack)
              </button>
            </form>
          </div>

        </div>

        {/* Real-time Data Visualization */}
        <div className="glass-panel" style={{ width: '350px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Monitor Vectorial</h3>
          
          <div>
            <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Nivel de Riesgo (BANI)</span>
              <span className="text-gradient">Nivel {lastResponse ? lastResponse.risk_level : 0} / 5</span>
            </div>
            {/* Visualizer bars */}
            <div style={{ display: 'flex', gap: '4px', height: '8px' }}>
              {[1,2,3,4,5].map(level => {
                const isActive = lastResponse && lastResponse.risk_level >= level;
                let color = 'var(--surface-border)';
                if (isActive) {
                  color = lastResponse.risk_level >= 4 ? 'var(--danger-color)' : (lastResponse.risk_level >= 3 ? 'var(--warning-color)' : 'var(--success-color)');
                }
                return <div key={level} style={{ flex: 1, background: color, borderRadius: '2px', transition: 'background 0.5s' }}></div>
              })}
            </div>
          </div>

          {lastResponse && lastResponse.risk_level >= 4 && (
            <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--danger-color)' }}>ALERTA DE RUPTURA</strong>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>El simulador IA predice una alta probabilidad de discontinuidad operativa si ocurre este evento estocástico bajo la doctrina actual.</p>
            </div>
          )}

          {lastResponse && (
            <div className="animate-fade-in">
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Métricas Alteradas:</h4>
              {lastResponse.metrics.map((metric, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span>{metric.name}</span>
                  <span style={{ color: metric.impact === 'negative' ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 'bold' }}>
                    {metric.impact === 'negative' ? '-' : '+'}{metric.value}%
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Nivel de Confianza IA: {lastResponse ? lastResponse.confidence_level : 0}%
          </div>

        </div>

      </div>
    </div>
  );
}
