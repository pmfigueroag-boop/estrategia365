'use client';

/**
 * Intelligence Hub — Fase 2: Strategic Intelligence
 * ====================================================
 * Unified intelligence view that integrates all 7 analysis frameworks
 * with the Digital Twin for contextual, temporal intelligence.
 *
 * 3-Panel Layout:
 * 1. Coverage Matrix — 7 analyses × freshness status
 * 2. Twin-Linked Recommendations — org-change-driven re-analysis suggestions
 * 3. Comparative View — delta when comparing twin snapshots
 */

import { useState } from 'react';
import {
  useIntelligenceSummary,
  useIntelligenceGaps,
  useIntelligenceRecommendations,
} from '@/features/shared/hooks/swr-hooks';

const ANALYSIS_LABELS = {
  pestel: { name: 'PESTEL', icon: '🌍', desc: 'Macro-entorno' },
  porter: { name: 'Porter 5F', icon: '⚔️', desc: 'Competitividad' },
  swot: { name: 'FODA', icon: '📊', desc: 'Int/Ext Analysis' },
  tows: { name: 'TOWS', icon: '🔀', desc: 'Estrategias cruzadas' },
  vrio: { name: 'VRIO', icon: '💎', desc: 'Recursos y capacidades' },
  bcg: { name: 'BCG Matrix', icon: '📈', desc: 'Portfolio strategy' },
  blue_ocean: { name: 'Blue Ocean', icon: '🌊', desc: 'Innovación de valor' },
};

const FRESHNESS_COLORS = {
  fresh: { bg: '#064e3b', text: '#6ee7b7', label: 'Fresco' },
  aging: { bg: '#78350f', text: '#fcd34d', label: 'Envejeciendo' },
  stale: { bg: '#7f1d1d', text: '#fca5a5', label: 'Obsoleto' },
  never_run: { bg: '#1e1b4b', text: '#a5b4fc', label: 'Sin ejecutar' },
  unknown: { bg: '#374151', text: '#9ca3af', label: 'Desconocido' },
};

const SEVERITY_COLORS = {
  critical: { bg: '#7f1d1d', text: '#fca5a5', border: '#dc2626' },
  high: { bg: '#78350f', text: '#fcd34d', border: '#f59e0b' },
  medium: { bg: '#1e3a5f', text: '#93c5fd', border: '#3b82f6' },
  low: { bg: '#064e3b', text: '#6ee7b7', border: '#10b981' },
};

