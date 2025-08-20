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
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['EURUSD', 'BTCUSD', 'XAUUSD']);
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [signalInterval, setSignalInterval] = useState(7000);
  const [maxSignals, setMaxSignals] = useState(8);

  const { signals, loading, error, clearSignals } = useSignalGeneration(
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
    if (signals.length > 0 && !activeTrade) {
      setActiveTrade(signals[0]);
    }
  }, [signals, activeTrade]);

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
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        selectedPairs={selectedPairs}
        togglePairSelection={togglePairSelection}
        signalInterval={signalInterval}
        setSignalInterval={setSignalInterval}
        maxSignals={maxSignals}
        setMaxSignals={setMaxSignals}
        categories={categories}
        filteredPairs={filteredPairs}
      />

      {/* Panel de operación en curso y gráfico */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
        <TradingViewWidget activeTrade={activeTrade} />
        <ActiveTrade 
          activeTrade={activeTrade}
          loading={loading}
          error={error}
          running={running}
        />
      </main>

      <SignalsTable
        filteredSignals={filteredSignals}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        onSetActive={handleSetActive}
      />

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TradingSignalsBot;
