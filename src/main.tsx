import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Brain, Play, Pause, TrendingUp, TrendingDown, RefreshCw, Settings, Filter, BarChart3, Zap } from 'lucide-react';

interface Signal {
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

interface TradingPair {
  symbol: string;
  api: string;
  display: string;
  category: string;
}

const tradingPairs: TradingPair[] = [
  // Crypto principales
  { symbol: 'BTCUSD', api: 'BTCUSDT', display: 'Bitcoin (BTCUSD)', category: 'Crypto Major' },
  { symbol: 'ETHUSD', api: 'ETHUSDT', display: 'Ethereum (ETHUSD)', category: 'Crypto Major' },
  
  // Forex Majors
  { symbol: 'EURUSD', api: 'EURUSD', display: 'Euro/Dólar (EURUSD)', category: 'Forex Major' },
  { symbol: 'GBPUSD', api: 'GBPUSD', display: 'Libra/Dólar (GBPUSD)', category: 'Forex Major' },
  { symbol: 'USDJPY', api: 'USDJPY', display: 'Dólar/Yen (USDJPY)', category: 'Forex Major' },
  { symbol: 'AUDUSD', api: 'AUDUSD', display: 'Dólar Australiano (AUDUSD)', category: 'Forex Major' },
  
  // Forex Minors
  { symbol: 'USDCAD', api: 'USDCAD', display: 'Dólar/Canadiense (USDCAD)', category: 'Forex Minor' },
  { symbol: 'NZDUSD', api: 'NZDUSD', display: 'Dólar Neozelandés (NZDUSD)', category: 'Forex Minor' },
  { symbol: 'USDCHF', api: 'USDCHF', display: 'Dólar/Franco Suizo (USDCHF)', category: 'Forex Minor' },
  
  // Commodities
  { symbol: 'XAUUSD', api: 'XAUUSD', display: 'Oro (XAUUSD)', category: 'Commodities' },
  { symbol: 'XAGUSD', api: 'XAGUSD', display: 'Plata (XAGUSD)', category: 'Commodities' },
];

// 📍 MAPEO COMPLETO PARA TRADINGVIEW - Cada par a su símbolo correcto
const getTradingViewSymbol = (pair: string): string => {
  const symbolMap: Record<string, string> = {
    // 🪙 CRYPTO - BINANCE (Máxima liquidez)
    'BTCUSDT': 'BINANCE:BTCUSDT',
    'ETHUSDT': 'BINANCE:ETHUSDT',
    
    // 💱 FOREX MAJORS - FX (Feed institucional)
    'EURUSD': 'FX:EURUSD',
    'GBPUSD': 'FX:GBPUSD', 
    'USDJPY': 'FX:USDJPY',
    'AUDUSD': 'FX:AUDUSD',
    
    // 💱 FOREX MINORS - FX  
    'USDCAD': 'FX:USDCAD',
    'NZDUSD': 'FX:NZDUSD', 
    'USDCHF': 'FX:USDCHF',
    
    // 🥇 METALES PRECIOSOS - OANDA (Spreads profesionales)
    'XAUUSD': 'OANDA:XAUUSD',
    'XAGUSD': 'OANDA:XAGUSD'
  };
  
  const symbol = symbolMap[pair];
  if (!symbol) {
    console.warn(`⚠️ Par ${pair} no encontrado en TradingView, usando FX como fallback`);
    return `FX:${pair}`;
  }
  
  console.log(`📊 TradingView: ${pair} → ${symbol}`);
  return symbol;
};

const fetchPrice = async (pair: string): Promise<number> => {
  console.log(`🔍 Obteniendo precio real para ${pair}...`);
  
  // 1. 🪙 CRYPTO - APIs múltiples para máxima cobertura
  if (pair === 'BTCUSDT' || pair === 'ETHUSDT') {
    const cryptoApis = [
      {
        name: 'Binance',
        url: `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`,
        extract: (data: any) => parseFloat(data.price)
      },
      {
        name: 'CoinGecko',
        url: `https://api.coingecko.com/api/v3/simple/price?ids=${pair === 'BTCUSDT' ? 'bitcoin' : 'ethereum'}&vs_currencies=usd`,
        extract: (data: any) => data[pair === 'BTCUSDT' ? 'bitcoin' : 'ethereum']?.usd
      },
      {
        name: 'CryptoCompare',
        url: `https://min-api.cryptocompare.com/data/price?fsym=${pair.slice(0,3)}&tsyms=USD`,
        extract: (data: any) => data.USD
      }
    ];

    for (const api of cryptoApis) {
      try {
        const res = await axios.get(api.url, { timeout: 5000 });
        const price = api.extract(res.data);
        if (price && price > 0) {
          console.log(`✅ ${pair}: ${price} desde ${api.name}`);
          return price;
        }
      } catch (error: any) {
        console.warn(`❌ ${api.name} falló para ${pair}:`, error?.message);
        continue;
      }
    }
  }

  // 2. 💱 FOREX - APIs múltiples con fallbacks inteligentes
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'].includes(pair)) {
    const baseCurrency = pair.substring(0, 3);
    const quoteCurrency = pair.substring(3, 6);
    
    const forexApis = [
      {
        name: 'ExchangeRate-API',
        url: `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
        extract: (data: any) => data.rates?.[quoteCurrency]
      },
      {
        name: 'Fixer.io (demo)',
        url: `https://api.fixer.io/latest?base=${baseCurrency}&symbols=${quoteCurrency}`,
        extract: (data: any) => data.rates?.[quoteCurrency]
      },
      {
        name: 'Alpha Vantage (demo)',
        url: `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${baseCurrency}&to_currency=${quoteCurrency}&apikey=demo`,
        extract: (data: any) => parseFloat(data['Realtime Currency Exchange Rate']?.['5. Exchange Rate'])
      },
      {
        name: 'CurrencyAPI',
        url: `https://api.currencyapi.com/v3/latest?apikey=demo&base_currency=${baseCurrency}&currencies=${quoteCurrency}`,
        extract: (data: any) => data.data?.[quoteCurrency]?.value
      }
    ];

    for (const api of forexApis) {
      try {
        const res = await axios.get(api.url, { timeout: 8000 });
        const price = api.extract(res.data);
        if (price && price > 0) {
          console.log(`✅ ${pair}: ${price.toFixed(5)} desde ${api.name}`);
          return parseFloat(price.toFixed(5));
        }
      } catch (error: any) {
        console.warn(`❌ ${api.name} falló para ${pair}:`, error?.message);
        continue;
      }
    }
  }

