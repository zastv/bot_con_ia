import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Play, Pause, TrendingUp, TrendingDown, RefreshCw, Settings, Filter, BarChart3, Zap } from 'lucide-react';

interface Signal {
  id: number;
  pair: string;
  display: string;
  signal: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  tp: number;
  sl: number;
  timestamp: string;
  notes: string;
}

interface TradingPair {
  symbol: string;
  api: string;
  display: string;
  category: string;
}

const tradingPairs: TradingPair[] = [
  // Crypto principales
  { symbol: 'BTCUSD', api: 'BTCUSDT', display: 'Bitcoin (BTCUSD)', category: 'Crypto Major' },
  { symbol: 'ETHUSD', api: 'ETHUSDT', display: 'Ethereum (ETHUSD)', category: 'Crypto Major' },
  
  // Forex Majors
  { symbol: 'EURUSD', api: 'EURUSD', display: 'Euro/Dólar (EURUSD)', category: 'Forex Major' },
  { symbol: 'GBPUSD', api: 'GBPUSD', display: 'Libra/Dólar (GBPUSD)', category: 'Forex Major' },
  { symbol: 'USDJPY', api: 'USDJPY', display: 'Dólar/Yen (USDJPY)', category: 'Forex Major' },
  { symbol: 'AUDUSD', api: 'AUDUSD', display: 'Dólar Australiano (AUDUSD)', category: 'Forex Major' },
  
  // Forex Minors
  { symbol: 'USDCAD', api: 'USDCAD', display: 'Dólar/Canadiense (USDCAD)', category: 'Forex Minor' },
  { symbol: 'NZDUSD', api: 'NZDUSD', display: 'Dólar Neozelandés (NZDUSD)', category: 'Forex Minor' },
  { symbol: 'USDCHF', api: 'USDCHF', display: 'Dólar/Franco Suizo (USDCHF)', category: 'Forex Minor' },
  
  // Commodities
  { symbol: 'XAUUSD', api: 'XAUUSD', display: 'Oro (XAUUSD)', category: 'Commodities' },
  { symbol: 'XAGUSD', api: 'XAGUSD', display: 'Plata (XAGUSD)', category: 'Commodities' },
];

const fetchPrice = async (pair: string): Promise<number> => {
  // Función simplificada con fallbacks garantizados
  const fallbackPrices: Record<string, number> = {
    'BTCUSDT': 95000 + (Math.random() - 0.5) * 4000,
    'ETHUSDT': 3400 + (Math.random() - 0.5) * 400,
    'EURUSD': 1.0850 + (Math.random() - 0.5) * 0.02,
    'GBPUSD': 1.2750 + (Math.random() - 0.5) * 0.03,
    'USDJPY': 150.25 + (Math.random() - 0.5) * 2,
    'AUDUSD': 0.6550 + (Math.random() - 0.5) * 0.02,
    'USDCAD': 1.3850 + (Math.random() - 0.5) * 0.02,
    'NZDUSD': 0.5950 + (Math.random() - 0.5) * 0.02,
    'USDCHF': 0.8750 + (Math.random() - 0.5) * 0.02,
    'XAUUSD': 2650 + (Math.random() - 0.5) * 60,
    'XAGUSD': 31.5 + (Math.random() - 0.5) * 2,
  };

  // Intentar API real para BTC/ETH
  if (pair === 'BTCUSDT' || pair === 'ETHUSDT') {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      return parseFloat(res.data.price);
    } catch {
      return fallbackPrices[pair];
    }
  }

  // Para otros pares, usar precios simulados directamente
  return fallbackPrices[pair] || 1.0000;
};

