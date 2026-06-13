'use client';
/**
 * StepErrorBoundary — Catches errors in individual onboarding steps
 * Without collapsing the entire onboarding flow.
 */
import { Component } from 'react';

export class StepErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[StepErrorBoundary] Step ${this.props.stepName} crashed:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Error en paso: {this.props.stepName || 'Desconocido'}
          </h3>
          <p className="text-gray-400 mb-6">
            Algo salió mal al cargar este paso. Tu progreso anterior está guardado.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reintentar
            </button>
            {this.props.onSkip && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.props.onSkip}
              >
                Saltar paso
              </button>
            )}
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 text-xs text-red-400/60 text-left bg-red-900/10 p-3 rounded overflow-auto max-h-32">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
