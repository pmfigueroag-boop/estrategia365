/**
 * PorterRadar — Data Transformation Logic Tests
 * Tests radar data preparation from Porter forces, not rendering.
 */
import { describe, it, expect } from 'vitest';

function buildRadarData(forces = []) {
  const FORCE_LABELS = {
    rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
    substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
    supplier_power: 'Poder Proveedor',
  };
  return Object.entries(FORCE_LABELS).map(([key, label]) => {
    const force = forces.find(f => f.force === key);
    return { force: key, label, score: force?.score || 0, cps: force?.competitive_pressure_score || 0 };
  });
}

describe('PorterRadar — Data Transformation', () => {
  const mockForces = [
    { force: 'rivalry', score: 4, competitive_pressure_score: 75 },
    { force: 'new_entrants', score: 3, competitive_pressure_score: 55 },
    { force: 'substitutes', score: 2, competitive_pressure_score: 35 },
    { force: 'buyer_power', score: 5, competitive_pressure_score: 90 },
    { force: 'supplier_power', score: 3, competitive_pressure_score: 50 },
  ];

  it('generates 5 data points for all forces', () => {
    const data = buildRadarData(mockForces);
    expect(data).toHaveLength(5);
  });

  it('maps force scores correctly', () => {
    const data = buildRadarData(mockForces);
    const rivalry = data.find(d => d.force === 'rivalry');
    expect(rivalry.score).toBe(4);
    expect(rivalry.cps).toBe(75);
  });

  it('uses Spanish labels', () => {
    const data = buildRadarData(mockForces);
    expect(data[0].label).toBe('Rivalidad');
    expect(data[4].label).toBe('Poder Proveedor');
  });

  it('defaults to 0 for missing forces', () => {
    const data = buildRadarData([]);
    expect(data.every(d => d.score === 0)).toBe(true);
  });
});
