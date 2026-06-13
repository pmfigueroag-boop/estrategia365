'use client';

/**
 * SparkLine — Minimal SVG Sparkline
 * ====================================
 * Inline trend visualization.
 *
 * Props:
 *   data: number[]
 *   width: number (default 80)
 *   height: number (default 24)
 *   color: string (auto: green if up, red if down, blue if flat)
 *   strokeWidth: number (default 1.5)
 */
export default function SparkLine({
  data = [],
  width = 80,
  height = 24,
  color,
  strokeWidth = 1.5,
}) {
  if (!data || data.length < 2) {
    return <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>—</span>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  // Auto-color based on trend direction
  const trend = data[data.length - 1] - data[0];
  const autoColor = trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6366f1';
  const lineColor = color || autoColor;

  const points = data.map((val, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (val - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  // Gradient fill under the line
  const fillPoints = `${pad},${height - pad} ${points} ${width - pad},${height - pad}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id={`spark-grad-${lineColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#spark-grad-${lineColor.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const lastX = pad + ((data.length - 1) / (data.length - 1)) * (width - pad * 2);
        const lastY = pad + (1 - (data[data.length - 1] - min) / range) * (height - pad * 2);
        return <circle cx={lastX} cy={lastY} r="2" fill={lineColor} />;
      })()}
    </svg>
  );
}
