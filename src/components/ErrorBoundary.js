'use client';
import { Component } from 'react';

/**
 * Institutional Error Boundary — Phase 2.8 Enhanced
 * ====================================================
 * Catches rendering errors per-module and displays a recoverable fallback.
 *
 * Enhancements:
 *   - Typed error display (API errors, network errors, render errors)
 *   - Error code extraction from API error envelope
 *   - Retry with count tracking
 *   - Auto-collapse after recovery
 *   - Structured error reporting
 */

const ERROR_TYPES = {
  NETWORK: { icon: '🌐', label: 'Error de conexión', color: '#f59e0b' },
  API: { icon: '🔧', label: 'Error del servidor', color: '#ef4444' },
  AUTH: { icon: '🔒', label: 'Sesión expirada', color: '#8b5cf6' },
  RENDER: { icon: '⚠️', label: 'Error de interfaz', color: '#ef4444' },
  UNKNOWN: { icon: '❌', label: 'Error inesperado', color: '#ef4444' },
};

function classifyError(error) {
  if (!error) return 'UNKNOWN';
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('cors'))
    return 'NETWORK';
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('token'))
    return 'AUTH';
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('api'))
    return 'API';
  return 'RENDER';
}

function extractErrorDetail(error) {
  // Try to extract from API error envelope
  if (error?.response?.error) {
    return {
      code: error.response.error.code,
      message: error.response.error.message,
      requestId: error.response.error.request_id,
    };
  }
  return {
    code: null,
    message: error?.message || 'Ha ocurrido un error inesperado.',
    requestId: null,
  };
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0, errorType: 'UNKNOWN' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorType: classifyError(error),
    };
  }

  componentDidCatch(error, errorInfo) {
    const domain = this.props.domain || 'app';
    const errorType = classifyError(error);
    const detail = extractErrorDetail(error);

    console.error(`[ErrorBoundary:${domain}] type=${errorType}`, {
      error: error.message,
      code: detail.code,
      requestId: detail.requestId,
      componentStack: errorInfo?.componentStack?.slice(0, 500),
    });

    // Report to observability (if available)
    if (typeof window !== 'undefined' && window.__estrategia_report_error) {
      window.__estrategia_report_error({
        domain,
        errorType,
        message: error.message,
        code: detail.code,
        requestId: detail.requestId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, retryCount, errorType } = this.state;
    const typeInfo = ERROR_TYPES[errorType] || ERROR_TYPES.UNKNOWN;
    const detail = extractErrorDetail(error);
    const maxRetries = 3;
    const canRetry = retryCount < maxRetries;

    return (
      <div
        id="error-boundary-fallback"
        role="alert"
        style={{
          padding: '2rem',
          textAlign: 'center',
          margin: '2rem auto',
          maxWidth: 560,
          borderRadius: 12,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${typeInfo.color}33`,
          borderLeft: `4px solid ${typeInfo.color}`,
          boxShadow: `0 4px 24px ${typeInfo.color}11`,
        }}
      >
        {/* Error Icon */}
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          {typeInfo.icon}
        </div>

        {/* Error Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
            color: typeInfo.color,
            fontWeight: 600,
          }}
        >
          {typeInfo.label} en {this.props.domain || 'módulo'}
        </h3>

        {/* Error Message */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary, #94a3b8)',
            marginBottom: '0.75rem',
            maxWidth: 440,
            margin: '0 auto 0.75rem',
            lineHeight: 1.5,
          }}
        >
          {detail.message}
        </p>

        {/* Error Code + Request ID */}
        {(detail.code || detail.requestId) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              fontSize: '0.72rem',
              color: 'var(--text-tertiary, #64748b)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            {detail.code && <span>Código: {detail.code}</span>}
            {detail.requestId && <span>Request: {detail.requestId}</span>}
          </div>
        )}

        {/* Retry info */}
        {retryCount > 0 && (
          <p
            style={{
              fontSize: '0.75rem',
              color: typeInfo.color,
              marginBottom: '0.75rem',
              opacity: 0.8,
            }}
          >
            Intento {retryCount}/{maxRetries}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          {canRetry && (
            <button
              onClick={this.handleRetry}
              id="error-retry-button"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 8,
                border: `1px solid ${typeInfo.color}55`,
                background: `${typeInfo.color}15`,
                color: typeInfo.color,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => { e.target.style.background = `${typeInfo.color}25`; }}
              onMouseOut={e => { e.target.style.background = `${typeInfo.color}15`; }}
            >
              🔄 Reintentar
            </button>
          )}
          <button
            onClick={this.handleReload}
            id="error-reload-button"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(148, 163, 184, 0.08)',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => { e.target.style.background = 'rgba(148, 163, 184, 0.15)'; }}
            onMouseOut={e => { e.target.style.background = 'rgba(148, 163, 184, 0.08)'; }}
          >
            ↻ Recargar página
          </button>
        </div>
      </div>
    );
  }
}

/**
 * Lightweight ErrorBoundary for individual sections/cards.
 * Falls back to a compact error indicator instead of a full page error.
 */
export class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn(`[SectionError:${this.props.label || 'section'}]`, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '1rem',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-secondary, #94a3b8)',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <p style={{ margin: '0.25rem 0 0.5rem' }}>
            Error al cargar {this.props.label || 'esta sección'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '0.25rem 0.75rem', borderRadius: 6, fontSize: '0.75rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444', cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
