/**
 * PestelSignalDetail — Click-to-expand Signal Drill-down (Sprint 5)
 * ==================================================================
 * Modal overlay showing full signal details with metadata, risk context,
 * and strategic recommendations.
 */
"use client";
import { useState } from 'react';

const FACTOR_COLORS = { P: '#ff4d6a', E: '#f0a500', S: '#00c896', T: '#6366f1', E2: '#a855f7', L: '#f97316' };
const FACTOR_LABELS = { P: 'Político', E: 'Económico', S: 'Social', T: 'Tecnológico', E2: 'Ecológico', L: 'Legal' };
const TREND_ICONS = { declining: '📉', stable: '➡️', improving: '📈' };
const TREND_LABELS = { declining: 'Empeorando', stable: 'Estable', improving: 'Mejorando' };
const TIMEFRAME_LABELS = { short: 'Corto plazo (0-6m)', medium: 'Mediano plazo (6-18m)', long: 'Largo plazo (18m+)' };

export default function PestelSignalDetail({ signal, onClose }) {
  if (!signal) return null;

  const factor = signal.factor?.toUpperCase?.() || signal.factor || 'P';
  const color = FACTOR_COLORS[factor] || '#6366f1';
  const score = signal.priority_score || 0;
  const prob = signal.probability || 50;
  const trend = signal.trend || 'stable';
  const tf = signal.timeframe || 'medium';

  const riskLevel = score >= 80 ? 'CRÍTICO' : score >= 60 ? 'ELEVADO' : score >= 40 ? 'MODERADO' : 'BAJO';
  const riskColor = score >= 80 ? '#ff4d6a' : score >= 60 ? '#f0a500' : score >= 40 ? '#6366f1' : '#00c896';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      animation: 'fadeIn 0.2s ease-out',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,20,35,0.98), rgba(20,30,50,0.98))',
        border: `1px solid ${color}33`,
        borderRadius: '16px',
        maxWidth: '640px', width: '100%',
        maxHeight: '85vh', overflowY: 'auto',
        padding: '2rem',
        boxShadow: `0 0 60px ${color}22`,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: `${color}22`, color, border: `1px solid ${color}44`,
                padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
              }}>{FACTOR_LABELS[factor] || factor}</span>
              <span style={{
                background: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}44`,
                padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
              }}>{riskLevel}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>#{signal.id}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)' }}>
              {signal.title}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '1.2rem',
            cursor: 'pointer', width: '36px', height: '36px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* KPI Strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{score}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: prob >= 70 ? '#ff4d6a' : prob >= 40 ? '#f0a500' : '#00c896' }}>{prob}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Probabilidad</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>{TREND_ICONS[trend]}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{TREND_LABELS[trend]}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{signal.severity}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severidad</div>
          </div>
        </div>

        {/* Probability Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Probabilidad de materialización</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{prob}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${prob}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>📋 Descripción</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{signal.description}</p>
        </div>

        {/* Strategic Impact */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>🎯 Impacto Estratégico</h4>
          <p style={{
            fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)',
            borderLeft: `3px solid ${color}`, paddingLeft: '0.75rem',
            background: `${color}08`, borderRadius: '0 6px 6px 0', padding: '0.75rem 0.75rem 0.75rem 1rem',
          }}>{signal.strategic_impact}</p>
        </div>

        {/* Metadata Footer */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
          padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Horizonte</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>🕐 {TIMEFRAME_LABELS[tf] || tf}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Fuente</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>🔬 {signal.source || 'Gemini AI'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Creado por</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>👤 {signal.created_by || 'system'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Modificado</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>📅 {signal.modified_at ? new Date(signal.modified_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
