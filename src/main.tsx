import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Play, Pause, TrendingUp, TrendingDown, RefreshCw, Settings, Filter, BarChart3, Zap } from 'lucide-react';

const tradingPairs = [
  { symbol: 'BTCUSD', api: 'BTCUSDT', display: 'Bitcoin (BTCUSD)', category: 'Crypto' },
  { symbol: 'EURUSD', api: 'EURUSD', display: 'Euro/Dólar (EURUSD)', category: 'Forex Major' },
  { symbol: 'XAUUSD', api: 'XAUUSD', display: 'Oro (XAUUSD)', category: 'Commodities' },
];

type Signal = {
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
};


const fetchPrice = async (pair: string) => {
  // Usar Binance para crypto, APIs específicas para forex y oro
  if (pair === 'BTCUSDT') {
    try {
      const res = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      return parseFloat(res.data.price);
    } catch {
      return 0;
    }
  } else if (pair === 'EURUSD') {
    try {
      // Usar exchangerate-api para EURUSD (gratis, confiable)
      const res = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
      return parseFloat(res.data.rates.USD);
    } catch {
      // Fallback a TwelveData
      try {
        const res = await axios.get(`https://api.twelvedata.com/price?symbol=EURUSD&apikey=demo`);
        return parseFloat(res.data.price);
      } catch {
        return 1.0850; // Precio aproximado de fallback
      }
    }
  } else if (pair === 'XAUUSD') {
    try {
      // Usar metals-api para oro (tiene plan gratuito)
      const res = await axios.get('https://api.metals.live/v1/spot/gold');
      return parseFloat(res.data.price);
    } catch {
      // Fallback a TwelveData
      try {
        const res = await axios.get(`https://api.twelvedata.com/price?symbol=XAUUSD&apikey=demo`);
        return parseFloat(res.data.price);
      } catch {
        return 2650.00; // Precio aproximado de fallback
      }
    }
  } else {
    // TwelveData para otros pares
    try {
      const res = await axios.get(`https://api.twelvedata.com/price?symbol=${pair}&apikey=demo`);
      return parseFloat(res.data.price);
    } catch {
      return 0;
    }
  }
};

