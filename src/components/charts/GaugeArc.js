'use client';
import { useRef, useEffect } from 'react';

/**
 * GaugeArc — Animated Arc Gauge
 * ================================
 * Traffic-light arc gauge for budget/score display.
 *
 * Props:
 *   value: number (0-100)
 *   max: number (default 100)
 *   label: string
 *   sublabel: string
 *   size: number (default 160)
 *   thresholds: { green: number, yellow: number } (default { green: 60, yellow: 85 })
 *   colorOverride: string (optional — bypass thresholds)
 */
export default function GaugeArc({
  value = 0,
  max = 100,
  label = '',
  sublabel = '',
  size = 160,
  thresholds = { green: 60, yellow: 85 },
  colorOverride,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine color by threshold zones
  let gaugeColor;
  if (colorOverride) {
    gaugeColor = colorOverride;
  } else if (pct <= thresholds.green) {
    gaugeColor = '#10b981'; // green — healthy
  } else if (pct <= thresholds.yellow) {
    gaugeColor = '#f59e0b'; // yellow — caution
  } else {
    gaugeColor = '#ef4444'; // red — critical
  }

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ textAlign: 'center', width: size }}>
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(148, 163, 184, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
          }}
        />
        {/* Center value */}
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          fill={gaugeColor}
          fontSize="1.8rem"
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {Math.round(pct)}%
        </text>
        {/* Label */}
        {label && (
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            fill="rgba(148, 163, 184, 0.7)"
            fontSize="0.7rem"
            fontWeight="500"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {label}
          </text>
        )}
      </svg>
      {sublabel && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: -4 }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
