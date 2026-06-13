'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const NAV_DOMAINS = [
  {
    id: 'identidad', label: 'Identidad', icon: '🏛️',
    links: [
      { href: '/onboarding', label: '1. Onboarding', desc: 'Institución · ADN' },
    ],
  },
  {
    id: 'diagnostico', label: 'Diagnóstico', icon: '🔍',
    links: [
      { href: '/analysis', label: '2. Análisis Estratégico', desc: 'PESTEL · Porter · FODA' },
      { href: '/intelligence', label: '3. Intelligence Hub', desc: 'Brechas · Señales' },
    ],
  },
  {
    id: 'formulacion', label: 'Formulación', icon: '📐',
    links: [
      { href: '/formulation', label: '4. Plan Estratégico', desc: 'P2W · Misión · Visión' },
    ],
  },
  {
    id: 'diseno', label: 'Diseño', icon: '♟️',
    links: [
      { href: '/strategy', label: '5. Strategy Core', desc: 'Kernel · Simulación' },
      { href: '/bsc', label: '5b. Arquitectura BSC', desc: 'Mapa Estratégico · Balanced Scorecard' },
    ],
  },
  {
    id: 'despliegue', label: 'Despliegue', icon: '🔗',
    links: [
      { href: '/alignment', label: '6. Alineación', desc: 'McKinsey 7S' },
      // { href: '/hoshin', label: '7. Hoshin Kanri', desc: 'X-Matrix · Cascade' }, // POST-MVP
    ],
  },
  {
    id: 'ejecucion', label: 'Ejecución', icon: '⚡',
    links: [
      { href: '/execution', label: '8. Control de Ejecución', desc: 'OKRs · Iniciativas' },
    ],
  },
  {
    id: 'monitoreo', label: 'Monitoreo', icon: '📊',
    links: [
      { href: '/dashboard', label: '9. Command Center', desc: 'Dashboard Ejecutivo' },
    ],
  },
  
  // --- POST-MVP / PAUSADAS ---
  /*
  {
    id: 'aprendizaje', label: 'Aprendizaje', icon: '🧠',
    links: [
      { href: '/audit', label: '11. Auditoría & Compliance', desc: 'Riesgos · SOC2' },
      { href: '/governance', label: '12. AI Governance', desc: 'Madurez IA · Telemetría' },
    ],
  },
  {
    id: 'ops', label: 'Transversal', icon: '⚙️',
    links: [
      { href: '/admin', label: '13. Admin Console', desc: 'Usuarios · Tenant · SSO' },
    ],
  },
  */
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const paradigm = 'competitive';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [planName, setPlanName] = useState('');
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setPlanId(localStorage.getItem('e365_active_plan_id') || localStorage.getItem('current_plan_id'));
      setPlanName(localStorage.getItem('e365_active_plan_name') || '');
    });
    if (api.isAuthenticated()) {
      api.getMe().then(u => { if (active) setUser(u); }).catch(() => {});
    }
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.logout();
    } finally {
      router.push('/login');
    }
  };

  if (['/', '/login', '/register', '/forgot-password', '/reset-password', '/select-tenant', '/select-plan'].includes(pathname)) return null;

  const isActive = (href) => pathname === href || pathname?.startsWith(href + '/');
  const activeDomain = NAV_DOMAINS.find(d => d.links.some(l => isActive(l.href)));

  return (
    <>
      <header className="app-header" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        position: 'relative', zIndex: 100,
        background: 'var(--surface-color)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-level-1)'
      }}>
        {/* Brand & Context Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">
              Estrategia 365
            </span>
          </Link>
          
          {(planId || user) && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: 6, border: '1px solid var(--surface-border)' }}>
               {planId ? (
                  <span className="plan-badge" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                    {planName || `Plan #${planId}`}
                  </span>
               ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sin Plan Activo</span>
               )}
               <Link href="/select-tenant" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', paddingLeft: '0.5rem', borderLeft: '1px solid var(--surface-border)' }}>
                 Cambiar
               </Link>
             </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="header-nav" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {NAV_DOMAINS.map(domain => (
            <div
              key={domain.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveDropdown(domain.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`btn ${activeDomain?.id === domain.id ? 'btn-primary' : ''}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.7rem',
                  background: activeDomain?.id === domain.id ? undefined : 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
                aria-label={`${domain.label} menu`}
                aria-expanded={activeDropdown === domain.id}
              >
                <span>{domain.icon}</span>
                <span>{domain.label}</span>
              </button>

              {/* Dropdown */}
              {activeDropdown === domain.id && domain.links.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  minWidth: 240,
                  background: 'var(--surface-color)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 12,
                  padding: '0.5rem',
                  boxShadow: 'var(--shadow-level-3)',
                  zIndex: 200,
                  marginTop: 4,
                }}>
                  {domain.links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        display: 'block',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 8,
                        textDecoration: 'none',
                        transition: 'background 150ms ease',
                        background: isActive(link.href) ? 'rgba(59,130,246,0.1)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = isActive(link.href) ? 'rgba(59,130,246,0.1)' : 'transparent'}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive(link.href) ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: '0.15rem' }}>
                        {link.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {link.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Paradigm Badge & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {paradigm && (
            <span className="domain-badge formulation" style={{ fontSize: '0.7rem' }}>
              {paradigm.toUpperCase()}
            </span>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 600, color: 'white'
              }}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  fontSize: '0.8rem', cursor: 'pointer', padding: '0.2rem',
                  textDecoration: 'underline'
                }}
              >
                {isLoggingOut ? 'Saliendo...' : 'Salir'}
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="mobile-nav-overlay open" onClick={() => setMobileOpen(false)} />}

      {/* Mobile Panel */}
      <div className={`mobile-nav-panel ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }} className="text-gradient">Estrategia 365</span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.25rem', cursor: 'pointer' }} aria-label="Cerrar menú">✕</button>
        </div>
        {planId && <div className="plan-badge" style={{ marginBottom: '1rem', fontSize: '0.75rem', textAlign: 'center' }}>Plan #{planId}</div>}

        {NAV_DOMAINS.map(domain => (
          <div key={domain.id}>
            <div className="nav-section-title">{domain.icon} {domain.label}</div>
            {domain.links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${isActive(link.href) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
