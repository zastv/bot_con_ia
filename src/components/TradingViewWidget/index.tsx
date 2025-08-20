import React from 'react';
import { Signal } from '../../types';

interface TradingViewWidgetProps {
  activeTrade: Signal | null;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ activeTrade }) => {
  const getSymbol = () => {
    if (!activeTrade) return 'FX:EURUSD';
    
    if (activeTrade.pair === 'BTCUSD') return 'CRYPTO:BTCUSD';
    if (activeTrade.pair === 'ETHUSD') return 'CRYPTO:ETHUSD';
    if (activeTrade.pair === 'XAUUSD') return 'OANDA:XAUUSD';
    return 'FX:' + activeTrade.pair;
  };

  return (
    <section style={{ flex: 1.2, minWidth: 380, background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 4px 32px #0002', overflow: 'hidden', padding: 0 }}>
      <iframe
        title="TradingView"
        src={`https://es.tradingview.com/widgetembed/?frameElementId=tradingview_6T69ANL1&symbol=${getSymbol()}&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Europe/Madrid&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=es`}
        width="100%"
        height="420"
        style={{ border: 0 }}
        allowFullScreen
      />
    </section>
  );
};

export default TradingViewWidget;
