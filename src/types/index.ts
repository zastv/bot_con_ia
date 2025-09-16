export interface Signal {
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
}

export interface TradingPair {
  symbol: string;
  api: string;
  display: string;
  category: string;
}

// Estados de la operación
export type TradeStatus = 'NEW' | 'ACTIVE' | 'CLOSED';
export type TradeCloseReason = 'TP' | 'SL' | 'CANCELLED' | 'EXPIRED' | 'HIT_TP' | 'HIT_SL';

export interface Trade extends Signal {
  status: TradeStatus;
  createdAt: string; // cuando se generó la señal
  openedAt?: string; // cuando se activó
  closedAt?: string; // cuando se cerró
  exitPrice?: number; // precio de salida
  closeReason?: TradeCloseReason;
  rr?: number; // RR logrado al cierre
  resultPct?: number; // % de resultado al cierre
  // Campos opcionales para gestión avanzada (scalping)
  openedAtMs?: number; // timestamp numérico para cálculos de expiración
  bePrice?: number; // si se movió a break-even, precio de BE
}

export type TradeEventType = 'CREATED' | 'ACTIVATED' | 'HIT_TP' | 'HIT_SL' | 'CANCELLED' | 'EXPIRED' | 'INFO';

export interface TradeEvent {
  id: number;
  tradeId: number;
  pair: string;
  type: TradeEventType;
  message: string;
  timestamp: string;
  batch?: number;
}
