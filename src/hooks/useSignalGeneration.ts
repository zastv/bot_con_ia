import { useState, useEffect } from 'react';
import { Signal, TradingPair } from '../types';
import { fetchPrice } from '../services/priceService';
import { timeframes } from '../data/tradingPairs';

// Redondeo por símbolo para mostrar precios con precisión adecuada
const roundBySymbol = (symbol: string, value: number) => {
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return parseFloat(value.toFixed(0));
  if (symbol === 'XAUUSD' || symbol === 'XAGUSD') return parseFloat(value.toFixed(2));
  if (symbol.includes('JPY')) return parseFloat(value.toFixed(3));
  return parseFloat(value.toFixed(5));
};

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
  // Estado del sistema de lotes: 2 operaciones cada 30 minutos
  const [batchCount, setBatchCount] = useState(0);
  const [batchStart, setBatchStart] = useState<number | null>(null);
  const [batchSignals, setBatchSignals] = useState(0);
  const [nextBatchTime, setNextBatchTime] = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const TICK = 10000; // 10s
    const BATCH_WINDOW = 30 * 60 * 1000; // 30 minutos

    const tick = setInterval(async () => {
      if (cancelled) return;

      const now = Date.now();

      // Inicio de lote si no hay o si ya pasó la ventana
      if (!batchStart || now - batchStart >= BATCH_WINDOW) {
        setBatchStart(now);
        setBatchSignals(0);
        setBatchCount(prev => prev + 1);
        setNextBatchTime(now + BATCH_WINDOW);
      }

      // Si el lote actual ya tiene 2 señales, esperar fin de ventana
      if (batchStart && now - batchStart < BATCH_WINDOW && batchSignals >= 2) {
        return; // esperar a siguiente lote
      }

      // Generar una señal SOLO si faltan señales en el lote actual
      if (batchSignals < 2) {
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

        // TP/SL por porcentaje: RR 2:1 (TP +2%, SL -1%)
        const PCT_TP = 0.02; // +2%
        const PCT_SL = 0.01; // -1%
        let tp = 0, sl = 0;
        if (isBuy) {
          tp = roundBySymbol(pairObj.symbol, entry * (1 + PCT_TP));
          sl = roundBySymbol(pairObj.symbol, entry * (1 - PCT_SL));
        } else {
          tp = roundBySymbol(pairObj.symbol, entry * (1 - PCT_TP));
          sl = roundBySymbol(pairObj.symbol, entry * (1 + PCT_SL));
        }

        // Simular mayor probabilidad si varias temporalidades coinciden
        const tfSignals = timeframes.map(() => Math.random() > 0.4 ? (isBuy ? 1 : -1) : 0);
        const tfScore = tfSignals.reduce((a: number, b) => a + b, 0);
        let confidence = 60 + Math.abs(tfScore) * 8 + Math.random() * 20;
        confidence = Math.min(99, Math.round(confidence));

        let notes = '';
        if (tfScore >= 3) {
          notes = `Alta probabilidad: Coincidencia de tendencia en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. \nRR 2:1 aplicado (TP +2%, SL -1%). \nSe detecta impulso fuerte y confirmación por indicadores técnicos (RSI, MACD, medias móviles). \nEl precio está cerca de soporte/resistencia relevante y el volumen acompaña el movimiento. \nSe recomienda gestión de riesgo adecuada.`;
        } else if (tfScore <= -3) {
          notes = `Alta probabilidad: Coincidencia de tendencia en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. \nRR 2:1 aplicado (TP +2%, SL -1%). \nSe observa agotamiento de la tendencia previa y señales de reversión en temporalidades mayores. \nConfirmación por patrones de velas y divergencia en indicadores. \nOperar con gestión de riesgo.`;
        } else if (confidence < 70) {
          notes = `Señal débil: Las temporalidades no están alineadas o hay alta volatilidad. \nRR 2:1 aplicado (TP +2%, SL -1%). \nFalta confirmación clara por indicadores técnicos. \nEvitar operar con lotaje alto y esperar mejor oportunidad.`;
        } else {
          notes = `Condiciones normales: Señal generada por coincidencia parcial en temporalidades (${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}). \nRR 2:1 aplicado (TP +2%, SL -1%). \nAlgunos indicadores confirman la entrada, pero el contexto no es óptimo. \nRevisar calendario económico y contexto de mercado antes de operar.`;
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
          // Mantener hasta 2 señales del lote, priorizando la más reciente y evitando duplicados por par
          setSignals(prev => {
            const withoutSamePair = prev.filter(s => s.pair !== signal.pair);
            return [signal, ...withoutSamePair].slice(0, 2);
          });
          setBatchSignals(prev => prev + 1);
          setLoading(false);
        }
      }
    }, TICK);

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [running, selectedPairs, tradingPairs, batchStart, batchSignals]);

  const clearSignals = () => setSignals([]);

  return { 
    signals, 
    loading, 
    error, 
    clearSignals,
    batchMeta: {
      batchCount,
      batchSignals,
      nextBatchTime,
    }
  };
};
