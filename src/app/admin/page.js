'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import GaugeArc from '@/components/charts/GaugeArc';

/**
 * Tenant Admin Console — Phase 5
 * ==================================
 * User management, role assignment, usage monitoring, quota config.
 */

const ROLES = ['admin', 'strategist', 'analyst', 'viewer'];
const ROLE_COLORS = { admin: '#ef4444', strategist: '#6366f1', analyst: '#10b981', viewer: '#94a3b8' };
const TIERS = ['free', 'standard', 'enterprise', 'unlimited'];
const TIER_COLORS = { free: '#94a3b8', standard: '#6366f1', enterprise: '#f59e0b', unlimited: '#10b981' };

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [ssoProviders, setSsoProviders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getTenantMembers().catch(() => []),
      api.getAIBudget(1).catch(() => null),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/sso/providers`)
        .then(r => r.json()).catch(() => []),
    ]).then(([u, b, sso]) => {
      setUsers(Array.isArray(u) ? u : (u?.users || []));
      setUsage(b);
      setSsoProviders(Array.isArray(sso) ? sso : []);
      setLoading(false);
    });
  }, []);

  const TABS = [
    { id: 'users', label: '👥 Usuarios', count: users.length },
    { id: 'roles', label: '🔑 Roles & Permisos' },
    { id: 'usage', label: '📊 Uso & Cuotas' },
    { id: 'sso', label: '🔐 SSO Config' },
  ];

  if (loading) return <div className="animate-fade-in glass-panel empty-state">Cargando consola de administración...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Tenant Admin Console</h1>
        <p className="page-subtitle">Gestión de usuarios, roles, cuotas de uso y configuración SSO</p>
      </div>

      {/* Stats bar */}
      <div className="glass-panel" style={{
        padding: '0.75rem 1.5rem', marginBottom: '1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem',
      }}>
        {[
          { label: 'Usuarios', value: users.length, icon: '👥', color: '#6366f1' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: '🔑', color: '#ef4444' },
          { label: 'Activos', value: users.filter(u => u.is_active !== false).length, icon: '✅', color: '#10b981' },
          { label: 'SSO', value: ssoProviders.filter(p => p.enabled).length > 0 ? 'Activo' : 'Inactivo', icon: '🔐', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
            {t.label} {t.count != null && <span style={{ opacity: 0.7 }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {/* ═══ Users Tab ═══ */}
      {activeTab === 'users' && (
        <SectionErrorBoundary label="User Management">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>👥 Usuarios del Tenant</h3>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay usuarios registrados.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="exec-table">
                  <thead>
                    <tr>
                      <th>Usuario</th><th>Email</th><th>Rol</th><th>SSO</th><th>Estado</th><th>Último Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={user.id || i}>
                        <td style={{ fontWeight: 600 }}>{user.full_name || user.username || `User ${user.id}`}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600,
                            background: `${ROLE_COLORS[user.role] || '#94a3b8'}15`,
                            color: ROLE_COLORS[user.role] || '#94a3b8',
                          }}>
                            {(user.role || 'viewer').toUpperCase()}
                          </span>
                        </td>
                        <td>{user.sso_provider ? `🔗 ${user.sso_provider}` : '—'}</td>
                        <td>
                          <span style={{ color: user.is_active !== false ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.82rem' }}>
                            {user.is_active !== false ? '● Activo' : '○ Inactivo'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      )}

      {/* ═══ Roles Tab ═══ */}
      {activeTab === 'roles' && (
        <SectionErrorBoundary label="Roles & Permissions">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🔑 Roles & Permisos (RBAC)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { role: 'admin', desc: 'Acceso total al sistema', perms: ['Gestión usuarios', 'Config SSO', 'Exportar datos', 'Todas las vistas', 'Eliminar planes'] },
                { role: 'strategist', desc: 'Diseño y formulación estratégica', perms: ['Crear/editar planes', 'Ejecutar análisis IA', 'Simular escenarios', 'Exportar informes'] },
                { role: 'analyst', desc: 'Análisis e inteligencia', perms: ['Ver planes', 'Ejecutar PESTEL/Porter', 'Ver dashboards', 'Sin edición'] },
                { role: 'viewer', desc: 'Solo lectura institucional', perms: ['Ver dashboards', 'Exportar reportes', 'Sin acceso IA'] },
              ].map(r => (
                <div key={r.role} className="glass-panel" style={{
                  padding: '1.25rem', borderLeft: `4px solid ${ROLE_COLORS[r.role]}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                      background: `${ROLE_COLORS[r.role]}15`, color: ROLE_COLORS[r.role],
                      textTransform: 'uppercase',
                    }}>
                      {r.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{r.desc}</p>
                  {r.perms.map((perm, pi) => (
                    <div key={pi} style={{
                      fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '0.15rem 0',
                      paddingLeft: '0.5rem', borderLeft: '2px solid rgba(148,163,184,0.1)',
                    }}>
                      ✓ {perm}
                    </div>
                  ))}
                  <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    {users.filter(u => u.role === r.role).length} usuario(s)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionErrorBoundary>
      )}

      {/* ═══ Usage & Quotas Tab ═══ */}
      {activeTab === 'usage' && (
        <SectionErrorBoundary label="Usage & Quotas">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Usage gauge */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📊 Uso del Período Actual</h3>
              {usage ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <GaugeArc
                    value={usage.budget?.utilization_pct || usage.utilization_pct || 0}
                    max={100}
                    size={180}
                    label="Utilización IA"
                  />
                </div>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>Sin datos de uso</p>
              )}
            </div>

            {/* Tier config */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🎚️ Niveles de Cuota</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {TIERS.map(tier => {
                  const quotas = { free: '50 calls', standard: '1,000 calls', enterprise: '10,000 calls', unlimited: '∞' };
                  const costs = { free: '$5/mo', standard: '$100/mo', enterprise: '$1,000/mo', unlimited: 'Custom' };
                  return (
                    <div key={tier} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0.75rem', borderRadius: 8,
                      background: 'rgba(15,23,42,0.4)',
                      borderLeft: `3px solid ${TIER_COLORS[tier]}`,
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, color: TIER_COLORS[tier], textTransform: 'uppercase', fontSize: '0.8rem' }}>{tier}</span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{quotas[tier]} · {costs[tier]}</div>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem',
                        background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)',
                      }}>
                        {tier === 'standard' ? '← Actual' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionErrorBoundary>
      )}

      {/* ═══ SSO Tab ═══ */}
      {activeTab === 'sso' && (
        <SectionErrorBoundary label="SSO Configuration">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🔐 Single Sign-On (SSO/OIDC)</h3>
            {ssoProviders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No hay proveedores SSO configurados.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {ssoProviders.map((p, i) => (
                  <div key={p.name || i} style={{
                    padding: '1.25rem', borderRadius: 10,
                    background: p.enabled ? 'rgba(16,185,129,0.06)' : 'rgba(15,23,42,0.4)',
                    border: `1px solid ${p.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.1)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{p.icon || '🔐'}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.display_name || p.name}</span>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600,
                        background: p.enabled ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)',
                        color: p.enabled ? '#10b981' : '#94a3b8',
                      }}>
                        {p.enabled ? 'ACTIVO' : 'DISPONIBLE'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {p.enabled
                        ? `Protocolo OIDC configurado. Los usuarios pueden autenticarse vía ${p.display_name || p.name}.`
                        : `Disponible para configuración. Configure las credenciales OIDC para habilitar.`
                      }
                    </p>
                    {p.enabled && p.login_url && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        Login URL: {p.login_url}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      )}
    </div>
  );
}
