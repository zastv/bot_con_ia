import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Copy, XCircle } from 'lucide-react';
import { Signal } from '../../types';

interface ActiveTradeProps {
  activeTrade: Signal | null;
  loading: boolean;
  error: string | null;
  running: boolean;
  balance?: number;
  riskPct?: number; // % de riesgo por operación
  onClose?: () => void; // cierre manual
}

const ActiveTrade: React.FC<ActiveTradeProps> = ({ activeTrade, loading, error, running, balance = 1000, riskPct = 1, onClose }) => {
  const rrInfo = React.useMemo(() => {
    if (!activeTrade) return null;
    const { entry, tp, sl } = activeTrade;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const rr = risk > 0 ? reward / risk : 0;
    const tpPct = ((tp - entry) / entry) * 100;
    const slPct = ((sl - entry) / entry) * 100;
    return {
      rr: Number.isFinite(rr) ? rr : 0,
      tpPct,
      slPct
    };
  }, [activeTrade]);
  const copyText = (text: string) => {
    try { navigator.clipboard.writeText(text); } catch {}
  };
  // Cálculo simple de cantidad/importe asumiendo que el riesgo se mide contra distancia a SL
  const sizing = React.useMemo(() => {
    if (!activeTrade) return null;
    const riskAmount = (balance * riskPct) / 100;
    const riskPerUnit = Math.abs(activeTrade.entry - activeTrade.sl);
    if (riskPerUnit <= 0) return { qty: 0, amount: 0 };
  let qtyRaw = riskAmount / riskPerUnit;
  // Redondeo por instrumento
  const pair = activeTrade.pair;
  const isCrypto = pair.startsWith('BTC') || pair.startsWith('ETH');
  const isMetal = pair.startsWith('XAU') || pair.startsWith('XAG');
  let step = 0.01; // forex por defecto
  let minQty = 0.01;
  if (isCrypto) { step = 0.001; minQty = 0.001; }
  if (isMetal) { step = 0.01; minQty = 0.01; }
  const roundStep = (v: number, st: number) => Math.floor(v / st) * st;
  const qty = Math.max(minQty, parseFloat(roundStep(qtyRaw, step).toFixed(String(step).split('.')[1]?.length || 0)));
  const amount = qty * activeTrade.entry;
  return { qty, amount };
  }, [activeTrade, balance, riskPct]);
  return (
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
          {rrInfo && (
            <div style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: 8 }}>
              RR: <b>{rrInfo.rr.toFixed(2)}</b> • TP <b style={{ color: '#16e0b3' }}>{rrInfo.tpPct >= 0 ? '+' : ''}{rrInfo.tpPct.toFixed(2)}%</b> • SL <b style={{ color: '#f472b6' }}>{rrInfo.slPct.toFixed(2)}%</b>
            </div>
          )}
          <div style={{ color: '#fbbf24', fontWeight: 500, marginBottom: 8 }}>{activeTrade.notes}</div>
          {sizing && (
            <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 8 }}>
              Cantidad estimada: <b>{sizing.qty.toFixed(3)}</b> • Importe aprox.: <b>${sizing.amount.toFixed(2)}</b> • Riesgo: <b>{riskPct}%</b>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button onClick={() => copyText(String(activeTrade.entry))} title="Copiar entrada" style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <Copy size={14}/> Entrada
            </button>
            <button onClick={() => copyText(String(activeTrade.tp))} title="Copiar TP" style={{ background: '#065f46', color: '#d1fae5', border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <Copy size={14}/> TP
            </button>
            <button onClick={() => copyText(String(activeTrade.sl))} title="Copiar SL" style={{ background: '#7f1d1d', color: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <Copy size={14}/> SL
            </button>
            <button onClick={() => copyText(`${activeTrade.display} ${activeTrade.signal}\nEntrada: ${activeTrade.entry}\nTP: ${activeTrade.tp}\nSL: ${activeTrade.sl}`)} title="Copiar todo" style={{ background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <Copy size={14}/> Copiar todo
            </button>
            {onClose && (
              <button onClick={onClose} title="Cerrar operación" style={{ background: '#991b1b', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginLeft: 'auto' }}>
                <XCircle size={14}/> Cerrar operación
              </button>
            )}
          </div>
          <div style={{ color: '#a5b4fc', fontSize: '0.98rem' }}>Confianza: <b>{activeTrade.confidence}%</b></div>
          <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>{activeTrade.timestamp}</div>
        </div>
      ) : (
        <div style={{ color: '#64748b', fontSize: '1.05rem', textAlign: 'center', padding: 12 }}>
          {running ? 'Esperando nueva señal para operar...' : 'Pulsa "Iniciar" para comenzar.'}
        </div>
      )}
      {loading && (
        <div style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <RefreshCw className="spin" size={18} /> Obteniendo precio real...
        </div>
      )}
      {error && (
        <div style={{ color: '#f472b6', marginTop: 8 }}>{error}</div>
      )}
    </section>
  );
};

export default ActiveTrade;
