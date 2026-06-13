import { useState, useRef } from 'react';
import api from '@/lib/api';
import { useToast } from '@/features/plan/context/ToastContext';

const DOC_TYPES = [
  { value: 'strategic_plan', label: '📋 Plan Estratégico' },
  { value: 'financial', label: '💰 Estado Financiero' },
  { value: 'market_analysis', label: '📊 Análisis de Mercado' },
  { value: 'org_chart', label: '🏗️ Organigrama' },
  { value: 'general', label: '📄 Documento General' },
];

export default function StepDocuments({ onPrev, onNext, institutionId, documents, setDocuments }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('general');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !institutionId) return;
    setUploading(true);
    try {
      const doc = await api.uploadDocument(institutionId, file, selectedDocType);
      setDocuments(prev => [...prev, doc]);
      toast.success(`"${file.name}" cargado (${doc.extracted_text?.length || 0} caracteres extraídos)`);
    } catch (err) { 
      toast.error(err.message || 'Error al subir el archivo'); 
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteDoc = async (docId, filename) => {
    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.info(`"${filename}" eliminado`);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-2">📄 Carga de Documentos</h2>
      <p className="text-gray-400 text-sm mb-6">
        Sube documentos institucionales para que la IA tenga contexto real de tu organización. Soporta PDF y texto.
      </p>

      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 cursor-pointer transition-colors ${uploading ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-600 hover:border-indigo-400'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('border-indigo-500'); }}
        onDrop={(e) => { 
          e.preventDefault(); 
          e.currentTarget.classList.remove('border-indigo-500'); 
          const file = e.dataTransfer.files[0]; 
          if (file) { 
            const dt = new DataTransfer(); 
            dt.items.add(file); 
            if(fileInputRef.current) fileInputRef.current.files = dt.files; 
            handleUpload({target:{files:dt.files}}); 
          }
        }}
      >
        <p className="text-4xl mb-2">📁</p>
        <p className="font-semibold text-white">{uploading ? '⏳ Subiendo...' : 'Arrastra un archivo o haz clic para seleccionar'}</p>
        <p className="text-xs text-gray-400 mt-2">PDF, TXT, CSV, MD — Máx. 10MB</p>
      </div>

      <div className="flex gap-3 mb-6 items-center">
        <label className="text-sm text-gray-400 whitespace-nowrap">Tipo de documento:</label>
        <select 
          className="form-textarea min-h-[auto] py-2 px-3 flex-1" 
          value={selectedDocType} 
          onChange={e => setSelectedDocType(e.target.value)}
        >
          {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.txt,.csv,.md,.doc,.docx" className="hidden" onChange={handleUpload}/>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="text-md text-gray-400">Documentos Cargados ({documents.length})</h3>
          {documents.map(doc => (
            <div key={doc.id} className="glass-panel p-4 flex justify-between items-center rounded-xl bg-gray-800/30">
              <div>
                <strong className="text-white block">{doc.filename}</strong>
                <span className="text-xs text-gray-400 block mt-1">
                  {DOC_TYPES.find(t => t.value === doc.doc_type)?.label || doc.doc_type} · {doc.extracted_text?.length || 0} caracteres extraídos
                </span>
              </div>
              <button 
                onClick={() => handleDeleteDoc(doc.id, doc.filename)} 
                className="text-red-400 hover:text-red-300 transition-colors p-2 text-xl"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
