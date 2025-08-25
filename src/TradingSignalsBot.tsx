import React, { useState } from 'react';
import Header from './components/Header';
import TradingViewWidget from './components/TradingViewWidget';
import ActiveTrade from './components/ActiveTrade';
import SignalsTable from './components/SignalsTable';
import TradeFeed from './components/TradeFeed';
import { useSignalGeneration } from './hooks/useSignalGeneration';
import { tradingPairs } from './data/tradingPairs';
import { Signal, Trade } from './types';

const TradingSignalsBot = () => {
  const [running, setRunning] = useState(true);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);
  const [visibleId, setVisibleId] = useState<number | null>(null); // cuál mostrar si hay 2

  // Cargar preferencia previa (par preferido) al montar
  React.useEffect(() => {
    const preferredPair = localStorage.getItem('preferred_pair');
    if (preferredPair && signals.length > 0) {
      const match = signals.find(s => s.pair === preferredPair);
      if (match) {
        setActiveTrade(match);
        setVisibleId(match.id);
      }
    }
  }, []);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['BTCUSD']);
  const [balance, setBalance] = useState<number>(1000);
  const [riskPct, setRiskPct] = useState<number>(1.0); // 1% por operación por defecto
  // Categorías deshabilitadas por solicitud: siempre 'All'
  const filterCategory = 'All';
  const [signalInterval, setSignalInterval] = useState(7000);
  const [maxSignals, setMaxSignals] = useState(8);

  const { signals, loading, error, clearSignals, batchMeta, events, activeTrade: hookActiveTrade, history } = useSignalGeneration(
    running,
    selectedPairs,
    signalInterval,
    maxSignals,
    tradingPairs
  );

  // Siempre encendido: no hay toggle

  const handleSetActive = (signal: Signal) => {
    setActiveTrade(signal);
  };

  // Sin selección de pares (forzado a BTCUSD)

  // Panel de configuración eliminado; no se usan pares filtrados

  const filteredSignals = signals.filter(s => 
    filterCategory === 'All' || 
    tradingPairs.find(p => p.symbol === s.pair)?.category === filterCategory
  );

  // Sin múltiples señales: tomar la activa del hook
  React.useEffect(() => {
    if (hookActiveTrade) setActiveTrade(hookActiveTrade);
    else setActiveTrade(null);
  }, [hookActiveTrade]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181e2a 0%, #6d28d9 100%)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
  <Header />


      {/* Panel de operación en curso y gráfico */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
        <TradingViewWidget activeTrade={activeTrade} />
        <ActiveTrade 
          activeTrade={activeTrade}
          loading={loading}
          error={error}
          running={running}
          balance={balance}
          riskPct={riskPct}
        />
      </main>

      <SignalsTable
        filteredSignals={filteredSignals.slice(0, 1)}
        filterCategory={'All'}
        setFilterCategory={() => {}}
        categories={['All']}
        onSetActive={() => {}}
        batchMeta={batchMeta}
      />

  <TradeFeed events={events} />

      {/* Historial de operaciones cerradas */}
      {history.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '24px auto', background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 16 }}>
          <h3 style={{ color: '#a78bfa', margin: '0 0 8px 0' }}>Historial</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#93c5fd', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Par</th>
                  <th style={{ padding: '8px' }}>Dirección</th>
                  <th style={{ padding: '8px' }}>Entrada</th>
                  <th style={{ padding: '8px' }}>Salida</th>
                  <th style={{ padding: '8px' }}>Motivo</th>
                  <th style={{ padding: '8px' }}>RR</th>
                  <th style={{ padding: '8px' }}>%</th>
                  <th style={{ padding: '8px' }}>Cierre</th>
                </tr>
              </thead>
              <tbody>
                {history.map(t => (
                  <tr key={t.id} style={{ color: '#e2e8f0', borderTop: '1px solid #252a3d' }}>
                    <td style={{ padding: '8px' }}>{t.display}</td>
                    <td style={{ padding: '8px', color: t.signal === 'BUY' ? '#22d3ee' : '#f472b6' }}>{t.signal}</td>
                    <td style={{ padding: '8px' }}>{t.entry}</td>
                    <td style={{ padding: '8px' }}>{t.exitPrice}</td>
                    <td style={{ padding: '8px' }}>{t.closeReason}</td>
                    <td style={{ padding: '8px' }}>{t.rr?.toFixed(2)}</td>
                    <td style={{ padding: '8px', color: (t.resultPct||0) >= 0 ? '#16e0b3' : '#f472b6' }}>{t.resultPct}%</td>
                    <td style={{ padding: '8px' }}>{t.closedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TradingSignalsBot;
