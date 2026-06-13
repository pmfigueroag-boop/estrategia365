'use client';
import { useState } from 'react';

/**
 * Onboarding Guide — Phase 5
 * ==============================
 * Institutional walkthrough for new users.
 * Step-by-step guide through the full strategic planning workflow.
 */

const STEPS = [
  {
    phase: 'AWARENESS',
    icon: '🔍',
    title: 'Inteligencia Institucional',
    color: '#6366f1',
    steps: [
      {
        title: '1. Registre su Institución',
        desc: 'Navegue a Onboarding y complete el formulario con los datos de su organización: nombre, sector, misión, visión y marco legal.',
        path: '/onboarding',
        tip: 'El paradigma estratégico (P2W, BSC, OKR) determina los frameworks disponibles.',
      },
      {
        title: '2. Escaneo PESTEL Automático',
        desc: 'Active el escaneo de inteligencia ambiental con IA. El motor Gemini analiza señales Políticas, Económicas, Sociales, Tecnológicas, Ambientales y Legales relevantes a su sector.',
        path: '/analysis',
        tip: 'Las señales incluyen score de confianza y fuentes verificables.',
      },
      {
        title: '3. Análisis Porter 5 Fuerzas',
        desc: 'Evalúe la posición competitiva institucional: proveedores, clientes, sustitutos, barreras de entrada y rivalidad sectorial.',
        path: '/analysis',
        tip: 'Útil para instituciones públicas que compiten por presupuesto o mandato.',
      },
    ],
  },
  {
    phase: 'FORMULATION',
    icon: '📐',
    title: 'Formulación Estratégica',
    color: '#f59e0b',
    steps: [
      {
        title: '4. FODA/TOWS Matrix',
        desc: 'Combine las señales PESTEL y Porter para generar la matriz FODA y derivar estrategias TOWS automáticamente.',
        path: '/analysis',
        tip: 'Las estrategias TOWS cruzan Fortalezas/Debilidades internas con Oportunidades/Amenazas externas.',
      },
      {
        title: '5. Kernel de Estrategia (Rumelt)',
        desc: 'Valide su estrategia contra el test doctrinario de Richard Rumelt: diagnóstico, política guía y acciones coherentes.',
        path: '/strategy',
        tip: 'Si algún pilar del kernel falla, la IA sugiere correcciones.',
      },
      {
        title: '6. Playing to Win Framework',
        desc: 'Articule las 5 elecciones estratégicas de Lafley/Martin: aspiración, campo de juego, ventaja, capacidades y sistemas de gestión.',
        path: '/formulation',
        tip: 'Cada elección se valida contra los datos recopilados en la fase de inteligencia.',
      },
    ],
  },
  {
    phase: 'EXECUTION',
    icon: '⚡',
    title: 'Ejecución y Seguimiento',
    color: '#10b981',
    steps: [
      {
        title: '7. Definir OKR y BSC',
        desc: 'Establezca Objetivos con Resultados Clave (OKR) y vincúlelos al Balanced Scorecard en 4 perspectivas: financiera, cliente, procesos, aprendizaje.',
        path: '/execution',
        tip: 'Los OKR pueden tener cadencia trimestral o anual.',
      },
      {
        title: '8. Hoshin Kanri X-Matrix',
        desc: 'Alinee objetivos de largo plazo → tácticas anuales → métricas → responsables usando la X-Matrix de despliegue estratégico.',
        path: '/hoshin',
        tip: 'El proceso Catchball permite validación bidireccional entre niveles jerárquicos.',
      },
      {
        title: '9. Dashboard de Control',
        desc: 'Monitoree el avance en tiempo real: semáforos de OKR, tendencias BSC, alertas de desviación y recomendaciones IA.',
        path: '/dashboard',
        tip: 'Configure alertas automáticas cuando un indicador baja del umbral definido.',
      },
    ],
  },
  {
    phase: 'GOVERNANCE',
    icon: '🛡️',
    title: 'Gobernanza y Auditoría',
    color: '#ef4444',
    steps: [
      {
        title: '10. Auditoría Inmutable',
        desc: 'Cada acción estratégica queda registrada en una cadena SHA-256 verificable. Exporte evidencia para auditoría externa.',
        path: '/audit',
        tip: 'Compatible con estándares SOC2 Type II e ISO 27001.',
      },
      {
        title: '11. Simulación de Escenarios',
        desc: 'Use Monte Carlo y War Gaming para probar la resiliencia de su estrategia ante eventos adversos.',
        path: '/simulation',
        tip: 'Configure 10,000 simulaciones para obtener intervalos de confianza al 95%.',
      },
      {
        title: '12. Exportar PEI Institucional',
        desc: 'Genere el Plan Estratégico Institucional en formato MEPyD con todos los componentes requeridos por la normativa dominicana.',
        path: '/dashboard',
        tip: 'El formato cumple con los lineamientos de la Ley 498-06.',
      },
    ],
  },
];

export default function OnboardingGuidePage() {
  const [expandedPhase, setExpandedPhase] = useState('AWARENESS');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📘 Guía de Inicio</h1>
        <p className="page-subtitle">
          Recorrido completo del flujo estratégico institucional — de la inteligencia a la gobernanza
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          {STEPS.map((phase, i) => (
            <div key={phase.phase} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                cursor: 'pointer', padding: '0.5rem',
                borderRadius: 8,
                background: expandedPhase === phase.phase ? `${phase.color}15` : 'transparent',
                border: expandedPhase === phase.phase ? `1px solid ${phase.color}30` : '1px solid transparent',
                transition: 'all 0.2s',
              }} onClick={() => setExpandedPhase(phase.phase)}>
                <span style={{ fontSize: '1.2rem' }}>{phase.icon}</span>
                <span style={{
                  fontWeight: 600, fontSize: '0.72rem',
                  color: expandedPhase === phase.phase ? phase.color : 'var(--text-secondary)',
                }}>
                  {phase.phase}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  height: 2, background: `linear-gradient(90deg, ${phase.color}50, ${STEPS[i+1].color}50)`,
                  margin: '0.25rem 0',
                }}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phase content */}
      {STEPS.map(phase => (
        expandedPhase === phase.phase && (
          <div key={phase.phase} style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{
                padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem',
                background: `${phase.color}15`, color: phase.color,
              }}>
                {phase.phase}
              </span>
              {phase.icon} {phase.title}
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {phase.steps.map((step, si) => (
                <div key={si} className="glass-panel" style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: `4px solid ${phase.color}`,
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{step.title}</h3>
                    {step.path && (
                      <a href={step.path} style={{
                        fontSize: '0.68rem', padding: '2px 8px', borderRadius: 4,
                        background: `${phase.color}15`, color: phase.color,
                        textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        Ir →
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {step.desc}
                  </p>
                  <div style={{
                    padding: '0.4rem 0.75rem', borderRadius: 6,
                    background: 'rgba(99,102,241,0.06)',
                    fontSize: '0.72rem', color: 'var(--text-tertiary)',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    💡 <em>{step.tip}</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Completion card */}
      <div className="glass-panel" style={{
        padding: '1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08))',
        borderTop: '3px solid rgba(99,102,241,0.3)',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          ¡Listo para planificar!
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          Completando estos 12 pasos, su institución tendrá un Plan Estratégico Institucional completo, 
          auditable y alineado con los estándares de la normativa dominicana (Ley 498-06).
        </p>
      </div>
    </div>
  );
}
