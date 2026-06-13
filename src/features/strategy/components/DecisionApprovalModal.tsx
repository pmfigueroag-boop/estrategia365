"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function DecisionApprovalModal({ decision, onClose, onSuccess }) {
  const [note, setNote] = useState(decision?.human_validation_note || '');
  const [signatures, setSignatures] = useState(decision?.signatures || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Signature Form State
  const [role, setRole] = useState('');
  const [signer, setSigner] = useState('');
  const [token, setToken] = useState('');

  const wordCount = note.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isNoteValid = wordCount >= 15;
  const isQuorumMet = signatures.length >= 2;

  const handleSign = async (e) => {
    e.preventDefault();
    if (!role || !signer || !token) {
      setError("Todos los campos de firma son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sig = await api.signDecision(decision.id, {
        role_required: role,
        signer_name: signer,
        password_or_token: token
      });
      setSignatures([...signatures, sig]);
      setRole(''); setSigner(''); setToken('');
    } catch (err) {
      setError(err.message || "Error al registrar firma.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!isNoteValid || !isQuorumMet) return;
    setLoading(true);
    setError(null);
    try {
      await api.updateDecisionStatus(decision.id, {
        status: 'approved',
        human_validation_note: note
      });
      onSuccess();
    } catch (err) {
      // Parse 400 Errors (CapEx/Resources) to guide the user on Trade-offs
      const msg = err.message || "";
      if (msg.includes("400") || msg.toLowerCase().includes("budget") || msg.toLowerCase().includes("presupuesto") || msg.toLowerCase().includes("capacidad") || msg.toLowerCase().includes("recursos")) {
        setError(`⚠️ Fricción Institucional: Recursos Insuficientes. \n\n${msg}\n\nPara aprobar este mandato, primero debe ir al portafolio activo y RECHAZAR otra iniciativa para liberar capital (Trade-off Estratégico).`);
      } else {
        setError(`Error al aprobar: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!decision) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Aprobación Institucional</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className={`p-4 rounded text-sm font-medium border-l-4 ${error.includes('⚠️') ? 'bg-orange-50 text-orange-800 border-orange-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
              <p className="whitespace-pre-line">{error}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Decisión a Aprobar</h3>
            <p className="text-lg text-gray-900 font-medium">{decision.title}</p>
            <div className="flex gap-4 text-sm text-gray-500 mt-2">
              <span>Impacto: {decision.impact_score}</span>
              <span>Presupuesto: ${decision.estimated_budget}M</span>
              <span>Riesgo: {decision.risk_score}</span>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
            <h3 className="text-sm font-bold text-orange-800">Bloqueo de Gobernanza (V3)</h3>
            <p className="text-xs text-orange-700 mt-1">
              Para trasladar esta decisión al portfolio activo, el sistema exige un quórum de múltiples firmas y una validación forense detallada.
            </p>
          </div>

          {/* Section 1: Signatures */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex justify-between">
              1. Firmas Requeridas
              <span className={`text-xs px-2 py-1 rounded ${isQuorumMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {signatures.length} / 2 Firmas
              </span>
            </h3>
            
            {signatures.length > 0 && (
              <ul className="mb-4 space-y-2">
                {signatures.map((s, i) => (
                  <li key={i} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                    <span><b>{s.role_required}</b>: {s.signer_name}</span>
                    <span className="text-gray-400 text-xs font-mono">{s.signature_hash.substring(0,8)}</span>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleSign} className="flex gap-2 items-end bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Rol</label>
                <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border-gray-300 rounded text-sm p-1.5" disabled={loading}>
                  <option value="">Seleccione...</option>
                  <option value="Strategy Director">Director de Estrategia</option>
                  <option value="Financial Auditor">Auditor Financiero</option>
                  <option value="Operations Head">Jefe de Operaciones</option>
                  <option value="CEO">CEO</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Firma (Nombre)</label>
                <input type="text" value={signer} onChange={e=>setSigner(e.target.value)} className="w-full border-gray-300 rounded text-sm p-1.5" disabled={loading} placeholder="Ej. Juan Pérez" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Token</label>
                <input type="password" value={token} onChange={e=>setToken(e.target.value)} className="w-full border-gray-300 rounded text-sm p-1.5" disabled={loading} placeholder="***" />
              </div>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                Firmar
              </button>
            </form>
          </div>

          {/* Section 2: Validation Note */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2 flex justify-between">
              2. Fricción Cognitiva (Speed Bump)
              <span className={`text-xs px-2 py-1 rounded ${isNoteValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {wordCount} / 15 palabras min.
              </span>
            </h3>
            <p className="text-xs text-gray-500 mb-2">Justifique la renuncia (Trade-off). ¿Qué iniciativa se detendrá para ejecutar esta?</p>
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              className={`w-full border rounded p-3 text-sm h-32 ${isNoteValid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
              placeholder="Escriba su justificación estratégica profunda aquí..."
              disabled={loading}
            />
          </div>

        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded bg-white">
            Cancelar
          </button>
          <button 
            onClick={handleApprove} 
            disabled={loading || !isNoteValid || !isQuorumMet}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? "Procesando..." : "Autorizar Mandato"}
          </button>
        </div>
      </div>
    </div>
  );
}