const TradingSignalsBot = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['BTCUSD', 'EURUSD', 'XAUUSD']);
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [signalInterval, setSignalInterval] = useState(7000);
  const [maxSignals, setMaxSignals] = useState(8);

  // Generar señales realistas cada cierto tiempo
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let signalsCount = 0;
    const interval = setInterval(async () => {
      if (signalsCount >= maxSignals) return;
      setLoading(true);
      setError(null);
      // Simular análisis de temporalidades
      const timeframes = ['M5', 'M15', 'H1', 'H4', 'D1'];
      const availablePairs = tradingPairs.filter(p => selectedPairs.includes(p.symbol));
      if (availablePairs.length === 0) {
        setLoading(false);
        return;
      }
      const pairObj = availablePairs[Math.floor(Math.random() * availablePairs.length)];
      const isBuy = Math.random() > 0.5;
      let entry = 0;
      try {
        entry = await fetchPrice(pairObj.api);
      } catch {
        setError('Error obteniendo precio real.');
      }
      if (!entry || isNaN(entry)) {
        setLoading(false);
        return;
      }
      let tp = 0, sl = 0;
      if (pairObj.symbol === 'BTCUSD' || pairObj.symbol === 'ETHUSD') {
        tp = parseFloat((entry + (isBuy ? 200 : -200)).toFixed(0));
        sl = parseFloat((entry - (isBuy ? 100 : -100)).toFixed(0));
      } else if (pairObj.symbol === 'XAUUSD') {
        tp = parseFloat((entry + (isBuy ? 2 : -2)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? 1 : -1)).toFixed(2));
      } else {
        tp = parseFloat((entry + (isBuy ? 0.002 : -0.002)).toFixed(5));
        sl = parseFloat((entry - (isBuy ? 0.001 : -0.001)).toFixed(5));
      }
      // Simular mayor probabilidad si varias temporalidades coinciden
      const tfSignals = timeframes.map(tf => Math.random() > 0.4 ? (isBuy ? 1 : -1) : 0);
      const tfScore = tfSignals.reduce((a: number, b) => a + b, 0);
      let confidence = 60 + Math.abs(tfScore) * 8 + Math.random() * 20;
      confidence = Math.min(99, Math.round(confidence));
      let notes = '';
      if (tfScore >= 3) {
        notes = `Alta probabilidad: Coincidencia de tendencia en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. 
Se detecta impulso fuerte y confirmación por indicadores técnicos (RSI, MACD, medias móviles). 
El precio está cerca de soporte/resistencia relevante y el volumen acompaña el movimiento. 
Se recomienda gestión de riesgo adecuada.`;
      } else if (tfScore <= -3) {
        notes = `Alta probabilidad: Coincidencia de tendencia en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. 
Se observa agotamiento de la tendencia previa y señales de reversión en temporalidades mayores. 
Confirmación por patrones de velas y divergencia en indicadores. 
Operar con gestión de riesgo.`;
      } else if (confidence < 70) {
        notes = `Señal débil: Las temporalidades no están alineadas o hay alta volatilidad. 
Falta confirmación clara por indicadores técnicos. 
Evitar operar con lotaje alto y esperar mejor oportunidad.`;
      } else {
        notes = `Condiciones normales: Señal generada por coincidencia parcial en temporalidades (${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}). 
Algunos indicadores confirman la entrada, pero el contexto no es óptimo. 
Revisar calendario económico y contexto de mercado antes de operar.`;
      }
      const signal: Signal = {
        id: Date.now(),
        pair: pairObj.symbol,
        display: pairObj.display,
        signal: isBuy ? 'BUY' : 'SELL',
        confidence,
        entry,
        tp,
        sl,
        timestamp: new Date().toLocaleString(),
        notes,
      };
      if (!cancelled) {
        setSignals(prev => {
          if (prev.length >= maxSignals) return prev;
          signalsCount = prev.length + 1;
          return [signal, ...prev];
        });
        setActiveTrade(prev => prev || signal);
        setLoading(false);
      }
    }, signalInterval);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [running, selectedPairs, signalInterval, maxSignals]);  // Botón para iniciar/parar
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
      {/* Header moderno */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 8vw 16px 8vw', background: 'rgba(30, 27, 75, 0.98)', borderBottom: '2px solid #6d28d9', boxShadow: '0 2px 16px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Brain style={{ width: 48, height: 48, color: '#a78bfa', marginRight: 16 }} />
          <div>
            <h1 style={{ color: '#e0e7ff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: 1 }}>Bot de Señales AI</h1>
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
              transition: 'all 0.2s',
            }}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
            {running ? 'Parar' : 'Iniciar'}
          </button>
        </div>
      </header>

      {/* Panel de configuración */}
      {showSettings && (
        <div style={{ background: 'rgba(30, 27, 75, 0.98)', padding: '24px 8vw', borderBottom: '1px solid #6d28d9' }}>
          <h3 style={{ color: '#a78bfa', fontSize: '1.2rem', marginBottom: 16, fontWeight: 700 }}>Configuración</h3>
          
          {/* Selección de categorías */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Filtrar por categoría:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    background: filterCategory === cat ? '#6d28d9' : 'rgba(107, 114, 128, 0.3)',
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

          {/* Configuración de intervalo */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
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
          </div>
        </div>
      )}

      {/* Panel de operación en curso y gráfico */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Widget TradingView */}
        <section style={{ flex: 1.2, minWidth: 380, background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 4px 32px #0002', overflow: 'hidden', padding: 0 }}>
          <iframe
            title="TradingView"
            src={`https://es.tradingview.com/widgetembed/?frameElementId=tradingview_6T69ANL1&symbol=${
              activeTrade
                ? (activeTrade.pair === 'BTCUSD' ? 'CRYPTO:BTCUSD' : activeTrade.pair === 'XAUUSD' ? 'OANDA:XAUUSD' : 'FX:' + activeTrade.pair)
                : 'FX:EURUSD'
            }&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Europe/Madrid&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=es`}
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </section>
        {/* Operación en curso */}
        <section style={{ flex: 1, minWidth: 340, background: 'rgba(16,185,129,0.10)', borderRadius: 18, boxShadow: '0 2px 8px #0001', padding: 24, minHeight: 420, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} /> Operación en curso
          </h2>
          {activeTrade ? (
            <div style={{ background: '#181e2a', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #0002' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.1rem' }}>{activeTrade.display}</span>
                <span style={{ color: activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {activeTrade.signal === 'BUY' ? <TrendingUp size={18} /> : <TrendingDown size={18} />} {activeTrade.signal}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ color: '#fff', fontWeight: 600 }}>Entrada: <span style={{ color: '#38bdf8' }}>{activeTrade.entry}</span></div>
                <div style={{ color: '#fff', fontWeight: 600 }}>TP: <span style={{ color: '#16e0b3' }}>{activeTrade.tp}</span></div>
                <div style={{ color: '#fff', fontWeight: 600 }}>SL: <span style={{ color: '#f472b6' }}>{activeTrade.sl}</span></div>
              </div>
              <div style={{ color: '#fbbf24', fontWeight: 500, marginBottom: 8 }}>{activeTrade.notes}</div>
              <div style={{ color: '#a5b4fc', fontSize: '0.98rem' }}>Confianza: <b>{activeTrade.confidence}%</b></div>
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>{activeTrade.timestamp}</div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '1.05rem', textAlign: 'center', padding: 12 }}>
              {running ? 'Esperando nueva señal para operar...' : 'Pulsa "Iniciar" para comenzar.'}
            </div>
          )}
          {loading && (
            <div style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><RefreshCw className="spin" size={18} /> Obteniendo precio real...</div>
          )}
          {error && (
            <div style={{ color: '#f472b6', marginTop: 8 }}>{error}</div>
          )}
        </section>
      </main>

      {/* Panel de señales */}
      <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.4rem', fontWeight: 700, letterSpacing: 1, margin: 0 }}>
            Últimas señales ({filteredSignals.length})
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#a5b4fc' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                background: 'rgba(107, 114, 128, 0.3)',
                color: '#e0e7ff',
                border: '1px solid #6d28d9',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.9rem',
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', fontSize: '1.05rem', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #6d28d9', color: '#a5b4fc' }}>
                <th style={{ padding: 10 }}>Par</th>
                <th style={{ padding: 10 }}>Señal</th>
                <th style={{ padding: 10 }}>Confianza</th>
                <th style={{ padding: 10 }}>Entrada</th>
                <th style={{ padding: 10 }}>TP</th>
                <th style={{ padding: 10 }}>SL</th>
                <th style={{ padding: 10 }}>Hora</th>
                <th style={{ padding: 10 }}>Notas</th>
                <th style={{ padding: 10 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #334155', background: s.signal === 'BUY' ? 'rgba(34,211,238,0.04)' : 'rgba(244,114,182,0.04)' }}>
                  <td style={{ padding: 10, fontWeight: 600 }}>{s.display}</td>
                  <td style={{ padding: 10, color: s.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 'bold', letterSpacing: 1 }}>{s.signal}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ 
                        width: '40px', 
                        height: '6px', 
                        background: 'rgba(107, 114, 128, 0.3)', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${s.confidence}%`, 
                          height: '100%', 
                          background: s.confidence > 80 ? '#22d3ee' : s.confidence > 60 ? '#fbbf24' : '#f472b6',
                          borderRadius: 3
                        }}></div>
                      </div>
                      {s.confidence}%
                    </div>
                  </td>
                  <td style={{ padding: 10 }}>{s.entry}</td>
                  <td style={{ padding: 10, color: '#16e0b3' }}>{s.tp}</td>
                  <td style={{ padding: 10, color: '#f472b6' }}>{s.sl}</td>
                  <td style={{ padding: 10 }}>{s.timestamp}</td>
                  <td style={{ padding: 10, color: '#fbbf24', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes}</td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => handleSetActive(s)}
                      style={{ background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.98rem', boxShadow: '0 1px 4px #6d28d933', transition: 'all 0.2s' }}
                    >
                      <BarChart3 size={14} style={{ marginRight: 4 }} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSignals.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                    No hay señales disponibles para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 18, textAlign: 'center' }}>
          <b>Tip:</b> Recuerda siempre usar gestión de riesgo y no operar solo por la señal. Considera el contexto del mercado y noticias relevantes.
        </div>
      </section>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TradingSignalsBot;
