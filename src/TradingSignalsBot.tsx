import React, { useState } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import TradingViewWidget from './components/TradingViewWidget';
import ActiveTrade from './components/ActiveTrade';
import SignalsTable from './components/SignalsTable';
import { useSignalGeneration } from './hooks/useSignalGeneration';
import { tradingPairs, categories } from './data/tradingPairs';
import { Signal } from './types';

const TradingSignalsBot = () => {
  const [running, setRunning] = useState(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['EURUSD', 'BTCUSD', 'XAUUSD']);
  const [showSettings, setShowSettings] = useState(false);
  const [balance, setBalance] = useState<number>(1000);
  const [riskPct, setRiskPct] = useState<number>(1.0); // 1% por operación por defecto
  // Categorías deshabilitadas por solicitud: siempre 'All'
  const filterCategory = 'All';
  const [signalInterval, setSignalInterval] = useState(7000);
  const [maxSignals, setMaxSignals] = useState(8);

  const { signals, loading, error, clearSignals, batchMeta } = useSignalGeneration(
    running,
    selectedPairs,
    signalInterval,
    maxSignals,
    tradingPairs
  );

  const handleToggle = () => {
    if (running) {
      setRunning(false);
      setActiveTrade(null);
    } else {
      clearSignals();
      setActiveTrade(null);
      setRunning(true);
    }
  };

  const handleSetActive = (signal: Signal) => {
    setActiveTrade(signal);
  };

  const togglePairSelection = (symbol: string) => {
    setSelectedPairs(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filteredPairs = filterCategory === 'All' 
    ? tradingPairs 
    : tradingPairs.filter(p => p.category === filterCategory);

  const filteredSignals = signals.filter(s => 
    filterCategory === 'All' || 
    tradingPairs.find(p => p.symbol === s.pair)?.category === filterCategory
  );

  // Actualizar activeTrade cuando se genere la primera señal
  React.useEffect(() => {
    if (signals.length > 0) {
      // mantener visibleId si sigue existiendo; si no, usar la más reciente
      let current = visibleId && signals.find(s => s.id === visibleId);
      // Si no existe, intentar por preferencia de par
      if (!current) {
        const preferredPair = localStorage.getItem('preferred_pair');
        if (preferredPair) current = signals.find(s => s.pair === preferredPair) || null;
      }
      const chosen = current || signals[0];
      setActiveTrade(chosen);
      setVisibleId(chosen.id);
    } else {
      setActiveTrade(null);
      setVisibleId(null);
    }
  }, [signals]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181e2a 0%, #6d28d9 100%)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
      <Header
        running={running}
        showSettings={showSettings}
        onToggleBot={handleToggle}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <SettingsPanel
        showSettings={showSettings}
        selectedPairs={selectedPairs}
        togglePairSelection={togglePairSelection}
        signalInterval={signalInterval}
        setSignalInterval={setSignalInterval}
        maxSignals={maxSignals}
        setMaxSignals={setMaxSignals}
        filteredPairs={filteredPairs}
  balance={balance}
  setBalance={setBalance}
  riskPct={riskPct}
  setRiskPct={setRiskPct}
      />

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
        filteredSignals={filteredSignals.slice(0, 2)}
        filterCategory={'All'}
        setFilterCategory={() => {}}
        categories={['All']}
  onSetActive={(s) => { setActiveTrade(s); setVisibleId(s.id); try { localStorage.setItem('preferred_pair', s.pair); } catch {} }}
        batchMeta={batchMeta}
  activeSignalId={visibleId}
      />

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TradingSignalsBot;