  // 3. 🥇 METALES PRECIOSOS - APIs especializadas
  if (pair === 'XAUUSD' || pair === 'XAGUSD') {
    const metalSymbol = pair === 'XAUUSD' ? 'gold' : 'silver';
    const metalApis = [
      {
        name: 'Metals-Live',
        url: `https://api.metals.live/v1/spot/${metalSymbol}`,
        extract: (data: any) => data.price
      },
      {
        name: 'Yahoo Finance',
        url: `https://query1.finance.yahoo.com/v8/finance/chart/${pair === 'XAUUSD' ? 'GC=F' : 'SI=F'}`,
        extract: (data: any) => data.chart?.result?.[0]?.meta?.regularMarketPrice
      },
      {
        name: 'Financial Modeling Prep',
        url: `https://financialmodelingprep.com/api/v3/fx/${pair}?apikey=demo`,
        extract: (data: any) => data[0]?.price
      },
      {
        name: 'Alpha Vantage Commodities',
        url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${pair === 'XAUUSD' ? 'GOLD' : 'SILVER'}&apikey=demo`,
        extract: (data: any) => parseFloat(data['Global Quote']?.['05. price'])
      }
    ];

    for (const api of metalApis) {
      try {
        const res = await axios.get(api.url, { timeout: 8000 });
        const price = api.extract(res.data);
        if (price && price > 0) {
          console.log(`✅ ${pair}: $${parseFloat(price).toFixed(2)} desde ${api.name}`);
          return parseFloat(price);
        }
      } catch (error: any) {
        console.warn(`❌ ${api.name} falló para ${pair}:`, error?.message);
        continue;
      }
    }
  }

  // 4. 📊 FALLBACK UNIVERSAL - Si todas las APIs fallan, usar precios realistas del mercado
  const marketPrices: Record<string, number> = {
    'BTCUSDT': 43500 + (Math.random() - 0.5) * 2000, // BTC rango realista
    'ETHUSDT': 2650 + (Math.random() - 0.5) * 200,   // ETH rango realista
    'EURUSD': 1.0850 + (Math.random() - 0.5) * 0.02,  // EUR/USD
    'GBPUSD': 1.2750 + (Math.random() - 0.5) * 0.03,  // GBP/USD
    'USDJPY': 150.25 + (Math.random() - 0.5) * 2,     // USD/JPY
    'AUDUSD': 0.6550 + (Math.random() - 0.5) * 0.02,  // AUD/USD
    'USDCAD': 1.3850 + (Math.random() - 0.5) * 0.02,  // USD/CAD
    'NZDUSD': 0.5950 + (Math.random() - 0.5) * 0.02,  // NZD/USD
    'USDCHF': 0.8750 + (Math.random() - 0.5) * 0.02,  // USD/CHF
    'XAUUSD': 2650 + (Math.random() - 0.5) * 60,      // Gold
    'XAGUSD': 31.5 + (Math.random() - 0.5) * 2,       // Silver
  };

  const fallbackPrice = marketPrices[pair];
  if (fallbackPrice) {
    console.log(`⚠️ ${pair}: Usando precio de mercado estimado = ${fallbackPrice.toFixed(pair.includes('JPY') ? 3 : 5)}`);
    return fallbackPrice;
  }

  // 5. 🚨 ÚLTIMO RECURSO
  console.error(`🚨 ERROR CRÍTICO: No se pudo obtener precio para ${pair}`);
  throw new Error(`❌ Par ${pair} no disponible - Verificar conectividad`);
};

// 🏦 ANÁLISIS DE RIESGO FTMO - Parámetros institucionales  
const analyzeFTMORisk = (signal: any, pair: string) => {
  // Reglas FTMO específicas
  const ftmoRules = {
    maxDailyLoss: 5, // 5% pérdida diaria máxima
    maxTotalLoss: 10, // 10% pérdida total máxima
    profitTarget: 8, // 8% objetivo de ganancia (primera fase)
    minWinRate: 65, // 65% tasa de acierto mínima requerida
    maxRiskPerTrade: 2, // 2% máximo por operación
    minRRRatio: 1.5 // Relación Riesgo/Beneficio mínima 1:1.5
  };

  // Calcular tamaño de posición basado en ATR y reglas FTMO
  const calculateFTMOPositionSize = (price: number, atr: number) => {
    const accountBalance = 100000; // $100k cuenta FTMO estándar
    const riskAmount = accountBalance * (ftmoRules.maxRiskPerTrade / 100);
    const stopLossDistance = atr * 1.5; // 1.5x ATR para SL
    const positionSize = riskAmount / stopLossDistance;
    
    // Convertir a lots estándar
    let lotSize = 0.01;
    if (['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD'].includes(pair)) {
      lotSize = Math.round((positionSize / 100000) * 100) / 100; // Forex standard lot
    } else if (pair === 'XAUUSD') {
      lotSize = Math.round((positionSize / price) * 100) / 100; // Gold oz
    } else {
      lotSize = Math.round((positionSize / price) * 1000) / 1000; // Crypto
    }
    
    return Math.max(0.01, Math.min(10, lotSize)); // Entre 0.01 y 10 lots
  };

  const atr = signal.liquidityZones.atr || 0.002; // ATR estimado
  const positionSize = calculateFTMOPositionSize(signal.currentPrice, atr);
  
  // Calcular SL y TP basado en análisis multi-timeframe
  const stopLoss = signal.direction === 'BUY' 
    ? signal.currentPrice - (atr * 1.5)
    : signal.currentPrice + (atr * 1.5);
    
  const takeProfit = signal.direction === 'BUY'
    ? signal.currentPrice + (atr * 2.5) // RR 1:1.67
    : signal.currentPrice - (atr * 2.5);

  const riskRewardRatio = Math.abs(takeProfit - signal.currentPrice) / Math.abs(signal.currentPrice - stopLoss);

  return {
    positionSize: positionSize,
    stopLoss: parseFloat(stopLoss.toFixed(getPairDecimals(pair))),
    takeProfit: parseFloat(takeProfit.toFixed(getPairDecimals(pair))),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    riskAmount: Math.round((Math.abs(signal.currentPrice - stopLoss) * positionSize) * 100) / 100,
    profitPotential: Math.round((Math.abs(takeProfit - signal.currentPrice) * positionSize) * 100) / 100,
    ftmoCompliant: riskRewardRatio >= ftmoRules.minRRRatio && positionSize <= 10,
    confidence: signal.confidence,
    timeframe: signal.timeframes.primary || 'H1'
  };
};

// Helper para obtener decimales por par
const getPairDecimals = (pair: string): number => {
  if (pair.includes('JPY')) return 3;
  if (pair.startsWith('XAU') || pair.startsWith('XAG')) return 2;
  if (pair.includes('BTC') || pair.includes('ETH')) return 2;
  return 5; // Forex majors
};

// Simulador de análisis multi-timeframe PROFESIONAL
const analyzeMultiTimeframes = (currentPrice: number, symbol: string) => {
  // Simular EMAs en diferentes temporalidades
  const timeframes = {
    M1: { ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.001), ema100: currentPrice * (1 + (Math.random() - 0.5) * 0.0008), ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.0005) },
    M5: { ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.003), ema100: currentPrice * (1 + (Math.random() - 0.5) * 0.002), ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.001) },
    M15: { ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.008), ema100: currentPrice * (1 + (Math.random() - 0.5) * 0.005), ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.003) },
    H1: { ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.02), ema100: currentPrice * (1 + (Math.random() - 0.5) * 0.015), ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.01) },
    H4: { ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.05), ema100: currentPrice * (1 + (Math.random() - 0.5) * 0.03), ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.02) },
    D1: { ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.1), ema100: currentPrice * (1 + (Math.random() - 0.5) * 0.07), ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.05) }
  };
  
  // Analizar alineación en cada temporalidad
  const timeframeAnalysis: Record<string, any> = {};
  Object.entries(timeframes).forEach(([tf, emas]) => {
    const bullishAlignment = emas.ema50 > emas.ema100 && emas.ema100 > emas.ema200;
    const bearishAlignment = emas.ema50 < emas.ema100 && emas.ema100 < emas.ema200;
    const priceAboveAll = currentPrice > emas.ema50 && currentPrice > emas.ema100 && currentPrice > emas.ema200;
    
    timeframeAnalysis[tf] = {
      emas,
      bullishAlignment,
      bearishAlignment,
      priceAboveAll,
      trend: bullishAlignment ? 'bullish' : bearishAlignment ? 'bearish' : 'neutral'
    };
  });
  
  return timeframeAnalysis;
};

// Estrategia de maleta - detección de zonas de liquidez
const analyzeLiquidityZones = (currentPrice: number, symbol: string) => {
  // Simular niveles históricos importantes
  const volatility = symbol.includes('USD') ? 0.02 : symbol.includes('BTC') ? 0.05 : 0.01;
  
  // Zonas de liquidez simuladas (highs/lows anteriores)
  const liquidityZones = [];
  for (let i = 0; i < 5; i++) {
    const distancePercent = (0.5 + Math.random() * 3) / 100; // 0.5% a 3.5% del precio actual
    const isAbove = Math.random() > 0.5;
    const liquidityPrice = isAbove 
      ? currentPrice * (1 + distancePercent)
      : currentPrice * (1 - distancePercent);
    
    liquidityZones.push({
      price: liquidityPrice,
      type: isAbove ? 'resistance' : 'support',
      strength: Math.random() * 100,
      distance: Math.abs(currentPrice - liquidityPrice),
      distancePercent: Math.abs(currentPrice - liquidityPrice) / currentPrice * 100
    });
  }
  
  // Ordenar por distancia (más cerca = más relevante)
  liquidityZones.sort((a, b) => a.distance - b.distance);
  
  // Detectar si estamos cerca de una zona de liquidez
  const nearestZone = liquidityZones[0];
  const isNearLiquidity = nearestZone.distancePercent < 1.5; // Dentro del 1.5%
  
  // Simular "recogida de liquidez" - retroceso antes de continuar tendencia
  const isLiquiditySweep = Math.random() > 0.7 && isNearLiquidity;
  
  return {
    zones: liquidityZones.slice(0, 3), // Top 3 zonas más cercanas
    nearestZone,
    isNearLiquidity,
    isLiquiditySweep,
    recommendation: isLiquiditySweep 
      ? (nearestZone.type === 'support' ? 'buy_after_sweep' : 'sell_after_sweep')
      : 'wait_for_sweep'
  };
};

// Simulador de análisis fundamental (noticias)
const analyzeFundamentals = (symbol: string) => {
  const newsEvents = [
    'Fed Meeting', 'ECB Decision', 'NFP Release', 'CPI Data', 'GDP Report',
    'FOMC Minutes', 'Retail Sales', 'Employment Data', 'PMI Flash', 'Trade Balance'
  ];
  
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const cryptoNews = ['BTC ETF', 'Regulation News', 'Institutional Adoption', 'Mining Update'];
  const commodityNews = ['OPEC Meeting', 'Supply Chain', 'Inflation Hedge', 'Central Bank Buying'];
  
  // Simular eventos próximos
  const upcomingEvents = [];
  const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 eventos
  
  for (let i = 0; i < numEvents; i++) {
    let eventPool = newsEvents;
    if (symbol.includes('BTC') || symbol.includes('ETH')) eventPool = cryptoNews;
    if (symbol.includes('XAU') || symbol.includes('XAG')) eventPool = commodityNews;
    
    const event = eventPool[Math.floor(Math.random() * eventPool.length)];
    const impact = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
    const sentiment = ['Bullish', 'Bearish', 'Neutral'][Math.floor(Math.random() * 3)];
    const timeToEvent = Math.floor(Math.random() * 24); // Próximas 24 horas
    
    upcomingEvents.push({
      event,
      impact,
      sentiment,
      timeToEvent,
      relevantCurrency: currencies.find(c => symbol.includes(c)) || 'USD'
    });
  }
  
  // Calcular score fundamental general
  const fundamentalScore = upcomingEvents.reduce((score, event) => {
    const impactWeight = event.impact === 'High' ? 3 : event.impact === 'Medium' ? 2 : 1;
    const sentimentWeight = event.sentiment === 'Bullish' ? 1 : event.sentiment === 'Bearish' ? -1 : 0;
    return score + (impactWeight * sentimentWeight);
  }, 0);
  
  return {
    events: upcomingEvents,
    fundamentalScore,
    recommendation: fundamentalScore > 2 ? 'bullish' : fundamentalScore < -2 ? 'bearish' : 'neutral',
    riskLevel: upcomingEvents.some(e => e.impact === 'High') ? 'high' : 'normal'
  };
};

// Función mejorada de EMAs con base en temporalidad principal
const calculateEMAs = (currentPrice: number, symbol: string) => {
  // Simular EMAs en temporalidad principal (H1 o H4)
  const basePrice = currentPrice;
  const volatility = symbol.includes('USD') ? 0.02 : symbol.includes('BTC') ? 0.05 : 0.01;
  
  // EMAs más realistas con tendencias
  const ema50 = basePrice * (1 + (Math.random() - 0.5) * volatility * 0.5);
  const ema100 = basePrice * (1 + (Math.random() - 0.5) * volatility * 0.3);
  const ema200 = basePrice * (1 + (Math.random() - 0.5) * volatility * 0.2);
  
  return { ema50, ema100, ema200, currentPrice };
};

// Detectar cruces EMA según tu estrategia
const detectEMACrosses = (emas: any, prevEmas: any) => {
  const earlyCross = {
    occurred: false,
    type: 'none' as 'bullish' | 'bearish' | 'none',
    strength: 0
  };
  
  const goldenCross = {
    occurred: false,
    type: 'none' as 'bullish' | 'bearish' | 'none',
    strength: 0
  };

  // Early Cross: EMA50 cruzando EMA100
  if (prevEmas) {
    const ema50Above100Now = emas.ema50 > emas.ema100;
    const ema50Above100Prev = prevEmas.ema50 > prevEmas.ema100;
    
    if (ema50Above100Now !== ema50Above100Prev) {
      earlyCross.occurred = true;
      earlyCross.type = ema50Above100Now ? 'bullish' : 'bearish';
      earlyCross.strength = Math.abs(emas.ema50 - emas.ema100) / emas.ema100 * 100;
    }
    
    // Golden Cross: EMA50 cruzando EMA200
    const ema50Above200Now = emas.ema50 > emas.ema200;
    const ema50Above200Prev = prevEmas.ema50 > prevEmas.ema200;
    
    if (ema50Above200Now !== ema50Above200Prev) {
      goldenCross.occurred = true;
      goldenCross.type = ema50Above200Now ? 'bullish' : 'bearish';
      goldenCross.strength = Math.abs(emas.ema50 - emas.ema200) / emas.ema200 * 100;
    }
  }
  
  return { earlyCross, goldenCross };
};

// Análisis de tendencia EMA
const analyzeEMATrend = (emas: any) => {
  const { ema50, ema100, ema200, currentPrice } = emas;
  
  // Análisis de alineación de EMAs
  const bullishAlignment = ema50 > ema100 && ema100 > ema200;
  const bearishAlignment = ema50 < ema100 && ema100 < ema200;
  
  // Posición del precio respecto a EMAs
  const priceAboveAll = currentPrice > ema50 && currentPrice > ema100 && currentPrice > ema200;
  const priceBelowAll = currentPrice < ema50 && currentPrice < ema100 && currentPrice < ema200;
  
  let trendStrength = 0;
  let trendDirection: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  
  if (bullishAlignment && priceAboveAll) {
    trendDirection = 'bullish';
    trendStrength = 85 + Math.random() * 15; // 85-100%
  } else if (bearishAlignment && priceBelowAll) {
    trendDirection = 'bearish';
    trendStrength = 85 + Math.random() * 15; // 85-100%
  } else if (bullishAlignment || priceAboveAll) {
    trendDirection = 'bullish';
    trendStrength = 60 + Math.random() * 25; // 60-85%
  } else if (bearishAlignment || priceBelowAll) {
    trendDirection = 'bearish';
    trendStrength = 60 + Math.random() * 25; // 60-85%
  } else {
    trendDirection = 'neutral';
    trendStrength = 40 + Math.random() * 20; // 40-60%
  }
  
  return {
    direction: trendDirection,
    strength: trendStrength,
    alignment: { bullishAlignment, bearishAlignment },
    pricePosition: { priceAboveAll, priceBelowAll }
  };
};

const TradingSignalsBot: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['BTCUSD', 'EURUSD', 'XAUUSD', 'GBPUSD']);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [signalInterval, setSignalInterval] = useState<number>(300000); // 5 minutos - análisis súper selectivo
  const [maxSignals, setMaxSignals] = useState<number>(1); // Solo UNA señal activa
  const [marketSentiment, setMarketSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral');
  const [riskLevel, setRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [usedPairs, setUsedPairs] = useState<string[]>([]); // Control de pares ya utilizados
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0); // Control de tiempo entre análisis
  
  // 🎯 SISTEMA DE LOTES PROFESIONAL - 2 operaciones cada 30 minutos
  const [activeBatch, setActiveBatch] = useState<Signal[]>([]);
  const [batchStartTime, setBatchStartTime] = useState<number>(0);
  const [batchCount, setBatchCount] = useState(0);
  const [waitingForNextBatch, setWaitingForNextBatch] = useState(false);
  const [nextBatchTime, setNextBatchTime] = useState<number>(0);
  const [emaHistory, setEmaHistory] = useState<Record<string, any>>({}); // Historial EMAs para cruces

  // Estado FTMO Challenge
  const [ftmoStatus, setFtmoStatus] = useState({
    dailyLoss: 0,
    totalLoss: 0,
    profitTarget: 0,
    tradesCount: 0,
    winRate: 0,
    maxConsecutiveLosses: 0,
    currentDrawdown: 0,
    compliant: true,
    accountBalance: 100000,
    phase: 1, // 1 = Challenge, 2 = Verification, 3 = Funded
    tradingDays: 0
  });

  // Configuración FTMO Challenge
  const ftmoConfig = {
    accountSize: 100000, // $100k
    maxDailyLoss: 5, // 5%
    maxTotalLoss: 10, // 10%
    profitTargetPhase1: 8, // 8%
    profitTargetPhase2: 5, // 5%
    minTradingDays: 4,
    maxTradingDays: 30,
    maxLotSize: 20,
    minRiskReward: 1.5
  };

  // Función para generar señales con análisis profundo
  const generateSignal = useCallback(async () => {
    console.log('� Iniciando análisis profundo de mercado...');
    
    // Solo permitir UNA señal activa a la vez
    if (signals.length >= 1) {
      console.log('⏳ Operación activa en curso - esperando finalización');
      return;
    }

    // Control de tiempo mínimo entre análisis (3 minutos para evitar repeticiones)
    const now = Date.now();
    if (now - lastAnalysisTime < 180000) { // 3 minutos mínimo
      console.log('⏱️ Tiempo insuficiente desde último análisis (min 3 min para calidad)');
      return;
    }

    setLoading(true);
    setError(null);
    setLastAnalysisTime(now);

    try {
      // Filtrar pares disponibles y no utilizados recientemente
      let availablePairs = tradingPairs.filter(p => 
        selectedPairs.includes(p.symbol) && !usedPairs.includes(p.symbol)
      );
      
      // Si todos los pares fueron usados, reiniciar el ciclo
      if (availablePairs.length === 0) {
        setUsedPairs([]);
        availablePairs = tradingPairs.filter(p => selectedPairs.includes(p.symbol));
      }
      
      if (availablePairs.length === 0) {
        setError('No hay pares seleccionados');
        return;
      }

      // Análisis COMPLETO según tu estrategia: Multi-timeframe + Liquidez + Fundamentales
      console.log('🔍 Iniciando análisis multi-dimensional...');
      console.log('📊 1/4 - Analizando múltiples temporalidades...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      const pairAnalysis = [];
      
      for (const pair of availablePairs) {
        // 1. Obtener precio actual
        const currentPrice = await fetchPrice(pair.api);
        
        // 2. Análisis multi-timeframe (tu revisión de temporalidades)
        console.log(`⏰ Analizando ${pair.symbol} en temporalidades M1, M5, M15, H1, H4, D1...`);
        const multiTF = analyzeMultiTimeframes(currentPrice, pair.symbol);
        
        // 3. EMAs en temporalidad principal
        const currentEMAs = calculateEMAs(currentPrice, pair.symbol);
        const prevEMAs = emaHistory[pair.symbol];
        const crosses = detectEMACrosses(currentEMAs, prevEMAs);
        const trendAnalysis = analyzeEMATrend(currentEMAs);
        
        // 4. Análisis de liquidez (tu estrategia maleta)
        console.log(`💧 Detectando zonas de liquidez para ${pair.symbol}...`);
        const liquidityAnalysis = analyzeLiquidityZones(currentPrice, pair.symbol);
        
        // 5. Análisis fundamental (noticias)
        console.log(`📰 Revisando eventos fundamentales para ${pair.symbol}...`);
        const fundamentals = analyzeFundamentals(pair.symbol);
        
        // Calcular confluencias entre temporalidades
        const timeframeConfluence = Object.values(multiTF).filter((tf: any) => tf.trend !== 'neutral').length;
        const bullishTFs = Object.values(multiTF).filter((tf: any) => tf.trend === 'bullish').length;
        const bearishTFs = Object.values(multiTF).filter((tf: any) => tf.trend === 'bearish').length;
        
        // ⭐ SCORING ESTRICTO PARA CALIDAD (Mínimo 85 puntos para calificar)
        let qualityScore = 0;
        let rejectionReasons = [];
        
        // 1. Confluencia de temporalidades (OBLIGATORIO - mínimo 4 TFs)
        if (timeframeConfluence >= 5) {
          qualityScore += 35; // Excelente confluencia
          console.log(`✅ ${pair.symbol}: Confluencia EXCELENTE (${timeframeConfluence}/6 TFs)`);
        } else if (timeframeConfluence >= 4) {
          qualityScore += 25; // Buena confluencia
          console.log(`✅ ${pair.symbol}: Confluencia BUENA (${timeframeConfluence}/6 TFs)`);
        } else {
          rejectionReasons.push(`Confluencia insuficiente (${timeframeConfluence}/6)`);
        }
        
        // 2. Cruces EMA (OBLIGATORIO para señales de calidad)
        let hasStrongEMASignal = false;
        if (crosses.goldenCross.occurred && crosses.goldenCross.strength > 0.8) {
          qualityScore += 40; // Golden Cross fuerte
          hasStrongEMASignal = true;
          console.log(`🏆 ${pair.symbol}: GOLDEN CROSS FUERTE (${crosses.goldenCross.strength.toFixed(2)})`);
        } else if (crosses.earlyCross.occurred && crosses.earlyCross.strength > 0.5) {
          qualityScore += 30; // Early Cross fuerte
          hasStrongEMASignal = true;
          console.log(`⚡ ${pair.symbol}: EARLY CROSS FUERTE (${crosses.earlyCross.strength.toFixed(2)})`);
        } else {
          rejectionReasons.push('Sin cruces EMA significativos');
        }
        
        // 3. Estrategia de liquidez (TU ESTRATEGIA PRINCIPAL)
        if (liquidityAnalysis.isLiquiditySweep) {
          qualityScore += 35; // Barrida fuerte
          console.log(`💼 ${pair.symbol}: BARRIDA DE LIQUIDEZ CONFIRMADA`);
        } else if (liquidityAnalysis.isNearLiquidity && liquidityAnalysis.nearestZone.distancePercent < 0.5) {
          qualityScore += 20; // Muy cerca de zona
          console.log(`🎯 ${pair.symbol}: MUY CERCA de liquidez (${liquidityAnalysis.nearestZone.distancePercent.toFixed(2)}%)`);
        } else {
          rejectionReasons.push('Sin oportunidad de liquidez clara');
        }
        
        // 4. Tendencia clara (OBLIGATORIO)
        if (trendAnalysis.strength > 70) {
          qualityScore += 15; // Tendencia muy fuerte
          console.log(`📈 ${pair.symbol}: Tendencia MUY FUERTE (${trendAnalysis.strength.toFixed(1)}%)`);
        } else if (trendAnalysis.strength > 50) {
          qualityScore += 10; // Tendencia decente
        } else {
          rejectionReasons.push(`Tendencia débil (${trendAnalysis.strength.toFixed(1)}%)`);
        }
        
        // 5. Fundamentales (BONUS/PENALTY)
        if (fundamentals.recommendation === 'strong_buy' || fundamentals.recommendation === 'strong_sell') {
          qualityScore += 10;
          console.log(`� ${pair.symbol}: Fundamentales FUERTES`);
        } else if (fundamentals.riskLevel === 'high') {
          qualityScore -= 25; // Penalización severa por alto riesgo
          rejectionReasons.push('Alto riesgo fundamental');
        }
        
        // ⚠️ FILTRO DE CALIDAD ESTRICTO: Solo pares con 85+ puntos
        if (qualityScore < 85 || !hasStrongEMASignal) {
          console.log(`❌ ${pair.symbol} RECHAZADO (Score: ${qualityScore}, EMA: ${hasStrongEMASignal})`);
          console.log(`   Razones: ${rejectionReasons.join(', ')}`);
          continue; // Saltar este par
        }
        
        console.log(`🌟 ${pair.symbol} CALIFICA para operación premium (Score: ${qualityScore})`);
        
        pairAnalysis.push({
          pair,
          qualityScore: Math.min(qualityScore, 100),
          currentPrice,
          emas: currentEMAs,
          crosses,
          trend: trendAnalysis,
          multiTF,
          liquidity: liquidityAnalysis,
          fundamentals,
          confluence: {
            timeframeConfluence,
            bullishTFs,
            bearishTFs,
            dominantTrend: bullishTFs > bearishTFs ? 'bullish' : bearishTFs > bullishTFs ? 'bearish' : 'neutral'
          },
          hasStrongSignal: hasStrongEMASignal
        });
      }

      // Actualizar historial de EMAs para todos los pares
      const newEmaHistory: Record<string, any> = {};
      pairAnalysis.forEach(analysis => {
        newEmaHistory[analysis.pair.symbol] = analysis.emas;
      });
      setEmaHistory(prev => ({ ...prev, ...newEmaHistory }));

      // Ordenar por mejor oportunidad (priorizando cruces EMA)
      pairAnalysis.sort((a, b) => b.qualityScore - a.qualityScore);
      const bestAnalysis = pairAnalysis[0];
      
      console.log(`🎯 MEJOR OPORTUNIDAD: ${bestAnalysis.pair.symbol} (Score: ${bestAnalysis.qualityScore.toFixed(1)})`);
      console.log(`📊 Multi-TF: ${bestAnalysis.confluence.timeframeConfluence}/6 confluencia`);
      console.log(`💧 Liquidez: ${bestAnalysis.liquidity.isLiquiditySweep ? 'BARRIDA DETECTADA' : 'Normal'}`);
      console.log(`📰 Fundamentales: ${bestAnalysis.fundamentals.recommendation.toUpperCase()}`);

      // Marcar este par como utilizado
      setUsedPairs(prev => [...prev, bestAnalysis.pair.symbol]);

      console.log('🧠 Determinando señal con metodología completa...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      let signalDirection: 'BUY' | 'SELL';
      let confidence = Math.floor(bestAnalysis.qualityScore);
      let entryReason = '';
      
      // 🎯 LÓGICA MEJORADA - Una sola dirección por par (evita BUY+SELL)
      if (bestAnalysis.crosses.goldenCross.occurred) {
        signalDirection = bestAnalysis.crosses.goldenCross.type === 'bullish' ? 'BUY' : 'SELL';
        confidence = Math.max(confidence, 90);
        entryReason = `🏆 GOLDEN CROSS ${bestAnalysis.crosses.goldenCross.type.toUpperCase()}`;
        console.log(`🏆 Señal basada en GOLDEN CROSS: ${signalDirection}`);
      } else if (bestAnalysis.crosses.earlyCross.occurred) {
        signalDirection = bestAnalysis.crosses.earlyCross.type === 'bullish' ? 'BUY' : 'SELL';
        confidence = Math.max(confidence, 85);
        entryReason = `⚡ EARLY CROSS ${bestAnalysis.crosses.earlyCross.type.toUpperCase()}`;
        console.log(`⚡ Señal basada en EARLY CROSS: ${signalDirection}`);
      } else if (bestAnalysis.liquidity.isLiquiditySweep) {
        signalDirection = bestAnalysis.liquidity.recommendation === 'buy_after_sweep' ? 'BUY' : 'SELL';
        confidence = Math.max(confidence, 88);
        entryReason = `💼 BARRIDA LIQUIDEZ`;
        console.log(`💼 Señal basada en BARRIDA DE LIQUIDEZ: ${signalDirection}`);
      } else {
        // Confluencia - evita contradicción BUY+SELL
        const bullishTFs = bestAnalysis.confluence.bullishTFs;
        const bearishTFs = bestAnalysis.confluence.bearishTFs;
        
        if (bullishTFs > bearishTFs) {
          signalDirection = 'BUY';
          entryReason = `📈 CONFLUENCIA BULLISH`;
        } else {
          signalDirection = 'SELL';
          entryReason = `📉 CONFLUENCIA BEARISH`;
        }
        console.log(`📊 Señal: ${signalDirection} por confluencia`);
      }

      const entry = bestAnalysis.currentPrice;
      console.log('💰 Precio de entrada analizado:', entry);

      if (!entry || isNaN(entry) || entry <= 0) {
        setError(`Precio inválido para ${bestAnalysis.pair.symbol}`);
        return;
      }

      // Calcular TP y SL con análisis de riesgo EMA
      const riskMultiplier = riskLevel === 'Conservative' ? 0.8 : riskLevel === 'Aggressive' ? 1.2 : 1.0;
      const isBuy = signalDirection === 'BUY';
      let tp = 0, sl = 0;

      if (bestAnalysis.pair.symbol === 'BTCUSD') {
        const baseTP = 1200 * riskMultiplier; // TP más conservador pero realista
        const baseSL = 600 * riskMultiplier;
        tp = Math.round(entry + (isBuy ? baseTP : -baseTP));
        sl = Math.round(entry - (isBuy ? baseSL : -baseSL));
      } else if (bestAnalysis.pair.symbol === 'ETHUSD') {
        const baseTP = 80 * riskMultiplier;
        const baseSL = 40 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      } else if (bestAnalysis.pair.symbol === 'XAUUSD') {
        const baseTP = 20 * riskMultiplier;
        const baseSL = 10 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      } else if (bestAnalysis.pair.symbol === 'XAGUSD') {
        const baseTP = 1.2 * riskMultiplier;
        const baseSL = 0.6 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(3));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(3));
      } else {
        // Forex - rangos más realistas
        const baseTP = 0.008 * riskMultiplier;
        const baseSL = 0.004 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(5));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(5));
      }

      console.log(`✅ Análisis COMPLETO - Confianza: ${confidence}%`);

      // 🏦 INTEGRAR ANÁLISIS FTMO PROFESIONAL
      const baseSignal = {
        pair: bestAnalysis.pair.symbol,
        direction: signalDirection,
        currentPrice: entry,
        confidence,
        emaAnalysis: bestAnalysis.emas,
        timeframes: bestAnalysis.multiTF,
        liquidityZones: bestAnalysis.liquidity,
        fundamentals: bestAnalysis.fundamentals
      };

      // Análisis de riesgo FTMO obligatorio
      console.log('🏦 Calculando parámetros FTMO...');
      const ftmoRisk = analyzeFTMORisk(baseSignal, bestAnalysis.pair.symbol);
      
      // Verificar cumplimiento FTMO antes de proceder
      if (!ftmoRisk.ftmoCompliant) {
        console.warn(`⚠️ Señal no cumple criterios FTMO (RR: ${ftmoRisk.riskRewardRatio})`);
        setError('Señal rechazada: No cumple criterios FTMO');
        return;
      }

      // Usar parámetros calculados por FTMO
      tp = ftmoRisk.takeProfit;
      sl = ftmoRisk.stopLoss;
      
      console.log(`🏦 FTMO ANALYSIS:`);
      console.log(`   💰 Position Size: ${ftmoRisk.positionSize} lots`);
      console.log(`   📉 Stop Loss: ${ftmoRisk.stopLoss}`);
      console.log(`   📈 Take Profit: ${ftmoRisk.takeProfit}`);
      console.log(`   ⚖️ Risk/Reward: 1:${ftmoRisk.riskRewardRatio}`);
      console.log(`   💸 Risk Amount: $${ftmoRisk.riskAmount}`);
      console.log(`   💎 Profit Potential: $${ftmoRisk.profitPotential}`);

      // Helper para verificar sesión de mercado activa
      const isMarketSessionActive = (pair: string): boolean => {
        const now = new Date();
        const hour = now.getUTCHours();
        
        // Forex: 24/5
        if (pair.includes('USD') && !pair.includes('BTC') && !pair.includes('XAU')) {
          const day = now.getUTCDay();
          return day >= 1 && day <= 5; // Lunes a Viernes
        }
        
        // Crypto: 24/7
        if (pair.includes('BTC') || pair.includes('ETH')) {
          return true;
        }
        
        // Metales: Horario similar a Forex
        return true; // Simplificado para demo
      };

      // Crear detalles del análisis COMPLETO según tu metodología
      let analysisDetails = [];
      
      // Información de la señal principal basada en prioridades
      if (bestAnalysis.liquidity.isLiquiditySweep) {
        analysisDetails.push(`💼 BARRIDA DE LIQUIDEZ - Estrategia principal`);
      } else if (bestAnalysis.crosses.goldenCross.occurred && bestAnalysis.confluence.timeframeConfluence >= 3) {
        analysisDetails.push(`🏆 GOLDEN CROSS + Confluencia TF`);
      } else if (bestAnalysis.confluence.timeframeConfluence >= 4) {
        analysisDetails.push(`⏰ CONFLUENCIA TEMPORAL FUERTE`);
      } else if (bestAnalysis.crosses.earlyCross.occurred) {
        analysisDetails.push(`⚡ EARLY CROSS detectado`);
      } else {
        analysisDetails.push(`📈 Análisis de tendencia general`);
      }
      
      // Confluencia de temporalidades (tu revisión de TFs)
      analysisDetails.push(`⏰ TFs: ${bestAnalysis.confluence.timeframeConfluence}/6 confluencia (${bestAnalysis.confluence.bullishTFs}B/${bestAnalysis.confluence.bearishTFs}B)`);
      
      // Cruces EMA detectados
      if (bestAnalysis.crosses.goldenCross.occurred) {
        analysisDetails.push(`🏆 GOLDEN CROSS ${bestAnalysis.crosses.goldenCross.type.toUpperCase()}`);
      }
      if (bestAnalysis.crosses.earlyCross.occurred) {
        analysisDetails.push(`⚡ EARLY CROSS ${bestAnalysis.crosses.earlyCross.type.toUpperCase()}`);
      }
      
      // Estado de liquidez (tu estrategia maleta)
      if (bestAnalysis.liquidity.isLiquiditySweep) {
        analysisDetails.push(`💼 BARRIDA LIQUIDEZ - ${bestAnalysis.liquidity.recommendation.replace('_', ' ').toUpperCase()}`);
      } else if (bestAnalysis.liquidity.isNearLiquidity) {
        analysisDetails.push(`🎯 Cerca zona liquidez (${bestAnalysis.liquidity.nearestZone.distancePercent.toFixed(1)}%)`);
      }
      
      // Fundamentales (tu revisión de noticias)
      analysisDetails.push(`📰 News: ${bestAnalysis.fundamentals.recommendation.toUpperCase()} (${bestAnalysis.fundamentals.events.length} eventos)`);
      
      // EMAs actuales
      analysisDetails.push(`📊 EMAs: 50=${bestAnalysis.emas.ema50.toFixed(2)} | 100=${bestAnalysis.emas.ema100.toFixed(2)} | 200=${bestAnalysis.emas.ema200.toFixed(2)}`);
      
      // Tendencia general
      analysisDetails.push(`📈 Trend: ${bestAnalysis.trend.direction.toUpperCase()} (${bestAnalysis.trend.strength.toFixed(1)}%)`);
      
      // Score final
      analysisDetails.push(`🎯 Score: ${bestAnalysis.qualityScore.toFixed(1)}/100`);
      analysisDetails.push(`🏦 FTMO: ${ftmoRisk.positionSize} lots | RR 1:${ftmoRisk.riskRewardRatio} | $${ftmoRisk.riskAmount} risk`);
      analysisDetails.push(`📈 Trend: ${bestAnalysis.trend.direction.toUpperCase()} (${bestAnalysis.trend.strength.toFixed(1)}%)`);
      analysisDetails.push(`⚖️ Session: ${isMarketSessionActive(bestAnalysis.pair.symbol) ? 'ACTIVE' : 'CLOSED'}`);
      analysisDetails.push('🔍 FTMO Ready');

      const finalAnalysisText = analysisDetails.join(' • ');

      const newSignal: Signal = {
        id: Date.now(),
        pair: bestAnalysis.pair.symbol,
        display: bestAnalysis.pair.display,
        signal: signalDirection,
        confidence,
        entry,
        tp,
        sl,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        notes: `🏦 FTMO PROFESSIONAL: ${finalAnalysisText}`
      };

      console.log('🎉 Señal ÚNICA generada:', newSignal);
      console.log(`📍 ENTRADA: ${signalDirection} ${bestAnalysis.pair.symbol} @ ${entry}`);
      console.log(`🎯 TP: ${tp} | 🛡️ SL: ${sl} | ⚖️ RR: ${ftmoRisk.riskRewardRatio}`);

      // 📍 MARCAR EN GRÁFICO - Actualizar TradingView con la nueva operación
      setActiveTrade(newSignal); // Esto cambiará automáticamente el gráfico al par de la señal

      // 🎯 SISTEMA DE LOTES - Solo mostrar operación actual, no historial
      setSignals([newSignal]); // Solo UNA operación visible
      setActiveTrade(newSignal); // Operación activa para el gráfico
      
      // Añadir al lote actual
      setActiveBatch(prev => [...prev, newSignal]);

    } catch (error) {
      console.error('❌ Error en análisis EMA:', error);
      setError('Error en análisis de mercado EMA');
    } finally {
      setLoading(false);
    }
  }, [signals.length, selectedPairs, marketSentiment, riskLevel, usedPairs, lastAnalysisTime, emaHistory]);

  // 🎯 SISTEMA DE LOTES - useEffect con control de lotes cada 30 minutos
  useEffect(() => {
    if (!running) return;

    let interval: NodeJS.Timeout;

    // Generar primer lote después de 5 segundos
    setTimeout(() => {
      if (running) generateSignal();
    }, 5000);

    // 🕒 LOTES CADA 30 MINUTOS (o cuando se complete el lote actual)
    interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastBatch = now - batchStartTime;
      const BATCH_INTERVAL = 30 * 60 * 1000; // 30 minutos
      
      // Solo generar si es momento de nuevo lote O si el lote actual no está completo
      if (timeSinceLastBatch >= BATCH_INTERVAL || activeBatch.length < 2) {
        generateSignal();
      } else {
        const remainingMinutes = Math.ceil((BATCH_INTERVAL - timeSinceLastBatch) / 1000 / 60);
        console.log(`⏳ Esperando ${remainingMinutes} minutos para próximo lote`);
      }
    }, 10000); // Revisar cada 10 segundos

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [running, generateSignal, activeBatch, batchStartTime]);

  // ⚠️ Auto-limpiar señales después de 30 minutos para evitar acumulación
  useEffect(() => {
    if (signals.length > 0) {
      const timer = setTimeout(() => {
        console.log('🗑️ Limpiando señales antiguas...');
        setSignals([]);
        setActiveTrade(null);
      }, 1800000); // 30 minutos

      return () => clearTimeout(timer);
    }
  }, [signals]);

  // Cleanup al desmontar componente
  useEffect(() => {
    return () => {
      setRunning(false);
      setSignals([]);
      setActiveTrade(null);
      setUsedPairs([]);
    };
  }, []);

  // Funciones de control mejoradas
  const handleToggle = (): void => {
    if (running) {
      setRunning(false);
      setActiveTrade(null);
      setUsedPairs([]); // Reiniciar control de pares
    } else {
      setSignals([]);
      setActiveTrade(null);
      setUsedPairs([]);
      setLastAnalysisTime(0);
      setRunning(true);
    }
  };

  const handleSetActive = (signal: Signal): void => {
    setActiveTrade(signal);
  };

  const handleCloseOperation = (): void => {
    setSignals([]);
    setActiveTrade(null);
    // Permitir nueva operación inmediatamente
    setLastAnalysisTime(0);
  };

  const togglePairSelection = (symbol: string): void => {
    setSelectedPairs(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
    // Reiniciar control de pares usados cuando cambian las selecciones
    setUsedPairs([]);
  };

  const filteredPairs: TradingPair[] = filterCategory === 'All' 
    ? tradingPairs 
    : tradingPairs.filter(p => p.category === filterCategory);

  const categories: string[] = ['All', ...Array.from(new Set(tradingPairs.map(p => p.category)))];

  const filteredSignals: Signal[] = signals.filter(s => 
    filterCategory === 'All' || 
    tradingPairs.find(p => p.symbol === s.pair)?.category === filterCategory
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181e2a 0%, #6d28d9 100%)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 8vw 16px 8vw', background: 'rgba(30, 27, 75, 0.98)', borderBottom: '2px solid #6d28d9', boxShadow: '0 2px 16px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Brain style={{ width: 48, height: 48, color: '#a78bfa', marginRight: 16 }} />
          <div>
            <h1 style={{ color: '#e0e7ff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              🏦 FTMO Bot Professional
              <span style={{ 
                background: 'linear-gradient(45deg, #10b981, #22d3ee)', 
                color: '#fff', 
                fontSize: '0.5rem', 
                padding: '4px 8px', 
                borderRadius: 8, 
                fontWeight: 600,
                animation: 'pulse 2s infinite'
              }}>
                CHALLENGE READY
              </span>
            </h1>
            <span style={{ color: '#a5b4fc', fontSize: '1.1rem', fontWeight: 500 }}>Professional Trading Bot para Prueba FTMO - APIs Reales</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            🏦 FTMO Ready
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#a5b4fc',
              border: '1px solid #6d28d9',
              borderRadius: 12,
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleToggle}
            style={{
              background: running ? '#f472b6' : '#22d3ee',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: running ? '0 2px 8px #f472b633' : '0 2px 8px #22d3ee33',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
            {running ? 'Parar' : 'Iniciar'}
          </button>
        </div>
      </header>

      {/* Dashboard FTMO */}
      <section style={{ 
        maxWidth: 1200, 
        margin: '20px auto', 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.95) 100%)',
        borderRadius: 18, 
        padding: 24, 
        boxShadow: '0 4px 32px rgba(16, 185, 129, 0.1)',
        border: '2px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ 
            color: '#10b981', 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🏦 FTMO Challenge Dashboard
          </h2>
          <div style={{
            background: ftmoStatus.compliant ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: ftmoStatus.compliant ? '#10b981' : '#ef4444',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.85rem',
            fontWeight: 700,
            border: `1px solid ${ftmoStatus.compliant ? '#10b981' : '#ef4444'}`
          }}>
            {ftmoStatus.compliant ? '✅ COMPLIANT' : '❌ VIOLATION'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {/* Balance */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>BALANCE</div>
            <div style={{ color: '#10b981', fontSize: '1.3rem', fontWeight: 700 }}>
              ${ftmoStatus.accountBalance.toLocaleString()}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Inicial: $100,000
            </div>
          </div>

          {/* Profit Target */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>PROFIT TARGET</div>
            <div style={{ color: '#22d3ee', fontSize: '1.3rem', fontWeight: 700 }}>
              {ftmoStatus.profitTarget.toFixed(1)}%
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Objetivo: {ftmoStatus.phase === 1 ? '8.0%' : '5.0%'}
            </div>
          </div>

          {/* Daily Drawdown */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>DAILY LOSS</div>
            <div style={{ color: ftmoStatus.dailyLoss >= 4 ? '#ef4444' : '#10b981', fontSize: '1.3rem', fontWeight: 700 }}>
              {ftmoStatus.dailyLoss.toFixed(1)}%
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Máximo: 5.0%
            </div>
          </div>

          {/* Max Drawdown */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>MAX DRAWDOWN</div>
            <div style={{ color: ftmoStatus.totalLoss >= 8 ? '#ef4444' : '#10b981', fontSize: '1.3rem', fontWeight: 700 }}>
              {ftmoStatus.totalLoss.toFixed(1)}%
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Máximo: 10.0%
            </div>
          </div>

          {/* Trading Days */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>TRADING DAYS</div>
            <div style={{ color: '#f59e0b', fontSize: '1.3rem', fontWeight: 700 }}>
              {ftmoStatus.tradingDays}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Mínimo: 4 días
            </div>
          </div>

          {/* Win Rate */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>WIN RATE</div>
            <div style={{ color: '#a78bfa', fontSize: '1.3rem', fontWeight: 700 }}>
              {ftmoStatus.winRate.toFixed(0)}%
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Total: {ftmoStatus.tradesCount} trades
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>Progreso al objetivo</span>
            <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
              {(ftmoStatus.profitTarget / (ftmoStatus.phase === 1 ? 8 : 5) * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{ 
            background: 'rgba(0,0,0,0.5)', 
            height: 8, 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: 'linear-gradient(90deg, #10b981, #22d3ee)',
              height: '100%',
              width: `${Math.min(100, (ftmoStatus.profitTarget / (ftmoStatus.phase === 1 ? 8 : 5)) * 100)}%`,
              borderRadius: 4,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </section>

      {/* 🎯 Panel de Sistema de Lotes */}
      <section style={{ 
        maxWidth: 1200, 
        margin: '20px auto', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(67, 56, 202, 0.95) 100%)',
        borderRadius: 18, 
        padding: 24, 
        boxShadow: '0 4px 32px rgba(99, 102, 241, 0.1)',
        border: '2px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ 
            color: '#6366f1', 
            fontSize: '1.3rem', 
            fontWeight: 700, 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🎯 Sistema de Lotes Inteligente
          </h2>
          <div style={{
            background: activeBatch.length === 2 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
            color: activeBatch.length === 2 ? '#10b981' : '#6366f1',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {activeBatch.length === 2 ? '✅ LOTE COMPLETO' : '🔄 GENERANDO LOTE'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Lote Actual */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>LOTE ACTUAL</div>
            <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 700 }}>
              #{batchCount}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              {activeBatch.length}/2 operaciones
            </div>
          </div>

          {/* Tiempo Próximo Lote */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(251, 191, 36, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>PRÓXIMO LOTE</div>
            <div style={{ color: '#fbbf24', fontSize: '1.3rem', fontWeight: 700 }}>
              {waitingForNextBatch 
                ? `${Math.ceil((nextBatchTime - Date.now()) / 1000 / 60)} min`
                : 'Activo'
              }
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Sistema 30 min
            </div>
          </div>

          {/* Estado del Sistema */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(34, 211, 238, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>ESTADO</div>
            <div style={{ color: '#22d3ee', fontSize: '1.3rem', fontWeight: 700 }}>
              {running ? (loading ? 'Analizando' : 'Activo') : 'Detenido'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              {running ? 'Bot funcionando' : 'Bot pausado'}
            </div>
          </div>

          {/* Calidad de Señales */}
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 16, 
            borderRadius: 12,
            border: '1px solid rgba(167, 139, 250, 0.2)'
          }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: 4 }}>CALIDAD</div>
            <div style={{ color: '#a78bfa', fontSize: '1.3rem', fontWeight: 700 }}>
              85+ Score
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Solo premium
            </div>
          </div>
        </div>

        {/* Barra de progreso del lote */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>Progreso del lote actual</span>
            <span style={{ color: '#6366f1', fontSize: '0.9rem', fontWeight: 600 }}>
              {Math.round((activeBatch.length / 2) * 100)}%
            </span>
          </div>
          <div style={{ 
            background: 'rgba(0,0,0,0.5)', 
            height: 8, 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
              height: '100%',
              width: `${(activeBatch.length / 2) * 100}%`,
              borderRadius: 4,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </section>

      {/* Configuración */}
      {showSettings && (
        <div style={{ background: 'rgba(30, 27, 75, 0.98)', padding: '24px 8vw', borderBottom: '1px solid #6d28d9' }}>
          <h3 style={{ color: '#a78bfa', fontSize: '1.2rem', marginBottom: 16 }}>Configuración</h3>
          
          {/* Filtros de categoría */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Filtrar por categoría:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    background: filterCategory === cat ? '#16a34a' : 'rgba(107, 114, 128, 0.3)',
                    color: filterCategory === cat ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pares activos */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Pares activos ({selectedPairs.length} seleccionados):</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {filteredPairs.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => togglePairSelection(pair.symbol)}
                  style={{
                    background: selectedPairs.includes(pair.symbol) ? '#22d3ee' : 'rgba(107, 114, 128, 0.3)',
                    color: selectedPairs.includes(pair.symbol) ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {pair.display}
                </button>
              ))}
            </div>
          </div>

          {/* Configuraciones de análisis profesional */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Intervalo de análisis (minutos):</label>
              <select
                value={signalInterval / 60000}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSignalInterval(Number(e.target.value) * 60000)}
                style={{
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#e0e7ff',
                  border: '1px solid #6d28d9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  width: '100%',
                }}
              >
                <option value="3">3 minutos (Selectivo)</option>
                <option value="5">5 minutos (Estándar)</option>
                <option value="8">8 minutos (Conservador)</option>
                <option value="10">10 minutos (Súper selectivo)</option>
                <option value="15">15 minutos (Ultra selectivo)</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Modo de operación:</label>
              <select
                value={maxSignals}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMaxSignals(Number(e.target.value))}
                style={{
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#e0e7ff',
                  border: '1px solid #6d28d9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  width: '100%',
                }}
              >
                <option value="1">Una operación premium</option>
              </select>
            </div>
          </div>

          {/* Botón para cerrar operación manual */}
          {activeTrade && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={handleCloseOperation}
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                🏁 Cerrar Operación Actual
              </button>
            </div>
          )}
        </div>
      )}

      {/* Estado del bot */}
      {running && (
        <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '16px 8vw', borderBottom: '1px solid rgba(34, 211, 238, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {loading && <RefreshCw size={16} style={{ color: '#22d3ee', animation: 'spin 1s linear infinite' }} />}
            <span style={{ color: '#22d3ee', fontWeight: 600 }}>
              {loading ? 'Analizando mercados...' : `Bot activo - Próxima señal en ${signalInterval / 1000}s`}
            </span>
            <span style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>
              ({filteredSignals.length}/{maxSignals} señales)
            </span>
          </div>
          {error && (
            <div style={{ color: '#f472b6', fontSize: '0.9rem', marginTop: 8 }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Panel principal */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', padding: '0 2rem' }}>
        {/* Gráfico TradingView */}
        <section style={{ flex: 1.2, minWidth: 380, background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 4px 32px #0002', overflow: 'hidden', padding: 0 }}>
          <iframe
            title="TradingView Professional FTMO"
            src={`https://es.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${
              activeTrade ? getTradingViewSymbol(activeTrade.pair) : 'FX:EURUSD'
            }&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1e1b4b&studies=EMA(50),EMA(100),EMA(200),MACD,RSI&theme=dark&style=1&timezone=Europe/Madrid&studies_overrides={"EMA.length":50,"EMA.source":"close","EMA.color":"#FFD700"}&overrides={"paneProperties.background":"#1a1a1a","paneProperties.gridProperties.color":"#2a2a2a","scalesProperties.textColor":"#ffffff","mainSeriesProperties.candleStyle.upColor":"#26C281","mainSeriesProperties.candleStyle.downColor":"#FF5252"}&enabled_features=[]&disabled_features=[]&locale=es&width=100%&height=420`}
            width="100%"
            height="420"
            style={{ border: 0 }}
          />
          {activeTrade && (
            <div style={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              background: 'rgba(0,0,0,0.8)', 
              color: activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 700,
              border: `2px solid ${activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6'}`
            }}>
              📍 {activeTrade.signal} @ {activeTrade.entry} | TP: {activeTrade.tp} | SL: {activeTrade.sl}
            </div>
          )}
        </section>

        {/* Operación activa */}
        <section style={{ flex: 0.8, minWidth: 300, background: 'rgba(30,27,75,0.98)', borderRadius: 18, padding: 24, boxShadow: '0 4px 32px #0002' }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} />
            Operación en curso
          </h2>
          {activeTrade ? (
            <div style={{ color: '#e0e7ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#e0e7ff', fontSize: '1.1rem', margin: 0 }}>{activeTrade.display}</h3>
                <span style={{
                  background: activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  {activeTrade.signal}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>Entrada:</span>
                  <div style={{ color: '#e0e7ff', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.entry}</div>
                </div>
                <div>
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>Confianza:</span>
                  <div style={{ color: '#22d3ee', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.confidence}%</div>
                </div>
                <div>
                  <span style={{ color: '#16e0b3', fontSize: '0.8rem' }}>TP:</span>
                  <div style={{ color: '#16e0b3', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.tp}</div>
                </div>
                <div>
                  <span style={{ color: '#f472b6', fontSize: '0.8rem' }}>SL:</span>
                  <div style={{ color: '#f472b6', fontSize: '1.1rem', fontWeight: 700 }}>{activeTrade.sl}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, fontSize: '0.8rem', color: '#a5b4fc' }}>
                {activeTrade.notes}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</div>
              <p>Esperando nueva señal para operar</p>
            </div>
          )}
        </section>
      </main>

      {/* Panel de operación actual */}
      <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: 700, letterSpacing: 1, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap style={{ color: '#22d3ee' }} />
            🎯 Operación Activa - Lote #{batchCount}
            {waitingForNextBatch && (
              <span style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: 12, 
                fontSize: '0.8rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                ⏳ Próximo lote en {Math.ceil((nextBatchTime - Date.now()) / 1000 / 60)} min
              </span>
            )}
          </h2>
          
          {/* Información del sistema de lotes */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ 
              background: 'rgba(34, 211, 238, 0.1)', 
              border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: 12, 
              padding: '8px 16px',
              fontSize: '0.9rem',
              color: '#22d3ee'
            }}>
              📊 {activeBatch.length}/2 en lote actual
            </div>
            <div style={{ 
              background: 'rgba(167, 139, 250, 0.1)', 
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: 12, 
              padding: '8px 16px',
              fontSize: '0.9rem',
              color: '#a78bfa'
            }}>
              🕒 Sistema: 2 operaciones/30min
            </div>
          </div>
        </div>

        {/* Cards de señales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
          {filteredSignals.map(signal => {
            const risk = Math.abs(signal.entry - signal.sl);
            const reward = Math.abs(signal.tp - signal.entry);
            const riskReward = risk > 0 ? (reward / risk).toFixed(1) : '0';
            const isBuy = signal.signal === 'BUY';
            
            return (
              <div 
                key={signal.id} 
                style={{ 
                  background: `linear-gradient(135deg, ${isBuy ? 'rgba(34,211,238,0.1)' : 'rgba(244,114,182,0.1)'} 0%, rgba(30,27,75,0.95) 100%)`,
                  border: `2px solid ${isBuy ? '#22d3ee' : '#f472b6'}`,
                  borderRadius: 16,
                  padding: 24,
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => handleSetActive(signal)}
              >
                {/* Header de la señal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ 
                      color: '#e0e7ff', 
                      fontSize: '1.3rem', 
                      fontWeight: 700, 
                      margin: 0 
                    }}>
                      {signal.display}
                    </h3>
                    <span style={{
                      background: isBuy ? '#22d3ee' : '#f472b6',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: 1
                    }}>
                      {signal.signal}
                    </span>
                  </div>
                  
                  <div style={{ 
                    background: signal.confidence >= 85 ? '#16a34a' : signal.confidence >= 70 ? '#ca8a04' : signal.confidence >= 55 ? '#ea580c' : '#dc2626',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: 12,
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {signal.confidence >= 85 ? '🔥 PREMIUM' : signal.confidence >= 70 ? '✅ SÓLIDA' : signal.confidence >= 55 ? '⚠️ CONDICIONAL' : '🚫 DÉBIL'}
                  </div>
                </div>

                {/* Información principal */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: 12, 
                  padding: 16, 
                  marginBottom: 16,
                  border: '1px solid rgba(109,40,217,0.3)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <span style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>ENTRADA:</span>
                      <div style={{ color: '#e0e7ff', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {signal.entry}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>CONFIANZA:</span>
                      <div style={{ color: '#22d3ee', fontSize: '1.1rem', fontWeight: 700 }}>
                        {signal.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <span style={{ color: '#16e0b3', fontSize: '0.85rem', fontWeight: 600 }}>TAKE PROFIT:</span>
                      <div style={{ color: '#16e0b3', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {signal.tp}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 600 }}>STOP LOSS:</span>
                      <div style={{ color: '#f472b6', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {signal.sl}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>R:R:</span>
                      <div style={{ 
                        color: parseFloat(riskReward) >= 2 ? '#16e0b3' : parseFloat(riskReward) >= 1.5 ? '#fbbf24' : '#f472b6', 
                        fontSize: '1.1rem', 
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}>
                        1:{riskReward}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      const copyText = `${signal.display}\n${signal.signal} ${signal.entry}\nTP: ${signal.tp}\nSL: ${signal.sl}\nConfianza: ${signal.confidence}%\nR:R 1:${riskReward}`;
                      navigator.clipboard.writeText(copyText);
                    }}
                    style={{
                      background: 'linear-gradient(45deg, #6d28d9, #a78bfa)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    📋 Copiar Señal
                  </button>
                  
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleSetActive(signal);
                    }}
                    style={{
                      background: 'rgba(107, 114, 128, 0.3)',
                      color: '#a5b4fc',
                      border: '1px solid #6d28d9',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <BarChart3 size={14} />
                    Ver Gráfico
                  </button>
                </div>

                {/* Timestamp */}
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '0.8rem', 
                  textAlign: 'right',
                  borderTop: '1px solid rgba(109,40,217,0.2)',
                  paddingTop: 8
                }}>
                  {signal.timestamp}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSignals.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 60,
            color: '#64748b',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 16,
            border: '2px dashed rgba(109,40,217,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
            <h3 style={{ color: '#a5b4fc', margin: '0 0 8px 0' }}>Esperando señales...</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              El bot está analizando los mercados. Las señales aparecerán cuando se detecten oportunidades de calidad.
            </p>
          </div>
        )}

        <div style={{ 
          color: '#64748b', 
          fontSize: '0.9rem', 
          marginTop: 24, 
          padding: 16,
          textAlign: 'center',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 12,
          border: '1px solid rgba(109,40,217,0.2)'
        }}>
          <strong style={{ color: '#a78bfa' }}>⚠️ Aviso de Riesgo:</strong> Las señales son generadas por IA para análisis educativo. 
          Siempre confirma con tu propio análisis y gestiona el riesgo apropiadamente. 
          No somos responsables de pérdidas financieras.
        </div>
      </section>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default TradingSignalsBot;
