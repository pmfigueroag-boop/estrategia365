"use client";
import React, { createContext, useContext, useState } from 'react';

export const paradigms = [
  { id: 'competitive', name: 'Competitiva (Porter / 5 Fuerzas)', short: 'Porter' },
  { id: 'harvard', name: 'Clásica Harvard (FODA / Ajuste)', short: 'Harvard / FODA' },
  { id: 'resources', name: 'Recursos Internos (VRIO / RBV)', short: 'RBV / VRIO' },
  { id: 'ocean', name: 'Océano Azul (Innovación en Valor)', short: 'Blue Ocean' },
  { id: 'bsc', name: 'Balanced Scorecard (Kaplan & Norton)', short: 'BSC' },
  { id: 'japanese', name: 'Hoshin Kanri (Lean / Despliegue)', short: 'Hoshin Kanri' },
  { id: 'portfolio', name: 'Gestión de Portafolios (BCG)', short: 'BCG Matrix' },
  { id: 'cepal', name: 'Gestión Pública (CEPAL / ILPES)', short: 'CEPAL' },
  { id: 'mepyd', name: 'Plan Estratégico Institucional (MEPyD)', short: 'PEI / MEPyD' },
];

const ParadigmContext = createContext();

export function ParadigmProvider({ children }) {
  const [activeParadigm, setActiveParadigm] = useState(paradigms[0]);

  return (
    <ParadigmContext.Provider value={{ activeParadigm, setActiveParadigm, paradigms }}>
      {children}
    </ParadigmContext.Provider>
  );
}

export function useParadigm() {
  return useContext(ParadigmContext);
}
