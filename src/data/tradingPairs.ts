import { TradingPair } from '../types';

export const tradingPairs: TradingPair[] = [
  { symbol: 'XAUUSD', api: 'XAUUSD', display: 'Oro (XAUUSD)', category: 'Commodities' },
  { symbol: 'EURUSD', api: 'EURUSD', display: 'Euro/Dólar (EURUSD)', category: 'Forex Major' },
  { symbol: 'GBPUSD', api: 'GBPUSD', display: 'Libra/Dólar (GBPUSD)', category: 'Forex Major' },
  { symbol: 'USDJPY', api: 'USDJPY', display: 'Dólar/Yen (USDJPY)', category: 'Forex Major' },
  { symbol: 'AUDUSD', api: 'AUDUSD', display: 'Dólar Australiano (AUDUSD)', category: 'Forex Minor' },
  { symbol: 'USDCAD', api: 'USDCAD', display: 'Dólar Canadiense (USDCAD)', category: 'Forex Minor' },
  { symbol: 'BTCUSD', api: 'BTCUSDT', display: 'Bitcoin (BTCUSD)', category: 'Crypto' },
  { symbol: 'ETHUSD', api: 'ETHUSDT', display: 'Ethereum (ETHUSD)', category: 'Crypto' },
  { symbol: 'EURJPY', api: 'EURJPY', display: 'Euro/Yen (EURJPY)', category: 'Forex Cross' },
  { symbol: 'GBPJPY', api: 'GBPJPY', display: 'Libra/Yen (GBPJPY)', category: 'Forex Cross' },
];

export const categories = ['All', ...Array.from(new Set(tradingPairs.map(p => p.category)))];

export const timeframes = ['M5', 'M15', 'H1', 'H4', 'D1'];