export default function IntelligenceHubPage() {
  const [institutionId] = useState(1);
  const [planId] = useState(null);

  const { data: summary, isLoading: summaryLoading } = useIntelligenceSummary(institutionId, planId);
  const { data: gaps, isLoading: gapsLoading } = useIntelligenceGaps(institutionId, planId);
  const { data: recommendations, isLoading: recsLoading } = useIntelligenceRecommendations(institutionId, planId);

  const isLoading = summaryLoading || gapsLoading || recsLoading;

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Intelligence Hub</h1>
          <p style={styles.subtitle}>
            Inteligencia estratégica contextualizada por el Digital Twin
          </p>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.coverageLabel}>Cobertura</span>
          <span style={styles.coveragePct}>
            {summary?.coverage?.pct ?? '—'}%
          </span>
        </div>
      </header>

      {/* Panel 1: Coverage Matrix */}
      <section style={styles.section} id="coverage-matrix">
        <h2 style={styles.sectionTitle}>📋 Matriz de Cobertura</h2>
        <p style={styles.sectionDesc}>
          Estado de los 7 marcos de análisis estratégico
        </p>
        <div style={styles.grid}>
          {Object.entries(ANALYSIS_LABELS).map(([key, meta]) => {
            const analysis = summary?.analyses?.[key] || {};
            const freshness = FRESHNESS_COLORS[analysis.freshness] || FRESHNESS_COLORS.unknown;
            return (
              <div key={key} style={{ ...styles.card, borderColor: freshness.text + '40' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{meta.icon}</span>
                  <span style={styles.cardName}>{meta.name}</span>
                </div>
                <p style={styles.cardDesc}>{meta.desc}</p>
                <div style={styles.cardMetrics}>
                  <span style={styles.metricLabel}>Items:</span>
                  <span style={styles.metricValue}>{analysis.count ?? 0}</span>
                </div>
                {analysis.age_days != null && (
                  <div style={styles.cardMetrics}>
                    <span style={styles.metricLabel}>Edad:</span>
                    <span style={styles.metricValue}>{analysis.age_days}d</span>
                  </div>
                )}
                <div style={{
                  ...styles.freshnessTag,
                  backgroundColor: freshness.bg,
                  color: freshness.text,
                }}>
                  {freshness.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Panel 2: Recommendations */}
      <section style={styles.section} id="recommendations">
        <h2 style={styles.sectionTitle}>💡 Recomendaciones</h2>
        <p style={styles.sectionDesc}>
          Acciones sugeridas basadas en cambios organizacionales y brechas de análisis
        </p>
        {isLoading ? (
          <div style={styles.loading}>Cargando recomendaciones...</div>
        ) : recommendations?.recommendations?.length > 0 ? (
          <div style={styles.recList}>
            {recommendations.recommendations.map((rec, i) => {
              const sev = SEVERITY_COLORS[rec.priority] || SEVERITY_COLORS.medium;
              return (
                <div key={i} style={{ ...styles.recCard, borderLeftColor: sev.border }}>
                  <div style={styles.recHeader}>
                    <span style={{
                      ...styles.recPriority,
                      backgroundColor: sev.bg,
                      color: sev.text,
                    }}>
                      {rec.priority?.toUpperCase()}
                    </span>
                    <span style={styles.recAnalysis}>
                      {ANALYSIS_LABELS[rec.analysis]?.icon} {ANALYSIS_LABELS[rec.analysis]?.name || rec.analysis}
                    </span>
                    {rec.trigger === 'twin_change' && (
                      <span style={styles.twinBadge}>🔗 Twin</span>
                    )}
                  </div>
                  <p style={styles.recText}>{rec.recommendation}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✅</span>
            <p>No hay brechas de inteligencia — todos los análisis están al día</p>
          </div>
        )}
      </section>

      {/* Panel 3: Intelligence Gaps */}
      <section style={styles.section} id="intelligence-gaps">
        <h2 style={styles.sectionTitle}>⚠️ Brechas de Inteligencia</h2>
        <p style={styles.sectionDesc}>
          Análisis faltantes o desactualizados que requieren atención
        </p>
        {gapsLoading ? (
          <div style={styles.loading}>Analizando brechas...</div>
        ) : gaps?.gaps?.length > 0 ? (
          <div style={styles.gapList}>
            {gaps.gaps.map((gap, i) => {
              const sev = SEVERITY_COLORS[gap.severity] || SEVERITY_COLORS.medium;
              return (
                <div key={i} style={{ ...styles.gapCard, borderColor: sev.border }}>
                  <div style={styles.gapHeader}>
                    <span style={{
                      ...styles.gapSeverity,
                      backgroundColor: sev.bg,
                      color: sev.text,
                    }}>
                      {gap.severity}
                    </span>
                    <span style={styles.gapAnalysis}>
                      {ANALYSIS_LABELS[gap.analysis]?.name || gap.analysis}
                    </span>
                  </div>
                  <p style={styles.gapReason}>{gap.reason}</p>
                  <span style={styles.gapAction}>
                    {gap.action === 'run_scan' ? '▶ Ejecutar escaneo' : '🔄 Re-escanear'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🎯</span>
            <p>Cobertura completa — sin brechas detectadas</p>
          </div>
        )}
      </section>

      {/* Twin Health Summary */}
      {summary?.twin_health && (
        <section style={styles.section} id="twin-health">
          <h2 style={styles.sectionTitle}>🏥 Salud del Digital Twin</h2>
          <div style={styles.healthGrid}>
            <div style={styles.healthCard}>
              <span style={styles.healthLabel}>Completitud</span>
              <span style={styles.healthValue}>
                {summary.twin_health.current_completeness?.overall ?? '—'}%
              </span>
            </div>
            <div style={styles.healthCard}>
              <span style={styles.healthLabel}>Snapshots</span>
              <span style={styles.healthValue}>
                {summary.twin_health.total_snapshots ?? 0}
              </span>
            </div>
            <div style={styles.healthCard}>
              <span style={styles.healthLabel}>Eventos</span>
              <span style={styles.healthValue}>
                {summary.twin_health.total_events ?? 0}
              </span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = {
  main: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: "'Inter', system-ui, sans-serif",
    color: '#e2e8f0',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  headerBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  coverageLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
  },
  coveragePct: {
    fontSize: 28,
    fontWeight: 700,
    color: '#60a5fa',
  },
  section: {
    marginBottom: 32,
    padding: 24,
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  card: {
    padding: 16,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardIcon: { fontSize: 20 },
  cardName: { fontSize: 14, fontWeight: 600 },
  cardDesc: { fontSize: 12, color: '#94a3b8', margin: '0 0 12px 0' },
  cardMetrics: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    marginBottom: 4,
  },
  metricLabel: { color: '#94a3b8' },
  metricValue: { fontWeight: 600 },
  freshnessTag: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  recList: { display: 'flex', flexDirection: 'column', gap: 12 },
  recCard: {
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    borderLeft: '3px solid',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  recPriority: {
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  recAnalysis: { fontSize: 13, fontWeight: 600 },
  twinBadge: {
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#c4b5fd',
    fontWeight: 600,
  },
  recText: { fontSize: 13, color: '#cbd5e1', margin: 0 },
  gapList: { display: 'flex', flexDirection: 'column', gap: 10 },
  gapCard: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    border: '1px solid',
  },
  gapHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  gapSeverity: {
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  gapAnalysis: { fontSize: 13, fontWeight: 600 },
  gapReason: { fontSize: 13, color: '#cbd5e1', margin: '0 0 6px 0' },
  gapAction: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: 40,
    color: '#94a3b8',
    fontSize: 14,
  },
  emptyIcon: { fontSize: 32, display: 'block', marginBottom: 8 },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  healthCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  healthLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  healthValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#60a5fa',
  },
  loading: {
    textAlign: 'center',
    padding: 30,
    color: '#94a3b8',
    fontSize: 13,
  },
};
