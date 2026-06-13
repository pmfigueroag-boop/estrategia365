/**
 * Estrategia 365 — Chart Component Stories (Phase 8)
 * =====================================================
 * Interactive Storybook stories for Recharts-based visualizations.
 */

import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

// ── Radar Chart ────────────────────────────────────────────

const radarData = [
  { dimension: 'Political', score: 78 },
  { dimension: 'Economic', score: 85 },
  { dimension: 'Social', score: 62 },
  { dimension: 'Technological', score: 92 },
  { dimension: 'Environmental', score: 45 },
  { dimension: 'Legal', score: 71 },
];

export const PESTELRadar = {
  render: () => (
    <ResponsiveContainer width={500} height={400}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="PESTEL Score" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  ),
};

// ── Bar Chart ──────────────────────────────────────────────

const porterData = [
  { force: 'Rivalry', intensity: 75 },
  { force: 'New Entrants', intensity: 45 },
  { force: 'Substitutes', intensity: 60 },
  { force: 'Buyer Power', intensity: 55 },
  { force: 'Supplier Power', intensity: 40 },
];

export const PorterBar = {
  render: () => (
    <ResponsiveContainer width={500} height={300}>
      <BarChart data={porterData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="force" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="intensity" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  ),
};

// ── Pie Chart ──────────────────────────────────────────────

const bcgData = [
  { name: 'Stars', value: 30 },
  { name: 'Cash Cows', value: 40 },
  { name: 'Question Marks', value: 20 },
  { name: 'Dogs', value: 10 },
];

export const BCGPie = {
  render: () => (
    <ResponsiveContainer width={400} height={300}>
      <PieChart>
        <Pie data={bcgData} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
          {bcgData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ),
};

// ── Line Chart ─────────────────────────────────────────────

const trendData = [
  { month: 'Jan', score: 65, target: 80 },
  { month: 'Feb', score: 68, target: 80 },
  { month: 'Mar', score: 72, target: 80 },
  { month: 'Apr', score: 78, target: 85 },
  { month: 'May', score: 85, target: 85 },
  { month: 'Jun', score: 88, target: 90 },
];

export const StrategyTrend = {
  render: () => (
    <ResponsiveContainer width={500} height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[50, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Actual Score" />
        <Line type="monotone" dataKey="target" stroke="#d97706" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Target" />
      </LineChart>
    </ResponsiveContainer>
  ),
};

// ── Score Gauge ─────────────────────────────────────────────

const ScoreGauge = ({ score, label, maxScore = 100 }) => {
  const percentage = (score / maxScore) * 100;
  const getColor = (p) => p >= 80 ? '#22c55e' : p >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ textAlign: 'center', width: '120px' }}>
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: `conic-gradient(${getColor(percentage)} ${percentage * 3.6}deg, #e5e7eb ${percentage * 3.6}deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
      }}>
        <div style={{
          width: '75px', height: '75px', borderRadius: '50%', backgroundColor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.25rem',
        }}>
          {score}
        </div>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{label}</p>
    </div>
  );
};

export const ScoreGaugeHigh = { render: () => <ScoreGauge score={92} label="Enterprise Maturity" /> };
export const ScoreGaugeMid = { render: () => <ScoreGauge score={65} label="AI Governance" /> };
export const ScoreGaugeDashboard = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <ScoreGauge score={97} label="Platform Score" />
      <ScoreGauge score={86} label="AI Maturity" />
      <ScoreGauge score={92} label="Governance" />
      <ScoreGauge score={78} label="Security" />
    </div>
  ),
};

// ── Meta ───────────────────────────────────────────────────

export default {
  title: 'Estrategia 365/Chart Components',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Recharts-based visualization components for strategic analysis dashboards.',
      },
    },
  },
};
