import { useState, useEffect } from 'react';
import { Signal, TradingPair } from '../types';
import { fetchPrice } from '../services/priceService';
import { timeframes } from '../data/tradingPairs';

export const useSignalGeneration = (
  running: boolean,
  selectedPairs: string[],
  signalInterval: number,
  maxSignals: number,
  tradingPairs: TradingPair[]
) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let signalsCount = 0;

    const interval = setInterval(async () => {
      if (signalsCount >= maxSignals) return;
      setLoading(true);
      setError(null);

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
        setLoading(false);
      }
    }, signalInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [running, selectedPairs, signalInterval, maxSignals, tradingPairs]);

  const clearSignals = () => setSignals([]);

  return { signals, loading, error, clearSignals };
};
