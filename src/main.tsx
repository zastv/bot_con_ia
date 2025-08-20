import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

const tradingPairs = ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'];

type Signal = {
  id: number;
  pair: string;
  signal: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  tp: number;
  sl: number;
  timestamp: string;
  notes: string;
};

const TradingSignalsBot = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);

  // Generar señales aleatorias cada cierto tiempo
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)] || "";
      const isBuy = Math.random() > 0.5;
      // Generar valores de ejemplo para entrada, TP y SL
      let base = 0;
      switch (pair) {
        case 'XAUUSD': base = 1900 + Math.random() * 100; break;
        case 'EURUSD': base = 1.05 + Math.random() * 0.1; break;
        case 'GBPUSD': base = 1.25 + Math.random() * 0.1; break;
        case 'BTCUSD': base = 60000 + Math.random() * 5000; break;
        default: base = 1 + Math.random();
      }
      const entry = parseFloat(base.toFixed(pair === 'BTCUSD' ? 0 : pair === 'XAUUSD' ? 2 : 5));
      const tp = parseFloat((entry + (isBuy ? 0.002 : -0.002) * (pair === 'BTCUSD' ? 10000 : pair === 'XAUUSD' ? 10 : 1)).toFixed(pair === 'BTCUSD' ? 0 : pair === 'XAUUSD' ? 2 : 5));
      const sl = parseFloat((entry - (isBuy ? 0.001 : -0.001) * (pair === 'BTCUSD' ? 10000 : pair === 'XAUUSD' ? 10 : 1)).toFixed(pair === 'BTCUSD' ? 0 : pair === 'XAUUSD' ? 2 : 5));
      const confidence = Math.floor(60 + Math.random() * 40);
      const notes = confidence > 90 ? 'Alta probabilidad, seguir gestión de riesgo.' : confidence < 70 ? 'Señal débil, operar con precaución.' : 'Condiciones normales.';
      const signal: Signal = {
        id: Date.now(),
        pair,
        signal: isBuy ? 'BUY' : 'SELL',
        confidence,
        entry,
        tp,
        sl,
        timestamp: new Date().toLocaleString(),
        notes: confidence > 90 ? 'Alta probabilidad, seguir gestión de riesgo.' : confidence < 70 ? 'Señal débil, operar con precaución.' : 'Condiciones normales.',
      };
      setSignals(prev => [signal, ...prev.slice(0, 19)]);
      // Si no hay operación activa, la primera señal generada será la activa
      setActiveTrade(prev => prev || signal);
    }, 5000);
    return () => clearInterval(interval);
  }, [running]);

  // Botón para iniciar/parar
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

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #6d28d9 0%, #181e2a 100%)', padding: 0 }}>
      {/* Widget de TradingView dinámico según el par activo */}
      <div style={{ maxWidth: 1200, margin: '32px auto 0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 32px #0002' }}>
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
      </div>
      <div className="dashboard-header" style={{ background: 'rgba(30, 27, 75, 0.95)', borderRadius: 16, margin: '32px auto 0', maxWidth: 1200, padding: 32, boxShadow: '0 4px 32px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Brain style={{ width: 40, height: 40, color: '#a78bfa', marginRight: 12 }} />
          <div>
            <h1 className="dashboard-title" style={{ color: '#e0e7ff', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Bot de Señales</h1>
            <p style={{ color: '#a5b4fc', fontSize: '1.1rem', margin: 0 }}>Señales automáticas de trading con información de entrada, TP, SL y notas para operar mejor.</p>
          </div>
        </div>
      </div>

      {/* Panel de operación en curso */}
      <div style={{ marginTop: 32, maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Operación en curso</h2>
          <button
            onClick={handleToggle}
            style={{
              background: running ? '#f472b6' : '#22d3ee',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: running ? '0 2px 8px #f472b633' : '0 2px 8px #22d3ee33',
              transition: 'all 0.2s',
            }}
          >
            {running ? 'Parar' : 'Iniciar'}
          </button>
        </div>
        <div className="dashboard-card" style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18, marginBottom: 32, minHeight: 80 }}>
          {activeTrade ? (
            <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', fontSize: '1.05rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #38bdf8', color: '#38bdf8' }}>
                  <th style={{ padding: 8 }}>Par</th>
                  <th style={{ padding: 8 }}>Señal</th>
                  <th style={{ padding: 8 }}>Entrada</th>
                  <th style={{ padding: 8 }}>TP</th>
                  <th style={{ padding: 8 }}>SL</th>
                  <th style={{ padding: 8 }}>Confianza</th>
                  <th style={{ padding: 8 }}>Hora</th>
                  <th style={{ padding: 8 }}>Notas</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #334155', background: activeTrade.signal === 'BUY' ? 'rgba(34,211,238,0.04)' : 'rgba(244,114,182,0.04)' }}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{activeTrade.pair}</td>
                  <td style={{ padding: 8, color: activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 'bold', letterSpacing: 1 }}>{activeTrade.signal}</td>
                  <td style={{ padding: 8 }}>{activeTrade.entry}</td>
                  <td style={{ padding: 8 }}>{activeTrade.tp}</td>
                  <td style={{ padding: 8 }}>{activeTrade.sl}</td>
                  <td style={{ padding: 8 }}>{activeTrade.confidence}%</td>
                  <td style={{ padding: 8 }}>{activeTrade.timestamp}</td>
                  <td style={{ padding: 8, color: '#fbbf24' }}>{activeTrade.notes}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#64748b', fontSize: '1.05rem', textAlign: 'center', padding: 12 }}>
              {running ? 'Esperando nueva señal para operar...' : 'Pulsa "Iniciar" para simular una operación.'}
            </div>
          )}
        </div>
      </div>

      {/* Panel de señales */}
      <div style={{ marginTop: 8, maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ color: '#a78bfa', fontSize: '1.4rem', marginBottom: 20, fontWeight: 700 }}>Últimas señales</h2>
        <div className="dashboard-card" style={{ background: 'rgba(30, 27, 75, 0.95)', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 24 }}>
          <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', fontSize: '1.05rem' }}>
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
              </tr>
            </thead>
            <tbody>
              {signals.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #334155', background: s.signal === 'BUY' ? 'rgba(34,211,238,0.04)' : 'rgba(244,114,182,0.04)' }}>
                  <td style={{ padding: 10, fontWeight: 600 }}>{s.pair}</td>
                  <td style={{ padding: 10, color: s.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 'bold', letterSpacing: 1 }}>{s.signal}</td>
                  <td style={{ padding: 10 }}>{s.confidence}%</td>
                  <td style={{ padding: 10 }}>{s.entry}</td>
                  <td style={{ padding: 10 }}>{s.tp}</td>
                  <td style={{ padding: 10 }}>{s.sl}</td>
                  <td style={{ padding: 10 }}>{s.timestamp}</td>
                  <td style={{ padding: 10, color: '#fbbf24' }}>{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 18, textAlign: 'center' }}>
          <b>Tip:</b> Recuerda siempre usar gestión de riesgo y no operar solo por la señal. Considera el contexto del mercado y noticias relevantes.
        </div>
      </div>
    </div>
  );
};

export default TradingSignalsBot;
