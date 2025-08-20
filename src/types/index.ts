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
