import React from 'react';
import { Signal } from '../../types';

interface TradingViewWidgetProps {
  activeTrade: Signal | null;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ activeTrade }) => {
  const getSymbol = () => {
  if (!activeTrade) return 'BINANCE:BTCUSDT';
    
  if (activeTrade.pair === 'BTCUSD') return 'BINANCE:BTCUSDT';
    if (activeTrade.pair === 'ETHUSD') return 'CRYPTO:ETHUSD';
    if (activeTrade.pair === 'XAUUSD') return 'OANDA:XAUUSD';
  return 'FX:' + activeTrade.pair;
  };

  // Cálculo simple para posicionar bandas (porcentajes relativos, no escala real del precio)
  const overlay = React.useMemo(() => {
    if (!activeTrade) return null;
    const { entry, tp, sl } = activeTrade;
    const min = Math.min(tp, sl, entry);
    const max = Math.max(tp, sl, entry);
    const range = max - min || 1;
    const pos = (v: number) => ((max - v) / range) * 100; // 0% arriba, 100% abajo
    return {
      entryPos: pos(entry),
      tpPos: pos(tp),
      slPos: pos(sl),
      rr: Math.abs(tp - entry) / Math.abs(entry - sl || 1)
    };
  }, [activeTrade]);

  return (
    <section style={{ flex: 1.2, minWidth: 380, background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 4px 32px #0002', overflow: 'hidden', padding: 0, position: 'relative' }}>
      <iframe
        title="TradingView"
        src={`https://es.tradingview.com/widgetembed/?frameElementId=tradingview_6T69ANL1&symbol=${getSymbol()}&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Europe/Madrid&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=es`}
        width="100%"
        height="420"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
      />
      {activeTrade && overlay && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Banda TP */}
          <div style={{ position: 'absolute', left: 8, right: 8, top: `${overlay.tpPos}%`, height: 0, borderTop: '2px dashed #16e0b3' }} />
          <div style={{ position: 'absolute', left: 12, top: `calc(${overlay.tpPos}% - 10px)`, color: '#16e0b3', fontSize: 12, fontWeight: 700 }}>TP {activeTrade.tp}</div>
          {/* Banda Entrada */}
          <div style={{ position: 'absolute', left: 8, right: 8, top: `${overlay.entryPos}%`, height: 0, borderTop: '2px solid #38bdf8' }} />
          <div style={{ position: 'absolute', left: 12, top: `calc(${overlay.entryPos}% - 10px)`, color: '#38bdf8', fontSize: 12, fontWeight: 700 }}>Entrada {activeTrade.entry}</div>
          {/* Banda SL */}
          <div style={{ position: 'absolute', left: 8, right: 8, top: `${overlay.slPos}%`, height: 0, borderTop: '2px dashed #f472b6' }} />
          <div style={{ position: 'absolute', left: 12, top: `calc(${overlay.slPos}% - 10px)`, color: '#f472b6', fontSize: 12, fontWeight: 700 }}>SL {activeTrade.sl}</div>
          {/* Chip RR */}
          <div style={{ position: 'absolute', right: 10, top: 10, background: 'rgba(0,0,0,0.45)', color: '#e0e7ff', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            RR {overlay.rr.toFixed(2)} • TP +2% • SL -1%
          </div>
        </div>
      )}
    </section>
  );
};

export default TradingViewWidget;
