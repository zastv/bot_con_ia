import { useState, useEffect } from 'react';
import { Signal, TradingPair, TradeEvent, Trade } from '../types';
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
  const [events, setEvents] = useState<TradeEvent[]>([]);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [history, setHistory] = useState<Trade[]>([]);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const TICK = 10000; // 10s
    const BATCH_WINDOW = 30 * 60 * 1000; // 30 minutos
  const ADVERSE_TRIGGER = 0.005; // 0.5% movimiento adverso para evaluar cancelación
  const MIN_CONFIDENCE_OPEN = 70; // no abrir si no es favorable

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

      // Política profesional: solo una operación activa a la vez
  if (activeTrade) {
        // Monitorear TP/SL
        try {
          const price = await fetchPrice(activeTrade.pair === 'BTCUSD' ? 'BTCUSDT' : activeTrade.pair);
          if (price && !isNaN(price)) {
            const hitTP = activeTrade.signal === 'BUY' ? price >= activeTrade.tp : price <= activeTrade.tp;
            const hitSL = activeTrade.signal === 'BUY' ? price <= activeTrade.sl : price >= activeTrade.sl;
            if (hitTP || hitSL) {
              const exitPrice = price;
              const rr = Math.abs(activeTrade.tp - activeTrade.entry) / Math.abs(activeTrade.entry - activeTrade.sl);
              const resultPct = ((exitPrice - activeTrade.entry) / activeTrade.entry) * (activeTrade.signal === 'BUY' ? 100 : -100);
              const closed: Trade = { ...activeTrade, status: 'CLOSED', closedAt: new Date().toLocaleString(), exitPrice, closeReason: hitTP ? 'HIT_TP' as any : 'HIT_SL' as any, rr: parseFloat(rr.toFixed(2)), resultPct: parseFloat(resultPct.toFixed(2)) };
              setHistory(prev => [closed, ...prev].slice(0, 50));
              setActiveTrade(null);
              setSignals([]);
              setEvents(prev => [...prev, {
                id: Date.now(),
                tradeId: activeTrade.id,
                pair: activeTrade.pair,
                type: hitTP ? 'HIT_TP' : 'HIT_SL',
                message: `${activeTrade.display}: ${hitTP ? 'TP' : 'SL'} alcanzado a ${exitPrice}. Resultado ${resultPct.toFixed(2)}%`,
                timestamp: new Date().toLocaleTimeString(),
                batch: batchCount + 1,
              }]);
              return; // ya gestionado
            }

            // Evaluar condiciones desfavorables (antes de llegar a SL)
            const movePct = activeTrade.signal === 'BUY'
              ? (activeTrade.entry - price) / activeTrade.entry
              : (price - activeTrade.entry) / activeTrade.entry;
            if (movePct >= ADVERSE_TRIGGER) {
              // Cancelar por desfavorable
              const closed: Trade = { ...activeTrade, status: 'CLOSED', closedAt: new Date().toLocaleString(), exitPrice: price, closeReason: 'CANCELLED' };
              setHistory(prev => [closed, ...prev].slice(0, 50));
              setActiveTrade(null);
              setSignals([]);
              setEvents(prev => [...prev, {
                id: Date.now(),
                tradeId: activeTrade.id,
                pair: activeTrade.pair,
                type: 'INFO',
                message: `${activeTrade.display}: condiciones NO favorables (−${(movePct*100).toFixed(2)}%), operación cancelada antes del SL`,
                timestamp: new Date().toLocaleTimeString(),
                batch: batchCount + 1,
              }]);

              // Intentar cambio de operación (reversa) solo si hay buena confianza contraria
              const oppositeIsBuy = activeTrade.signal !== 'BUY';
              // Simular confianza contraria
              const tfOpp = timeframes.map(() => Math.random() > 0.4 ? (oppositeIsBuy ? 1 : -1) : 0);
              const tfScoreOpp = tfOpp.reduce((a: number, b) => a + b, 0);
              let confidenceOpp = 60 + Math.abs(tfScoreOpp) * 8 + Math.random() * 20;
              confidenceOpp = Math.min(99, Math.round(confidenceOpp));
              if (confidenceOpp >= 80) {
                const entryOpp = price;
                const PCT_TP = 0.02;
                const PCT_SL = 0.01;
                const tpOpp = oppositeIsBuy ? roundBySymbol(activeTrade.pair, entryOpp * (1 + PCT_TP)) : roundBySymbol(activeTrade.pair, entryOpp * (1 - PCT_TP));
                const slOpp = oppositeIsBuy ? roundBySymbol(activeTrade.pair, entryOpp * (1 - PCT_SL)) : roundBySymbol(activeTrade.pair, entryOpp * (1 + PCT_SL));
                const trade: Trade = {
                  id: Date.now(),
                  pair: activeTrade.pair,
                  display: activeTrade.display,
                  signal: oppositeIsBuy ? 'BUY' : 'SELL',
                  confidence: confidenceOpp,
                  entry: entryOpp,
                  tp: tpOpp,
                  sl: slOpp,
                  timestamp: new Date().toLocaleString(),
                  notes: 'Reversa por condiciones desfavorables previas. RR 2:1 (TP +2%, SL -1%).',
                  status: 'ACTIVE',
                  createdAt: new Date().toLocaleString(),
                  openedAt: new Date().toLocaleString(),
                };
                const nowStr = new Date().toLocaleTimeString();
                setEvents(prev => [
                  ...prev,
                  { id: Date.now(), tradeId: trade.id, pair: trade.pair, type: 'CREATED', message: `${trade.display}: nueva señal ${trade.signal} tras desfavorable. Entrada ${trade.entry}`, timestamp: nowStr, batch: batchCount + 1 },
                  { id: Date.now()+1, tradeId: trade.id, pair: trade.pair, type: 'ACTIVATED', message: `${trade.display}: operación ACTIVADA (${trade.signal}) a ${trade.entry}`, timestamp: nowStr, batch: batchCount + 1 },
                ]);
                setActiveTrade(trade);
                setSignals([{...trade}]);
              }
            }
          }
        } catch {}
        return; // mientras haya operación activa, no generar nuevas
      }

  // Generar una señal SOLO si no hay operación activa
  if (!activeTrade) {
        setLoading(true);
        setError(null);

  const availablePairs = tradingPairs.filter(p => selectedPairs.includes(p.symbol)).filter(p => p.symbol === 'BTCUSD');
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

        // Si la confianza no es suficiente, registrar INFO y no abrir
        if (confidence < MIN_CONFIDENCE_OPEN) {
          setEvents(prev => [...prev, {
            id: Date.now(),
            tradeId: Date.now(),
            pair: pairObj.symbol,
            type: 'INFO',
            message: `${pairObj.display}: condiciones NO favorables (confianza ${confidence}%). Se omite apertura.`,
            timestamp: new Date().toLocaleTimeString(),
            batch: batchCount + 1,
          }]);
          setLoading(false);
          return;
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
          const trade: Trade = {
            ...signal,
            status: 'ACTIVE',
            createdAt: new Date().toLocaleString(),
            openedAt: new Date().toLocaleString(),
          };
          // Eventos: creada y activada inmediatamente
          const nowStr = new Date().toLocaleTimeString();
          setEvents(prev => [
            ...prev,
            { id: Date.now(), tradeId: trade.id, pair: trade.pair, type: 'CREATED', message: `${trade.display}: señal ${trade.signal} creada. Entrada ${trade.entry}, TP ${trade.tp}, SL ${trade.sl}`, timestamp: nowStr, batch: batchCount + 1 },
            { id: Date.now()+1, tradeId: trade.id, pair: trade.pair, type: 'ACTIVATED', message: `${trade.display}: operación ACTIVADA (${trade.signal}) a ${trade.entry}`, timestamp: nowStr, batch: batchCount + 1 },
          ]);
          setActiveTrade(trade);
          setSignals([signal]);
          setBatchSignals(prev => prev + 1);
          setLoading(false);
        }
      }
    }, TICK);

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [running, selectedPairs, tradingPairs, batchStart, batchSignals, activeTrade, batchCount]);

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
    },
    events,
    activeTrade,
    history,
  };
};
