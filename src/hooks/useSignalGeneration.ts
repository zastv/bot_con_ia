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

  // Persistencia en localStorage
  const LS = {
    active: 'tsb_active_trade',
    history: 'tsb_history',
    events: 'tsb_events',
    batch: 'tsb_batch_meta',
  } as const;

  const safeSet = (k: string, v: any) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  };
  const safeGet = <T,>(k: string, def: T): T => {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return def;
      const val = JSON.parse(raw);
      return val as T;
    } catch { return def; }
  };

  // Rehidratación al montar
  useEffect(() => {
    const persistedActive = safeGet<Trade | null>(LS.active, null);
    const persistedHistory = safeGet<Trade[]>(LS.history, []);
    const persistedEvents = safeGet<TradeEvent[]>(LS.events, []);
    const persistedBatch = safeGet<{ batchStart: number|null; batchSignals: number; batchCount: number; nextBatchTime: number|null }>(LS.batch, { batchStart: null, batchSignals: 0, batchCount: 0, nextBatchTime: null });

    if (persistedActive) setActiveTrade(persistedActive);
    if (persistedHistory?.length) setHistory(persistedHistory);
    if (persistedEvents?.length) setEvents(persistedEvents);
    if (typeof persistedBatch.batchStart === 'number') setBatchStart(persistedBatch.batchStart);
    if (typeof persistedBatch.batchSignals === 'number') setBatchSignals(persistedBatch.batchSignals);
    if (typeof persistedBatch.batchCount === 'number') setBatchCount(persistedBatch.batchCount);
    if (typeof persistedBatch.nextBatchTime === 'number') setNextBatchTime(persistedBatch.nextBatchTime);
  }, []);

  // Guardar al cambiar
  useEffect(() => {
    safeSet(LS.active, activeTrade);
  }, [activeTrade]);

  useEffect(() => {
    safeSet(LS.history, history);
  }, [history]);

  useEffect(() => {
    // limitar a 300 eventos por tamaño
    const trimmed = events.slice(-300);
    if (trimmed.length !== events.length) setEvents(trimmed);
    safeSet(LS.events, trimmed);
  }, [events]);

  useEffect(() => {
    safeSet(LS.batch, { batchStart, batchSignals, batchCount, nextBatchTime });
  }, [batchStart, batchSignals, batchCount, nextBatchTime]);

  // Claves de persistencia
  const LS_ACTIVE_TRADE = 'tsb_active_trade';
  const LS_HISTORY = 'tsb_history';
  const LS_EVENTS = 'tsb_events';
  const LS_BATCH = 'tsb_batch_meta';

  // Rehidratación inicial desde localStorage
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem(LS_ACTIVE_TRADE);
      const savedHistory = localStorage.getItem(LS_HISTORY);
      const savedEvents = localStorage.getItem(LS_EVENTS);
      const savedBatch = localStorage.getItem(LS_BATCH);

      if (savedActive) {
        const at: Trade | null = JSON.parse(savedActive);
        if (at && at.status === 'ACTIVE') {
          setActiveTrade(at);
          setSignals([{ ...at }]);
        }
      }
      if (savedHistory) {
        const h: Trade[] = JSON.parse(savedHistory);
        if (Array.isArray(h)) setHistory(h);
      }
      if (savedEvents) {
        const e: TradeEvent[] = JSON.parse(savedEvents);
        if (Array.isArray(e)) setEvents(e);
      }
      if (savedBatch) {
        const bm: any = JSON.parse(savedBatch);
        if (bm && typeof bm === 'object') {
          if (typeof bm.batchCount === 'number') setBatchCount(bm.batchCount);
          if (typeof bm.batchSignals === 'number') setBatchSignals(bm.batchSignals);
          if (typeof bm.batchStart === 'number' || bm.batchStart === null) setBatchStart(bm.batchStart ?? null);
          if (typeof bm.nextBatchTime === 'number' || bm.nextBatchTime === null) setNextBatchTime(bm.nextBatchTime ?? null);
        }
      }

      // Anotar evento de reanudación para trazabilidad
      setEvents(prev => [
        ...prev,
        {
          id: Date.now(),
          tradeId: (Date.now()),
          pair: 'BTCUSD',
          type: 'INFO',
          message: 'Sesión restaurada. Reanudando monitoreo del estado previo.',
          timestamp: new Date().toLocaleTimeString(),
          batch: (typeof batchCount === 'number' ? batchCount + 1 : 1),
        },
      ]);
    } catch {
      // Ignorar errores de parseo y continuar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistencia automática
  useEffect(() => {
    try {
      if (activeTrade) localStorage.setItem(LS_ACTIVE_TRADE, JSON.stringify(activeTrade));
      else localStorage.removeItem(LS_ACTIVE_TRADE);
    } catch {}
  }, [activeTrade]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(history.slice(0, 200)));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      // Limitar eventos guardados
      const toSave = events.slice(-500);
      localStorage.setItem(LS_EVENTS, JSON.stringify(toSave));
    } catch {}
  }, [events]);

  useEffect(() => {
    try {
      const meta = { batchCount, batchStart, batchSignals, nextBatchTime };
      localStorage.setItem(LS_BATCH, JSON.stringify(meta));
    } catch {}
  }, [batchCount, batchStart, batchSignals, nextBatchTime]);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

  const TICK = Math.max(1000, Number.isFinite(signalInterval as any) ? signalInterval : 3000);
  // Ventana de lote más corta para scalp
  const BATCH_WINDOW = 10 * 60 * 1000; // 10 minutos
  // Triggers de gestión para SCALP
  let ADVERSE_TRIGGER = 0.002; // -0.2% cancelar antes de SL si va mal
  const SCALP_MAX_DURATION_MS = 5 * 60 * 1000; // expirar a los 5 minutos
  let MIN_CONFIDENCE_OPEN = 65; // umbral base de confianza para abrir
  const BE_TRIGGER = 0.0015; // +0.15% mover a BE
  const TRAIL_TRIGGER = 0.003; // +0.3% empezar a tralear
  const TRAIL_LOCK = 0.001; // asegurar 0.1% de ganancia

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

      // Política: solo una operación activa a la vez (scalp)
  if (activeTrade) {
        // Monitorear TP/SL
        try {
          const price = await fetchPrice(activeTrade.pair === 'BTCUSD' ? 'BTCUSDT' : activeTrade.pair);
          if (price && !isNaN(price)) {
            const nowMs = Date.now();
            const openedAtMs = activeTrade.openedAtMs || (activeTrade.openedAt ? new Date(activeTrade.openedAt).getTime() : nowMs);
            // Expiración por tiempo (scalp rápido)
            if (nowMs - openedAtMs >= SCALP_MAX_DURATION_MS) {
              const exitPrice = price;
              const rr = Math.abs(activeTrade.tp - activeTrade.entry) / Math.abs(activeTrade.entry - activeTrade.sl);
              const resultPct = ((exitPrice - activeTrade.entry) / activeTrade.entry) * (activeTrade.signal === 'BUY' ? 100 : -100);
              const closed: Trade = { ...activeTrade, status: 'CLOSED', closedAt: new Date().toLocaleString(), exitPrice, closeReason: 'EXPIRED' as any, rr: parseFloat(rr.toFixed(2)), resultPct: parseFloat(resultPct.toFixed(2)) };
              setHistory(prev => [closed, ...prev].slice(0, 50));
              setActiveTrade(null);
              setSignals([]);
              setEvents(prev => [...prev, {
                id: Date.now(),
                tradeId: activeTrade.id,
                pair: activeTrade.pair,
                type: 'EXPIRED',
                message: `${activeTrade.display}: operación EXPIRADA por tiempo. Salida ${exitPrice}.`,
                timestamp: new Date().toLocaleTimeString(),
                batch: batchCount + 1,
              }]);
              return;
            }

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

            // Gestión dinámica: BE y trailing si va a favor
            const favorablePct = activeTrade.signal === 'BUY'
              ? (price - activeTrade.entry) / activeTrade.entry
              : (activeTrade.entry - price) / activeTrade.entry;

            // Move to Break-Even rápido
            if (favorablePct >= BE_TRIGGER && !activeTrade.bePrice) {
              const bePrice = activeTrade.entry;
              const newSL = bePrice; // mover SL a BE
              const updated: Trade = { ...activeTrade, sl: roundBySymbol(activeTrade.pair, newSL), bePrice };
              setActiveTrade(updated);
              setSignals([{ ...updated }]);
              setEvents(prev => [...prev, {
                id: Date.now(),
                tradeId: activeTrade.id,
                pair: activeTrade.pair,
                type: 'INFO',
                message: `${activeTrade.display}: SL movido a BE (+${(favorablePct*100).toFixed(2)}%).`,
                timestamp: new Date().toLocaleTimeString(),
                batch: batchCount + 1,
              }]);
            }

            // Trailing para asegurar ganancia
            if (favorablePct >= TRAIL_TRIGGER) {
              let trailSL: number | null = null;
              if (activeTrade.signal === 'BUY') {
                const candidate = price * (1 - TRAIL_LOCK);
                if (candidate > activeTrade.sl) trailSL = candidate;
              } else {
                const candidate = price * (1 + TRAIL_LOCK);
                if (candidate < activeTrade.sl) trailSL = candidate;
              }
              if (trailSL !== null) {
                const updated: Trade = { ...activeTrade, sl: roundBySymbol(activeTrade.pair, trailSL) };
                setActiveTrade(updated);
                setSignals([{ ...updated }]);
              }
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
                  notes: 'Reversa por condiciones desfavorables previas. Scalp: TP/SL cortos, BE y trailing.',
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

        // Aprendizaje simple: ajustar TP/SL y filtros según rendimiento reciente (últimas 12 operaciones)
        const recent = history.slice(0, 12);
        const wins = recent.filter(r => r.closeReason === 'TP' || (r.closeReason as any) === 'HIT_TP').length;
        const losses = recent.filter(r => r.closeReason === 'SL' || (r.closeReason as any) === 'HIT_SL').length;
        const cancels = recent.filter(r => r.closeReason === 'CANCELLED' || r.closeReason === 'EXPIRED').length;
        const winRate = recent.length ? wins / recent.length : 0.5;
        // Ajustes: si va mal, más conservador y salidas más rápidas
        let PCT_TP = 0.0035; // 0.35%
        let PCT_SL = 0.0025; // 0.25%
        if (winRate < 0.45) {
          PCT_TP = 0.0025; // 0.25%
          PCT_SL = 0.0018; // 0.18%
          MIN_CONFIDENCE_OPEN = 72;
          ADVERSE_TRIGGER = 0.0015; // cortar antes
        } else if (winRate > 0.6 && losses <= wins) {
          PCT_TP = 0.0045; // 0.45%
          PCT_SL = 0.0028; // 0.28%
          MIN_CONFIDENCE_OPEN = 62;
        }

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
          notes = `Alta probabilidad (scalp): Confluencia en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. TP/SL cortos (~0.25–0.45% / ~0.18–0.28%), BE y trailing activos.`;
        } else if (tfScore <= -3) {
          notes = `Alta probabilidad (scalp): Confluencia contraria en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. TP/SL cortos, BE rápido y trailing.`;
        } else if (confidence < 70) {
          notes = `Señal débil (scalp): temporalidades mixtas/volatilidad alta. Usar lotaje bajo o esperar mejor set-up (BE + trailing).`;
        } else {
          notes = `Condiciones normales (scalp): Coincidencia parcial en ${timeframes.filter((_,i)=>tfSignals[i]!==0).join(", ")}. Gestión: BE a +0.15%, trailing a +0.3%.`;
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
            openedAtMs: Date.now(),
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

  // Cierre manual de la operación activa
  const closeActiveTrade = async (reason: 'CANCELLED' | 'EXPIRED' | 'TP' | 'SL' = 'CANCELLED') => {
    if (!activeTrade) return;
    try {
      setLoading(true);
      const api = activeTrade.pair === 'BTCUSD' ? 'BTCUSDT' : activeTrade.pair;
      let price = activeTrade.entry;
      try {
        const p = await fetchPrice(api);
        if (p && !isNaN(p)) price = p;
      } catch {}
      const exitPrice = price;
      const rr = Math.abs(activeTrade.tp - activeTrade.entry) / Math.abs(activeTrade.entry - activeTrade.sl);
      const resultPct = ((exitPrice - activeTrade.entry) / activeTrade.entry) * (activeTrade.signal === 'BUY' ? 100 : -100);
      const closed: Trade = {
        ...activeTrade,
        status: 'CLOSED',
        closedAt: new Date().toLocaleString(),
        exitPrice,
        closeReason: reason,
        rr: parseFloat(rr.toFixed(2)),
        resultPct: parseFloat(resultPct.toFixed(2)),
      };
      setHistory(prev => [closed, ...prev].slice(0, 50));
      setActiveTrade(null);
      setSignals([]);
      setEvents(prev => [
        ...prev,
        {
          id: Date.now(),
          tradeId: activeTrade.id,
          pair: activeTrade.pair,
          type: reason === 'CANCELLED' ? 'CANCELLED' : reason === 'EXPIRED' ? 'EXPIRED' : reason === 'TP' ? 'HIT_TP' : 'HIT_SL',
          message: `${activeTrade.display}: operación cerrada manualmente (${reason}). Salida ${exitPrice}. Resultado ${resultPct.toFixed(2)}%`,
          timestamp: new Date().toLocaleTimeString(),
          batch: batchCount + 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { 
    signals, 
    loading, 
    error, 
    clearSignals,
    closeActiveTrade,
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
