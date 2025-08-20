import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Signal } from '../../types';

interface ActiveTradeProps {
  activeTrade: Signal | null;
  loading: boolean;
  error: string | null;
  running: boolean;
}

const ActiveTrade: React.FC<ActiveTradeProps> = ({ activeTrade, loading, error, running }) => {
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