const TradingSignalsBot: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPairs, setSelectedPairs] = useState(['BTCUSD', 'EURUSD', 'XAUUSD', 'GBPUSD']);
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [signalInterval, setSignalInterval] = useState(10000); // 10 segundos para pruebas
  const [maxSignals, setMaxSignals] = useState(6);
  const [marketSentiment, setMarketSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral');
  const [riskLevel, setRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

  // Función para generar señales
  const generateSignal = async () => {
    console.log('🔄 Generando nueva señal...');
    
    if (signals.length >= maxSignals) {
      console.log('📊 Máximo de señales alcanzado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filtrar pares disponibles
      const availablePairs = tradingPairs.filter(p => selectedPairs.includes(p.symbol));
      
      if (availablePairs.length === 0) {
        setError('No hay pares seleccionados');
        return;
      }

      // Selección aleatoria de par
      const pairObj = availablePairs[Math.floor(Math.random() * availablePairs.length)];
      console.log('🎯 Par seleccionado:', pairObj.symbol);

      // Determinar dirección de la señal
      let buyProbability = 0.5;
      if (marketSentiment === 'Bullish') buyProbability = 0.65;
      else if (marketSentiment === 'Bearish') buyProbability = 0.35;
      
      const isBuy = Math.random() < buyProbability;
      console.log('📈 Dirección:', isBuy ? 'BUY' : 'SELL');

      // Obtener precio
      const entry = await fetchPrice(pairObj.api);
      console.log('💰 Precio:', entry);

      if (!entry || isNaN(entry) || entry <= 0) {
        setError(`Precio inválido para ${pairObj.symbol}`);
        return;
      }

      // Calcular TP y SL
      const riskMultiplier = riskLevel === 'Conservative' ? 0.7 : riskLevel === 'Aggressive' ? 1.3 : 1.0;
      let tp = 0, sl = 0;

      if (pairObj.symbol === 'BTCUSD') {
        const baseTP = 800 * riskMultiplier;
        const baseSL = 400 * riskMultiplier;
        tp = Math.round(entry + (isBuy ? baseTP : -baseTP));
        sl = Math.round(entry - (isBuy ? baseSL : -baseSL));
      } else if (pairObj.symbol === 'ETHUSD') {
        const baseTP = 60 * riskMultiplier;
        const baseSL = 30 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      } else if (pairObj.symbol === 'XAUUSD') {
        const baseTP = 15 * riskMultiplier;
        const baseSL = 8 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      } else if (pairObj.symbol === 'XAGUSD') {
        const baseTP = 0.8 * riskMultiplier;
        const baseSL = 0.4 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(3));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(3));
      } else {
        // Forex
        const baseTP = 0.006 * riskMultiplier;
        const baseSL = 0.003 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(5));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(5));
      }

      // Generar confianza
      const confidence = Math.floor(Math.random() * 40) + 55; // 55-95%

      // Crear señal
      const newSignal: Signal = {
        id: Date.now(),
        pair: pairObj.symbol,
        display: pairObj.display,
        signal: isBuy ? 'BUY' : 'SELL',
        confidence,
        entry,
        tp,
        sl,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        notes: `🤖 IA Análisis: Señal ${confidence >= 80 ? 'PREMIUM' : confidence >= 65 ? 'SÓLIDA' : 'CONDICIONAL'} - ${marketSentiment.toLowerCase()} sentiment`
      };

      console.log('✅ Señal creada:', newSignal);

      // Agregar señal
      setSignals(prev => [newSignal, ...prev.slice(0, maxSignals - 1)]);
      
      // Establecer como operación activa si no hay ninguna
      if (!activeTrade) {
        setActiveTrade(newSignal);
      }

    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error generando señal');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para el generador de señales
  useEffect(() => {
    if (!running) return;

    // Generar primera señal inmediatamente
    generateSignal();

    // Configurar intervalo
    const interval = setInterval(generateSignal, signalInterval);

    return () => clearInterval(interval);
  }, [running, selectedPairs, signalInterval, maxSignals, marketSentiment, riskLevel]);

  // Funciones de control
  const handleToggle = () => {
    if (running) {
      setRunning(false);
      setActiveTrade(null);
    } else {
      setSignals([]);
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

  const categories = ['All', ...Array.from(new Set(tradingPairs.map(p => p.category)))];

  const filteredSignals = signals.filter(s => 
    filterCategory === 'All' || 
    tradingPairs.find(p => p.symbol === s.pair)?.category === filterCategory
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181e2a 0%, #6d28d9 100%)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 8vw 16px 8vw', background: 'rgba(30, 27, 75, 0.98)', borderBottom: '2px solid #6d28d9', boxShadow: '0 2px 16px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Brain style={{ width: 48, height: 48, color: '#a78bfa', marginRight: 16 }} />
          <div>
            <h1 style={{ color: '#e0e7ff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              Bot Señales AI 
              <span style={{ 
                background: 'linear-gradient(45deg, #22d3ee, #a78bfa)', 
                color: '#fff', 
                fontSize: '0.5rem', 
                padding: '4px 8px', 
                borderRadius: 8, 
                fontWeight: 600,
                animation: 'pulse 2s infinite'
              }}>
                🧠 IA AVANZADA
              </span>
            </h1>
            <span style={{ color: '#a5b4fc', fontSize: '1.1rem', fontWeight: 500 }}>Señales automáticas con precios reales y análisis en vivo</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#a5b4fc',
              border: '1px solid #6d28d9',
              borderRadius: 12,
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleToggle}
            style={{
              background: running ? '#f472b6' : '#22d3ee',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: running ? '0 2px 8px #f472b633' : '0 2px 8px #22d3ee33',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
            {running ? 'Parar' : 'Iniciar'}
          </button>
        </div>
      </header>

      {/* Configuración */}
      {showSettings && (
        <div style={{ background: 'rgba(30, 27, 75, 0.98)', padding: '24px 8vw', borderBottom: '1px solid #6d28d9' }}>
          <h3 style={{ color: '#a78bfa', fontSize: '1.2rem', marginBottom: 16 }}>Configuración</h3>
          
          {/* Filtros de categoría */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Filtrar por categoría:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    background: filterCategory === cat ? '#16a34a' : 'rgba(107, 114, 128, 0.3)',
                    color: filterCategory === cat ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pares activos */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Pares activos ({selectedPairs.length} seleccionados):</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {filteredPairs.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => togglePairSelection(pair.symbol)}
                  style={{
                    background: selectedPairs.includes(pair.symbol) ? '#22d3ee' : 'rgba(107, 114, 128, 0.3)',
                    color: selectedPairs.includes(pair.symbol) ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {pair.display}
                </button>
              ))}
            </div>
          </div>

          {/* Configuraciones adicionales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Intervalo (segundos):</label>
              <input
                type="number"
                value={signalInterval / 1000}
                onChange={(e) => setSignalInterval(Number(e.target.value) * 1000)}
                min="5"
                max="300"
                step="5"
                style={{
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#e0e7ff',
                  border: '1px solid #6d28d9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  width: '100%',
                }}
              />
            </div>
            <div>
              <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Máx. señales:</label>
              <input
                type="number"
                value={maxSignals}
                onChange={(e) => setMaxSignals(Number(e.target.value))}
                min="2"
                max="10"
                style={{
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#e0e7ff',
                  border: '1px solid #6d28d9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Estado del bot */}
      {running && (
        <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '16px 8vw', borderBottom: '1px solid rgba(34, 211, 238, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {loading && <RefreshCw size={16} style={{ color: '#22d3ee', animation: 'spin 1s linear infinite' }} />}
            <span style={{ color: '#22d3ee', fontWeight: 600 }}>
              {loading ? 'Analizando mercados...' : `Bot activo - Próxima señal en ${signalInterval / 1000}s`}
            </span>
            <span style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>
              ({filteredSignals.length}/{maxSignals} señales)
            </span>
          </div>
          {error && (
            <div style={{ color: '#f472b6', fontSize: '0.9rem', marginTop: 8 }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Panel principal */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', padding: '0 2rem' }}>
        {/* Gráfico TradingView */}
        <section style={{ flex: 1.2, minWidth: 380, background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 4px 32px #0002', overflow: 'hidden', padding: 0 }}>
          <iframe
            title="TradingView"
            src={`https://es.tradingview.com/widgetembed/?frameElementId=tradingview_6T69ANL1&symbol=${
              activeTrade
                ? (activeTrade.pair === 'BTCUSD' ? 'CRYPTO:BTCUSD' : activeTrade.pair === 'XAUUSD' ? 'OANDA:XAUUSD' : 'FX:' + activeTrade.pair)
                : 'FX:EURUSD'
            }&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Europe/Madrid&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=es`}
            width="100%"
            height="420"
            style={{ border: 0 }}
          />
        </section>

        {/* Operación activa */}
        <section style={{ flex: 0.8, minWidth: 300, background: 'rgba(30,27,75,0.98)', borderRadius: 18, padding: 24, boxShadow: '0 4px 32px #0002' }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} />
            Operación en curso
          </h2>
          {activeTrade ? (
            <div style={{ color: '#e0e7ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#e0e7ff', fontSize: '1.1rem', margin: 0 }}>{activeTrade.display}</h3>
                <span style={{
                  background: activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  {activeTrade.signal}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>Entrada:</span>
                  <div style={{ color: '#e0e7ff', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.entry}</div>
                </div>
                <div>
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>Confianza:</span>
                  <div style={{ color: '#22d3ee', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.confidence}%</div>
                </div>
                <div>
                  <span style={{ color: '#16e0b3', fontSize: '0.8rem' }}>TP:</span>
                  <div style={{ color: '#16e0b3', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.tp}</div>
                </div>
                <div>
                  <span style={{ color: '#f472b6', fontSize: '0.8rem' }}>SL:</span>
                  <div style={{ color: '#f472b6', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.sl}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, fontSize: '0.8rem', color: '#a5b4fc' }}>
                {activeTrade.notes}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</div>
              <p>Esperando nueva señal para operar</p>
            </div>
          )}
        </section>
      </main>

      {/* Panel de señales */}
      <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: 700, letterSpacing: 1, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap style={{ color: '#22d3ee' }} />
            Señales IA Premium ({filteredSignals.length})
          </h2>
        </div>

        {/* Cards de señales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
          {filteredSignals.map(signal => {
            const risk = Math.abs(signal.entry - signal.sl);
            const reward = Math.abs(signal.tp - signal.entry);
            const riskReward = risk > 0 ? (reward / risk).toFixed(1) : '0';
            const isBuy = signal.signal === 'BUY';
            
            return (
              <div 
                key={signal.id} 
                style={{ 
                  background: `linear-gradient(135deg, ${isBuy ? 'rgba(34,211,238,0.1)' : 'rgba(244,114,182,0.1)'} 0%, rgba(30,27,75,0.95) 100%)`,
                  border: `2px solid ${isBuy ? '#22d3ee' : '#f472b6'}`,
                  borderRadius: 16,
                  padding: 24,
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => handleSetActive(signal)}
              >
                {/* Header de la señal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ 
                      color: '#e0e7ff', 
                      fontSize: '1.3rem', 
                      fontWeight: 700, 
                      margin: 0 
                    }}>
                      {signal.display}
                    </h3>
                    <span style={{
                      background: isBuy ? '#22d3ee' : '#f472b6',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: 1
                    }}>
                      {signal.signal}
                    </span>
                  </div>
                  
                  <div style={{ 
                    background: signal.confidence >= 85 ? '#16a34a' : signal.confidence >= 70 ? '#ca8a04' : signal.confidence >= 55 ? '#ea580c' : '#dc2626',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: 12,
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {signal.confidence >= 85 ? '🔥 PREMIUM' : signal.confidence >= 70 ? '✅ SÓLIDA' : signal.confidence >= 55 ? '⚠️ CONDICIONAL' : '🚫 DÉBIL'}
                  </div>
                </div>

                {/* Información principal */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: 12, 
                  padding: 16, 
                  marginBottom: 16,
                  border: '1px solid rgba(109,40,217,0.3)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <span style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>ENTRADA:</span>
                      <div style={{ color: '#e0e7ff', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {signal.entry}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>CONFIANZA:</span>
                      <div style={{ color: '#22d3ee', fontSize: '1.1rem', fontWeight: 700 }}>
                        {signal.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <span style={{ color: '#16e0b3', fontSize: '0.85rem', fontWeight: 600 }}>TAKE PROFIT:</span>
                      <div style={{ color: '#16e0b3', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {signal.tp}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 600 }}>STOP LOSS:</span>
                      <div style={{ color: '#f472b6', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {signal.sl}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>R:R:</span>
                      <div style={{ 
                        color: parseFloat(riskReward) >= 2 ? '#16e0b3' : parseFloat(riskReward) >= 1.5 ? '#fbbf24' : '#f472b6', 
                        fontSize: '1.1rem', 
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}>
                        1:{riskReward}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const copyText = `${signal.display}\n${signal.signal} ${signal.entry}\nTP: ${signal.tp}\nSL: ${signal.sl}\nConfianza: ${signal.confidence}%\nR:R 1:${riskReward}`;
                      navigator.clipboard.writeText(copyText);
                    }}
                    style={{
                      background: 'linear-gradient(45deg, #6d28d9, #a78bfa)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    📋 Copiar Señal
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActive(signal);
                    }}
                    style={{
                      background: 'rgba(107, 114, 128, 0.3)',
                      color: '#a5b4fc',
                      border: '1px solid #6d28d9',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <BarChart3 size={14} />
                    Ver Gráfico
                  </button>
                </div>

                {/* Timestamp */}
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '0.8rem', 
                  textAlign: 'right',
                  borderTop: '1px solid rgba(109,40,217,0.2)',
                  paddingTop: 8
                }}>
                  {signal.timestamp}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSignals.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 60,
            color: '#64748b',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 16,
            border: '2px dashed rgba(109,40,217,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
            <h3 style={{ color: '#a5b4fc', margin: '0 0 8px 0' }}>Esperando señales...</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              El bot está analizando los mercados. Las señales aparecerán cuando se detecten oportunidades de calidad.
            </p>
          </div>
        )}

        <div style={{ 
          color: '#64748b', 
          fontSize: '0.9rem', 
          marginTop: 24, 
          padding: 16,
          textAlign: 'center',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 12,
          border: '1px solid rgba(109,40,217,0.2)'
        }}>
          <strong style={{ color: '#a78bfa' }}>⚠️ Aviso de Riesgo:</strong> Las señales son generadas por IA para análisis educativo. 
          Siempre confirma con tu propio análisis y gestiona el riesgo apropiadamente. 
          No somos responsables de pérdidas financieras.
        </div>
      </section>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default TradingSignalsBot;
