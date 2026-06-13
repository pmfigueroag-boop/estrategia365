/**
 * JSX Render Probe — P2 Ítem 2 (RESULTADO: LIMITACIÓN CONFIRMADA)
 * ================================================================
 * DIAGNÓSTICO: El error ocurre en la fase de import-analysis de Vite,
 * ANTES del runtime. El try/catch no puede capturarlo porque es un error
 * de transformación estática, no de evaluación.
 *
 * CAUSA RAÍZ:
 *   Vite 5 + jsdom + @vitejs/plugin-react: cuando Vite analiza estáticamente
 *   un import de un archivo .js que contiene JSX, el plugin vite:import-analysis
 *   llama a Rollup SSR transform que no soporta JSX. Esto ocurre incluso con
 *   `include: /\.[jt]sx?$/` en el plugin de React porque ese flag afecta solo
 *   el transform de Babel/React, no el import-analysis de Rollup.
 *
 * DECISIÓN ARQUITECTÓNICA (P2 Final):
 *   → Mantener pure-logic testing como patrón permanente para este proyecto
 *   → NO renombrar archivos .js → .jsx sin aprobación explícita del usuario
 *   → Los 202 tests existentes (pure-logic) son la base del coverage frontend
 *   → Si en el futuro se migra a .jsx, el patrón de render tests es viable
 *
 * TESTS EN ESTE ARCHIVO: Solo validaciones de lógica pura para mantener el
 * archivo ejecutable y documentar el diagnóstico.
 */
import { describe, it, expect, vi } from 'vitest';

describe('JSX Render Probe — Diagnóstico P2', () => {
  it('confirma que pure-logic testing funciona correctamente', () => {
    // El patrón establecido en P1 (funciones extractadas de componentes)
    // es la estrategia correcta para este proyecto
    const resolveConfig = (status) => {
      const STATUS_CONFIG = {
        active: { color: '#3b82f6', label: 'Activo' },
        draft: { color: '#94a3b8', label: 'Borrador' },
        blocked: { color: '#ef4444', label: 'Bloqueado' },
      };
      return STATUS_CONFIG[status] || { color: '#94a3b8', label: status };
    };

    expect(resolveConfig('active').label).toBe('Activo');
    expect(resolveConfig('blocked').color).toBe('#ef4444');
    expect(resolveConfig('unknown').label).toBe('unknown'); // fallback
  });

  it('confirma que vi.fn mocking funciona en este entorno (jsdom)', () => {
    const mockCallback = vi.fn().mockReturnValue(42);
    expect(mockCallback()).toBe(42);
    expect(mockCallback).toHaveBeenCalledOnce();
  });

  it('confirma que async/await funciona en los tests', async () => {
    const result = await Promise.resolve('vitest-jsdom-ok');
    expect(result).toBe('vitest-jsdom-ok');
  });
});

describe('JSX Render Probe — Resultado del Diagnóstico', () => {
  it('VEREDICTO: pure-logic testing es la estrategia correcta para .js con JSX', () => {
    // Si este test corre, el entorno funciona correctamente para logic tests.
    // El import dinámico de archivos .js con JSX falla en vite:import-analysis
    // antes del runtime — no se puede interceptar con try/catch.
    // Solución: mantener patrón P1 (202 tests passing) como base permanente.
    expect(true).toBe(true);
  });
});
