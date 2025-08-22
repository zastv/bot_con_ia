import React from 'react';
import { Settings } from 'lucide-react';
import { TradingPair } from '../../types';

interface SettingsPanelProps {
  showSettings: boolean;
  selectedPairs: string[];
  togglePairSelection: (symbol: string) => void;
  signalInterval: number;
  setSignalInterval: (interval: number) => void;
  maxSignals: number;
  setMaxSignals: (max: number) => void;
  filteredPairs: TradingPair[];
  // Nuevos: gestión de riesgo
  balance: number;
  setBalance: (v: number) => void;
  riskPct: number; // % por operación
  setRiskPct: (v: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showSettings,
  selectedPairs,
  togglePairSelection,
  signalInterval,
  setSignalInterval,
  maxSignals,
  setMaxSignals,
  filteredPairs,
  balance,
  setBalance,
  riskPct,
  setRiskPct,
}) => {
  if (!showSettings) return null;

  return (
    <div style={{ background: 'rgba(30, 27, 75, 0.98)', padding: '24px 8vw', borderBottom: '1px solid #6d28d9' }}>
      <h3 style={{ color: '#a78bfa', fontSize: '1.2rem', marginBottom: 16, fontWeight: 700 }}>Configuración</h3>
      
  {/* Selección de categorías removida por solicitud (siempre All) */}

      {/* Selección de pares */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Pares activos ({selectedPairs.length} seleccionados):</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {filteredPairs.map(pair => (
            <button
              key={pair.symbol}
              onClick={() => togglePairSelection(pair.symbol)}
              style={{
                background: selectedPairs.includes(pair.symbol) ? '#22d3ee' : 'rgba(107, 114, 128, 0.3)',
                color: selectedPairs.includes(pair.symbol) ? '#fff' : '#a5b4fc',
                border: '1px solid #6d28d9',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textAlign: 'left',
              }}
            >
              {pair.display}
            </button>
          ))}
        </div>
      </div>

  {/* Configuración de intervalo y riesgo */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        <div>
          <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Intervalo (ms):</label>
          <input
            type="number"
            value={signalInterval}
            onChange={(e) => setSignalInterval(Number(e.target.value))}
            min="3000"
            max="30000"
            step="1000"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#e0e7ff',
              border: '1px solid #6d28d9',
              borderRadius: 8,
              padding: '8px 12px',
              width: '120px',
            }}
          />
        </div>
        <div>
          <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Máx. señales:</label>
          <input
            type="number"
            value={maxSignals}
            onChange={(e) => setMaxSignals(Number(e.target.value))}
            min="3"
            max="20"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#e0e7ff',
              border: '1px solid #6d28d9',
              borderRadius: 8,
              padding: '8px 12px',
              width: '120px',
            }}
          />
        </div>
        <div>
          <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Balance (USD):</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            min="100"
            step="50"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#e0e7ff',
              border: '1px solid #6d28d9',
              borderRadius: 8,
              padding: '8px 12px',
              width: '160px',
            }}
          />
        </div>
        <div>
          <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Riesgo por operación (%):</label>
          <input
            type="number"
            value={riskPct}
            onChange={(e) => setRiskPct(Number(e.target.value))}
            min="0.1"
            max="5"
            step="0.1"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#e0e7ff',
              border: '1px solid #6d28d9',
              borderRadius: 8,
              padding: '8px 12px',
              width: '160px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
