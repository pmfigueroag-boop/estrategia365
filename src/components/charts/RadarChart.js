'use client';
import { useRef, useEffect } from 'react';

/**
 * RadarChart — Reusable Canvas 2D Radar
 * ========================================
 * Animated radar chart for maturity/score visualization.
 *
 * Props:
 *   dimensions: [{ label: 'Governance', value: 78, max: 100 }, ...]
 *   size: number (default 280)
 *   color: string (default '#6366f1')
 *   bgColor: string (default 'rgba(99,102,241,0.08)')
 */
export default function RadarChart({
  dimensions = [],
  size = 280,
  color = '#6366f1',
  bgColor = 'rgba(99,102,241,0.08)',
  animate = true,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.length < 3) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;
    const n = dimensions.length;
    const angleStep = (2 * Math.PI) / n;
    const rings = 5;

    let progress = animate ? 0 : 1;
    const startTime = performance.now();
    const duration = 800;

    function draw(now) {
      if (animate && progress < 1) {
        progress = Math.min(1, (now - startTime) / duration);
        progress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      }

      ctx.clearRect(0, 0, size, size);

      // Grid rings
      for (let r = 1; r <= rings; r++) {
        const ringR = (radius / rings) * r;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const angle = -Math.PI / 2 + angleStep * (i % n);
          const x = cx + ringR * Math.cos(angle);
          const y = cy + ringR * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis lines
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + angleStep * i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.stroke();
      }

      // Data polygon
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const dim = dimensions[i % n];
        const val = ((dim.value / (dim.max || 100)) * progress);
        const r = radius * val;
        const angle = -Math.PI / 2 + angleStep * (i % n);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Data points
      for (let i = 0; i < n; i++) {
        const dim = dimensions[i];
        const val = ((dim.value / (dim.max || 100)) * progress);
        const r = radius * val;
        const angle = -Math.PI / 2 + angleStep * i;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Labels
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const dim = dimensions[i];
        const angle = -Math.PI / 2 + angleStep * i;
        const labelR = radius + 22;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
        ctx.fillText(dim.label, x, y);
        // Value below
        ctx.font = '700 10px Inter, system-ui, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(`${Math.round(dim.value * progress)}`, x, y + 13);
        ctx.font = '600 11px Inter, system-ui, sans-serif';
      }

      if (animate && progress < 1) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [dimensions, size, color, bgColor, animate]);

  if (dimensions.length < 3) {
    return <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Se necesitan al menos 3 dimensiones para radar.</div>;
  }

  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />;
}
