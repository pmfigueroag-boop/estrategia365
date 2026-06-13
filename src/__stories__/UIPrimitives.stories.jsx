/**
 * Estrategia 365 — UI Primitive Stories (Phase 8)
 * ==================================================
 * Interactive Storybook stories for all UI primitive components.
 */

import React from 'react';

// ── Button ─────────────────────────────────────────────────

const Button = ({ children, variant = 'primary', size = 'md', disabled = false, onClick }) => {
  const variants = {
    primary: { bg: '#2563eb', color: '#fff', hover: '#1d4ed8' },
    secondary: { bg: '#6b7280', color: '#fff', hover: '#4b5563' },
    danger: { bg: '#dc2626', color: '#fff', hover: '#b91c1c' },
    ghost: { bg: 'transparent', color: '#2563eb', hover: '#eff6ff' },
  };
  const sizes = { sm: '0.5rem 1rem', md: '0.75rem 1.5rem', lg: '1rem 2rem' };
  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: sizes[size],
        backgroundColor: disabled ? '#d1d5db' : v.bg,
        color: disabled ? '#9ca3af' : v.color,
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
};

export const ButtonPrimary = { render: () => <Button>Primary Action</Button> };
export const ButtonSecondary = { render: () => <Button variant="secondary">Secondary</Button> };
export const ButtonDanger = { render: () => <Button variant="danger">Delete</Button> };
export const ButtonGhost = { render: () => <Button variant="ghost">Ghost Link</Button> };
export const ButtonDisabled = { render: () => <Button disabled>Disabled</Button> };
export const ButtonSizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ── Card ───────────────────────────────────────────────────

const Card = ({ title, children, variant = 'default' }) => {
  const styles = {
    default: { border: '1px solid #e5e7eb', bg: '#fff' },
    elevated: { border: 'none', bg: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    highlighted: { border: '2px solid #2563eb', bg: '#eff6ff' },
  };
  const s = styles[variant];

  return (
    <div style={{ ...s, backgroundColor: s.bg, borderRadius: '12px', padding: '1.5rem', maxWidth: '400px' }}>
      {title && <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>}
      <div style={{ color: '#4b5563', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

export const CardDefault = { render: () => <Card title="Strategic Plan">Plan content here</Card> };
export const CardElevated = { render: () => <Card title="Analysis Result" variant="elevated">PESTEL analysis completed</Card> };
export const CardHighlighted = { render: () => <Card title="Action Required" variant="highlighted">Review pending items</Card> };

// ── Badge ──────────────────────────────────────────────────

const Badge = ({ children, status = 'info' }) => {
  const colors = {
    info: { bg: '#dbeafe', color: '#1e40af' },
    success: { bg: '#dcfce7', color: '#166534' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    error: { bg: '#fef2f2', color: '#991b1b' },
  };
  const c = colors[status];

  return (
    <span style={{
      ...c, backgroundColor: c.bg,
      padding: '0.25rem 0.75rem', borderRadius: '9999px',
      fontSize: '0.75rem', fontWeight: 600, display: 'inline-block',
    }}>
      {children}
    </span>
  );
};

export const BadgeInfo = { render: () => <Badge status="info">In Progress</Badge> };
export const BadgeSuccess = { render: () => <Badge status="success">Completed</Badge> };
export const BadgeWarning = { render: () => <Badge status="warning">Pending Review</Badge> };
export const BadgeError = { render: () => <Badge status="error">Failed</Badge> };
export const BadgeAll = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge status="info">Draft</Badge>
      <Badge status="warning">In Review</Badge>
      <Badge status="success">Active</Badge>
      <Badge status="error">Archived</Badge>
    </div>
  ),
};

// ── StatusIndicator ────────────────────────────────────────

const StatusIndicator = ({ status, label }) => {
  const colors = { healthy: '#22c55e', degraded: '#f59e0b', critical: '#ef4444', unknown: '#9ca3af' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{
        width: '10px', height: '10px', borderRadius: '50%',
        backgroundColor: colors[status],
        boxShadow: `0 0 6px ${colors[status]}50`,
      }} />
      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{label}</span>
    </div>
  );
};

export const StatusHealthy = { render: () => <StatusIndicator status="healthy" label="API Online" /> };
export const StatusDegraded = { render: () => <StatusIndicator status="degraded" label="High Latency" /> };
export const StatusCritical = { render: () => <StatusIndicator status="critical" label="Service Down" /> };
export const StatusDashboard = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <StatusIndicator status="healthy" label="API Service" />
      <StatusIndicator status="healthy" label="Database" />
      <StatusIndicator status="degraded" label="AI Provider (Gemini)" />
      <StatusIndicator status="healthy" label="Redis Cache" />
    </div>
  ),
};

// ── Meta ───────────────────────────────────────────────────

export default {
  title: 'Estrategia 365/UI Primitives',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Core UI primitives for the Estrategia 365 platform. All components follow the enterprise design system.',
      },
    },
  },
};
