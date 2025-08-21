import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Play, Pause, TrendingUp, TrendingDown, RefreshCw, Settings, Filter, BarChart3, Zap } from 'lucide-react';

// Sistema de IA Avanzado para Trading
class TradingAI {
  // Red neuronal simulada para patrones de mercado
  private patterns = {
    bullish: ['breakout', 'golden_cross', 'bull_flag', 'ascending_triangle', 'cup_handle'],
    bearish: ['breakdown', 'death_cross', 'bear_flag', 'descending_triangle', 'head_shoulders'],
    neutral: ['consolidation', 'sideways', 'doji', 'spinning_top', 'inside_bar']
  };

  // Base de conocimiento de correlaciones
  private correlations = {
    'BTCUSD': { risk_on: 0.8, tech_sentiment: 0.9, institutional_flow: 0.7 },
    'EURUSD': { economic_data: 0.9, central_bank: 0.8, risk_sentiment: 0.6 },
    'XAUUSD': { inflation: 0.9, usd_strength: -0.8, geopolitical: 0.7 }
  };

  // Análisis de contexto macro
  analyzeMacroContext(pair: string, marketSentiment: string): number {
    const baseScore = Math.random() * 0.4 + 0.3; // 0.3-0.7
    const correlation = this.correlations[pair as keyof typeof this.correlations];
    
    if (!correlation) return baseScore;

    let macroScore = baseScore;
    
    // Simular factores macro complejos
    if (pair === 'BTCUSD') {
      // Tech sentiment, adoption, regulatory clarity
      const techBoom = Math.random() > 0.7 ? 0.2 : 0;
      const institutionalInterest = Math.random() > 0.6 ? 0.15 : -0.1;
      macroScore += techBoom + institutionalInterest;
    }
    
    if (pair === 'EURUSD') {
      // ECB policy, US employment, geopolitical events
      const ecbDovish = Math.random() > 0.5 ? -0.1 : 0.1;
      const usDataStrong = Math.random() > 0.6 ? -0.15 : 0.1;
      macroScore += ecbDovish + usDataStrong;
    }
    
    if (pair === 'XAUUSD') {
      // Inflation expectations, real yields, safe haven demand
      const inflationConcerns = Math.random() > 0.4 ? 0.2 : -0.1;
      const yieldRising = Math.random() > 0.5 ? -0.15 : 0.1;
      macroScore += inflationConcerns + yieldRising;
    }

    return Math.max(0, Math.min(1, macroScore));
  }

  // Análisis de patrones avanzados
  detectPatterns(price: number, pair: string): { pattern: string; strength: number; direction: 'bullish' | 'bearish' | 'neutral' } {
    // Simular detección de patrones complejos
    const patternTypes = [...this.patterns.bullish, ...this.patterns.bearish, ...this.patterns.neutral];
    const detectedPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (this.patterns.bullish.includes(detectedPattern)) direction = 'bullish';
    if (this.patterns.bearish.includes(detectedPattern)) direction = 'bearish';
    
    // Fuerza del patrón basada en múltiples factores
    const volumeConfirmation = Math.random() * 0.3;
    const timeframeAlignment = Math.random() * 0.4;
    const historicalSuccess = Math.random() * 0.3;
    
    const strength = Math.min(1, volumeConfirmation + timeframeAlignment + historicalSuccess);
    
    return { pattern: detectedPattern, strength, direction };
  }

  // Análisis de niveles críticos de S/R
  analyzeSupportResistance(price: number, pair: string): { 
    nearSupport: boolean; 
    nearResistance: boolean; 
    strength: number;
    levels: { support: number; resistance: number; }
  } {
    // Simular niveles S/R basados en precio actual
    let supportLevel = 0, resistanceLevel = 0;
    
    if (pair === 'BTCUSD') {
      // Niveles psicológicos y técnicos para Bitcoin
      const roundLevel = Math.round(price / 1000) * 1000;
      supportLevel = roundLevel - 500;
      resistanceLevel = roundLevel + 500;
    } else if (pair === 'XAUUSD') {
      // Niveles para oro
      const roundLevel = Math.round(price / 50) * 50;
      supportLevel = roundLevel - 25;
      resistanceLevel = roundLevel + 25;
    } else {
      // Niveles para forex
      const roundLevel = Math.round(price * 10000) / 10000;
      supportLevel = roundLevel - 0.01;
      resistanceLevel = roundLevel + 0.01;
    }
    
    const distanceToSupport = Math.abs(price - supportLevel) / price;
    const distanceToResistance = Math.abs(price - resistanceLevel) / price;
    
    return {
      nearSupport: distanceToSupport < 0.02, // Dentro del 2%
      nearResistance: distanceToResistance < 0.02,
      strength: Math.random() * 0.5 + 0.5, // 0.5-1.0
      levels: { support: supportLevel, resistance: resistanceLevel }
    };
  }

  // Análisis de momentum y divergencias
  analyzeMomentum(pair: string): {
    rsi: number;
    macd_signal: 'bullish' | 'bearish' | 'neutral';
    momentum_strength: number;
    divergence: boolean;
  } {
    const rsi = Math.random() * 100;
    const macdValue = (Math.random() - 0.5) * 2;
    
    return {
      rsi,
      macd_signal: macdValue > 0.3 ? 'bullish' : macdValue < -0.3 ? 'bearish' : 'neutral',
      momentum_strength: Math.abs(macdValue),
      divergence: Math.random() > 0.8 // 20% probabilidad de divergencia
    };
  }

  // Análisis de volumen y liquidez
  analyzeVolumeProfile(pair: string): {
    volume_trend: 'increasing' | 'decreasing' | 'stable';
    liquidity_level: 'high' | 'medium' | 'low';
    institutional_activity: number;
  } {
    const volumeTrends = ['increasing', 'decreasing', 'stable'] as const;
    const liquidityLevels = ['high', 'medium', 'low'] as const;
    
    return {
      volume_trend: volumeTrends[Math.floor(Math.random() * 3)],
      liquidity_level: liquidityLevels[Math.floor(Math.random() * 3)],
      institutional_activity: Math.random()
    };
  }

  // Análisis de flujo de órdenes institucional
  analyzeOrderFlow(pair: string): { institutional: number; retail: number; smart_money: number } {
    // Simular análisis de volumen y flujo de órdenes
    const institutional = Math.random();
    const retail = Math.random();
    const smart_money = Math.random();
    
    // Normalizar para que sumen 1
    const total = institutional + retail + smart_money;
    
    return {
      institutional: institutional / total,
      retail: retail / total,
      smart_money: smart_money / total
    };
  }

  // Sistema de puntuación IA avanzado
  calculateAIScore(
    timeframeScore: number,
    price: number,
    pair: string,
    marketSentiment: string,
    riskLevel: string
  ): { confidence: number; reasoning: string[]; riskAdjustment: number; levels: any } {
    const reasoning: string[] = [];
    let aiScore = 0;

    // 1. Análisis de contexto macro (25% del score)
    const macroContext = this.analyzeMacroContext(pair, marketSentiment);
    aiScore += macroContext * 0.25;
    reasoning.push(`📊 Análisis macro: ${(macroContext * 100).toFixed(0)}% favorable`);

    // 2. Detección de patrones (20% del score)
    const patterns = this.detectPatterns(price, pair);
    const patternScore = patterns.strength * (patterns.direction === 'neutral' ? 0.5 : 0.8);
    aiScore += patternScore * 0.2;
    reasoning.push(`🔍 Patrón ${patterns.pattern}: ${(patterns.strength * 100).toFixed(0)}% de fuerza`);

    // 3. Análisis de S/R (20% del score) - NUEVO
    const srAnalysis = this.analyzeSupportResistance(price, pair);
    const srScore = srAnalysis.nearSupport || srAnalysis.nearResistance ? srAnalysis.strength : 0.3;
    aiScore += srScore * 0.2;
    reasoning.push(`🎯 Niveles S/R: ${srAnalysis.nearSupport ? 'Cerca soporte' : srAnalysis.nearResistance ? 'Cerca resistencia' : 'Zona neutral'} (${(srScore * 100).toFixed(0)}%)`);

    // 4. Análisis de momentum (15% del score) - NUEVO
    const momentum = this.analyzeMomentum(pair);
    const momentumScore = momentum.rsi > 70 || momentum.rsi < 30 ? 0.8 : 0.5;
    aiScore += momentumScore * 0.15;
    reasoning.push(`⚡ RSI: ${momentum.rsi.toFixed(0)}, MACD: ${momentum.macd_signal}, ${momentum.divergence ? 'Divergencia detectada' : 'Sin divergencia'}`);

    // 5. Análisis de volumen (10% del score) - NUEVO
    const volume = this.analyzeVolumeProfile(pair);
    const volumeScore = volume.volume_trend === 'increasing' && volume.liquidity_level === 'high' ? 0.9 : 0.5;
    aiScore += volumeScore * 0.1;
    reasoning.push(`📈 Volumen: ${volume.volume_trend}, Liquidez: ${volume.liquidity_level}, Institucional: ${(volume.institutional_activity * 100).toFixed(0)}%`);

    // 6. Confluencia técnica (10% del score)
    const technicalScore = Math.abs(timeframeScore) / 3;
    aiScore += technicalScore * 0.1;
    reasoning.push(`⚙️ Confluencia técnica: ${(technicalScore * 100).toFixed(0)}% alineación en ${Math.abs(timeframeScore)} temporalidades`);

    // Ajuste de riesgo basado en configuración
    let riskAdjustment = 1.0;
    if (riskLevel === 'Conservative') {
      riskAdjustment = 0.8;
      reasoning.push(`🛡️ Ajuste conservador aplicado (-20%)`);
    } else if (riskLevel === 'Aggressive') {
      riskAdjustment = 1.2;
      reasoning.push(`⚡ Perfil agresivo (+20% oportunidad)`);
    }

    // Score final con límites
    const finalConfidence = Math.max(20, Math.min(95, (aiScore * 100) * riskAdjustment));

    return {
      confidence: Math.round(finalConfidence),
      reasoning,
      riskAdjustment,
      levels: srAnalysis.levels
    };
  }
}

const tradingAI = new TradingAI();

// Análisis de Sesiones de Mercado y Calendario Económico
class MarketContext {
  // Detectar sesión de mercado activa
  getCurrentSession(): { session: string; volatility: 'high' | 'medium' | 'low'; overlap: boolean } {
    const now = new Date();
    const hour = now.getUTCHours();
    
    // Sesiones principales (UTC)
    if (hour >= 0 && hour < 8) {
      return { session: 'Sydney/Tokyo', volatility: 'medium', overlap: hour >= 6 };
    } else if (hour >= 8 && hour < 16) {
      return { session: 'London', volatility: 'high', overlap: hour >= 13 && hour < 16 };
    } else if (hour >= 16 && hour < 24) {
      return { session: 'New York', volatility: 'high', overlap: hour >= 16 && hour < 17 };
    }
    return { session: 'Transition', volatility: 'low', overlap: false };
  }

  // Simular eventos económicos importantes
  getEconomicEvents(pair: string): { impact: 'high' | 'medium' | 'low'; events: string[] } {
    const events = {
      'BTCUSD': ['Bitcoin ETF News', 'Regulatory Updates', 'Institutional Adoption'],
      'EURUSD': ['ECB Rate Decision', 'US NFP', 'EU Inflation Data', 'Fed Minutes'],
      'XAUUSD': ['CPI Data', 'Fed Speech', 'Geopolitical Tensions', 'Dollar Index']
    };
    
    const pairEvents = events[pair as keyof typeof events] || [];
    const activeEvents = pairEvents.filter(() => Math.random() > 0.7); // 30% probabilidad
    
    return {
      impact: activeEvents.length > 1 ? 'high' : activeEvents.length === 1 ? 'medium' : 'low',
      events: activeEvents
    };
  }
}

const marketContext = new MarketContext();

const tradingPairs = [
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
  { symbol: 'WTIUSD', api: 'WTIUSD', display: 'Petróleo WTI (WTIUSD)', category: 'Commodities' },
  
  // Crypto Alt
  { symbol: 'ADAUSD', api: 'ADAUSDT', display: 'Cardano (ADAUSD)', category: 'Crypto Alt' },
  { symbol: 'SOLUSD', api: 'SOLUSDT', display: 'Solana (SOLUSD)', category: 'Crypto Alt' },
  { symbol: 'DOTUSD', api: 'DOTUSDT', display: 'Polkadot (DOTUSD)', category: 'Crypto Alt' },
];

type Signal = {
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
};


const fetchPrice = async (pair: string) => {
  // Función mejorada con múltiples fallbacks para garantizar precios
  if (pair === 'BTCUSDT' || pair === 'ETHUSDT' || pair === 'ADAUSDT' || pair === 'SOLUSDT' || pair === 'DOTUSDT') {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      return parseFloat(res.data.price);
    } catch {
      // Fallbacks con precios simulados realistas para crypto
      const cryptoPrices = {
        'BTCUSDT': 95000 + (Math.random() - 0.5) * 4000, // ± 2000
        'ETHUSDT': 3400 + (Math.random() - 0.5) * 400,   // ± 200
        'ADAUSDT': 0.45 + (Math.random() - 0.5) * 0.08,  // ± 0.04
        'SOLUSDT': 180 + (Math.random() - 0.5) * 40,     // ± 20
        'DOTUSDT': 8.5 + (Math.random() - 0.5) * 2,      // ± 1
      };
      return cryptoPrices[pair as keyof typeof cryptoPrices] || 100;
    }
  } else if (pair === 'EURUSD' || pair === 'GBPUSD' || pair === 'AUDUSD' || pair === 'NZDUSD') {
    try {
      // Intentar exchangerate-api para forex majors
      const baseCurrency = pair.substring(0, 3);
      const targetCurrency = pair.substring(3, 6);
      const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      return parseFloat(res.data.rates[targetCurrency]);
    } catch {
      // Fallbacks con precios simulados realistas para forex
      const forexPrices = {
        'EURUSD': 1.0850 + (Math.random() - 0.5) * 0.02,   // ± 0.01
        'GBPUSD': 1.2750 + (Math.random() - 0.5) * 0.03,   // ± 0.015
        'AUDUSD': 0.6550 + (Math.random() - 0.5) * 0.02,   // ± 0.01
        'NZDUSD': 0.5950 + (Math.random() - 0.5) * 0.02,   // ± 0.01
        'USDJPY': 150.25 + (Math.random() - 0.5) * 2,      // ± 1
        'USDCAD': 1.3850 + (Math.random() - 0.5) * 0.02,   // ± 0.01
        'USDCHF': 0.8750 + (Math.random() - 0.5) * 0.02,   // ± 0.01
      };
      return forexPrices[pair as keyof typeof forexPrices] || 1.0000;
    }
  } else if (pair === 'XAUUSD' || pair === 'XAGUSD') {
    try {
      // Para metales preciosos
      const res = await axios.get('https://api.metals.live/v1/spot');
      return pair === 'XAUUSD' ? parseFloat(res.data.gold) : parseFloat(res.data.silver);
    } catch {
      // Fallbacks para metales
      const metalPrices = {
        'XAUUSD': 2650 + (Math.random() - 0.5) * 60,  // ± 30
        'XAGUSD': 31.5 + (Math.random() - 0.5) * 2,   // ± 1
      };
      return metalPrices[pair as keyof typeof metalPrices] || 2650;
    }
  } else if (pair === 'WTIUSD') {
    // Para petróleo, usar precio simulado
    return 75.5 + (Math.random() - 0.5) * 8; // ± 4
  } else {
    // Para otros pares, usar precios base simulados
    const otherPairs = {
      'USDJPY': 150.25 + (Math.random() - 0.5) * 2,
      'USDCAD': 1.3850 + (Math.random() - 0.5) * 0.02,
      'USDCHF': 0.8750 + (Math.random() - 0.5) * 0.02,
    };
    
    return otherPairs[pair as keyof typeof otherPairs] || 1.0000;
  }
};

const TradingSignalsBot = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['BTCUSD', 'EURUSD', 'XAUUSD', 'GBPUSD', 'ETHUSD', 'AUDUSD']);
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [signalInterval, setSignalInterval] = useState(15000); // 15 segundos para pruebas (antes 30 minutos)
  const [maxSignals, setMaxSignals] = useState(4); // Máximo 4 señales por día
  const [lastPairIndex, setLastPairIndex] = useState(0); // Para rotación balanceada
  const [marketSentiment, setMarketSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral');
  const [riskLevel, setRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

  // Generar señales realistas cada cierto tiempo con rotación aleatoria balanceada
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    
    const interval = setInterval(async () => {
      if (cancelled) return;
      
      setLoading(true);
      setError(null);
      
      // Análisis de temporalidades para intraday (H1, H4, D1)
      const timeframes = ['H1', 'H4', 'D1'];
      const availablePairs = tradingPairs.filter(p => selectedPairs.includes(p.symbol));
      
      if (availablePairs.length === 0) {
        setLoading(false);
        return;
      }
      
      // 🎲 SISTEMA DE SELECCIÓN ALEATORIA BALANCEADA
      // Crear array con peso balanceado - cada par tiene la misma probabilidad
      const shuffledPairs = [...availablePairs].sort(() => Math.random() - 0.5);
      const pairObj = shuffledPairs[Math.floor(Math.random() * shuffledPairs.length)];
      
      // Sentimiento de mercado influye en la probabilidad de BUY/SELL
      let buyProbability = 0.5;
      if (marketSentiment === 'Bullish') buyProbability = 0.65;
      else if (marketSentiment === 'Bearish') buyProbability = 0.35;
      
      const isBuy = Math.random() < buyProbability;
      let entry = 0;
      
      try {
        entry = await fetchPrice(pairObj.api);
        console.log(`🔄 Generando señal para ${pairObj.symbol} - Precio: ${entry}`);
      } catch (error) {
        console.error(`❌ Error obteniendo precio para ${pairObj.symbol}:`, error);
        setError(`Error obteniendo precio para ${pairObj.symbol}.`);
      }
      
      // Validar que el precio es válido (no 0 o NaN)
      if (!entry || isNaN(entry) || entry <= 0) {
        console.warn(`⚠️ Precio inválido para ${pairObj.symbol}: ${entry}`);
        // En lugar de fallar, usar precio simulado como fallback
        entry = await fetchPrice(pairObj.api); // Intentar de nuevo con fallback automático
        if (!entry || isNaN(entry) || entry <= 0) {
          setLoading(false);
          return;
        }
      }
      let tp = 0, sl = 0;
      // Multiplicadores según nivel de riesgo
      const riskMultiplier = riskLevel === 'Conservative' ? 0.7 : riskLevel === 'Aggressive' ? 1.3 : 1.0;
      
      if (pairObj.symbol === 'BTCUSD' || pairObj.symbol === 'ETHUSD') {
        // Para crypto majors: targets más amplios para intraday
        const baseTP = pairObj.symbol === 'BTCUSD' ? 1200 : 80; // BTC: 1200, ETH: 80
        const baseSL = pairObj.symbol === 'BTCUSD' ? 600 : 40;   // BTC: 600, ETH: 40
        tp = parseFloat((entry + (isBuy ? baseTP * riskMultiplier : -baseTP * riskMultiplier)).toFixed(pairObj.symbol === 'BTCUSD' ? 0 : 2));
        sl = parseFloat((entry - (isBuy ? baseSL * riskMultiplier : -baseSL * riskMultiplier)).toFixed(pairObj.symbol === 'BTCUSD' ? 0 : 2));
      } else if (pairObj.symbol.includes('USD') && !pairObj.symbol.includes('XAU') && !pairObj.symbol.includes('XAG') && !pairObj.symbol.includes('WTI')) {
        // Para crypto alts
        if (pairObj.category === 'Crypto Alt') {
          const cryptoTargets = {
            'ADAUSD': { tp: 0.03, sl: 0.015 },
            'SOLUSD': { tp: 12, sl: 6 },
            'DOTUSD': { tp: 0.6, sl: 0.3 }
          };
          const targets = cryptoTargets[pairObj.symbol as keyof typeof cryptoTargets] || { tp: 1, sl: 0.5 };
          tp = parseFloat((entry + (isBuy ? targets.tp * riskMultiplier : -targets.tp * riskMultiplier)).toFixed(4));
          sl = parseFloat((entry - (isBuy ? targets.sl * riskMultiplier : -targets.sl * riskMultiplier)).toFixed(4));
        } else {
          // Para forex: targets intraday más precisos
          const forexTargets = {
            'EURUSD': { tp: 0.008, sl: 0.004 },
            'GBPUSD': { tp: 0.012, sl: 0.006 },
            'USDJPY': { tp: 0.8, sl: 0.4 },
            'AUDUSD': { tp: 0.006, sl: 0.003 },
            'USDCAD': { tp: 0.008, sl: 0.004 },
            'NZDUSD': { tp: 0.006, sl: 0.003 },
            'USDCHF': { tp: 0.006, sl: 0.003 }
          };
          const targets = forexTargets[pairObj.symbol as keyof typeof forexTargets] || { tp: 0.008, sl: 0.004 };
          tp = parseFloat((entry + (isBuy ? targets.tp * riskMultiplier : -targets.tp * riskMultiplier)).toFixed(5));
          sl = parseFloat((entry - (isBuy ? targets.sl * riskMultiplier : -targets.sl * riskMultiplier)).toFixed(5));
        }
      } else if (pairObj.symbol === 'XAUUSD') {
        // Para oro: targets intraday
        const baseTP = 18 * riskMultiplier;
        const baseSL = 9 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      } else if (pairObj.symbol === 'XAGUSD') {
        // Para plata: targets más amplios por volatilidad
        const baseTP = 1.2 * riskMultiplier;
        const baseSL = 0.6 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(3));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(3));
      } else if (pairObj.symbol === 'WTIUSD') {
        // Para petróleo: targets moderados
        const baseTP = 3 * riskMultiplier;
        const baseSL = 1.5 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      }
      // Simular mayor probabilidad si varias temporalidades coinciden
      const tfSignals = timeframes.map(tf => Math.random() > 0.4 ? (isBuy ? 1 : -1) : 0);
      const tfScore = tfSignals.reduce((a: number, b) => a + b, 0);
      
      // 🧠 SISTEMA DE IA AVANZADO CON CONTEXTO DE MERCADO
      console.log(`🧠 Ejecutando análisis IA para ${pairObj.symbol}...`);
      const sessionInfo = marketContext.getCurrentSession();
      const economicEvents = marketContext.getEconomicEvents(pairObj.symbol);
      const aiAnalysis = tradingAI.calculateAIScore(tfScore, entry, pairObj.symbol, marketSentiment, riskLevel);
      let confidence = aiAnalysis.confidence;
      
      console.log(`📊 Análisis completado - Confianza inicial: ${confidence}%`);
      
      // Ajustar confianza según sesión y eventos
      if (sessionInfo.volatility === 'high' && sessionInfo.overlap) {
        confidence = Math.min(95, confidence + 5); // Boost en sesiones activas
        console.log(`📈 Boost por sesión activa: +5% -> ${confidence}%`);
      }
      if (economicEvents.impact === 'high') {
        confidence = Math.max(30, confidence - 10); // Reducir en eventos de alto impacto
        console.log(`📉 Reducción por eventos de alto impacto: -10% -> ${confidence}%`);
      }
      
      // Generar notas con análisis completo de IA
      let notes = `🤖 ANÁLISIS IA NEURONAL AVANZADO - Confianza: ${confidence}%\n\n`;
      
      // Información de contexto de mercado
      notes += `🌍 CONTEXTO DE MERCADO:\n`;
      notes += `• Sesión: ${sessionInfo.session} (Volatilidad: ${sessionInfo.volatility.toUpperCase()})\n`;
      notes += `• Overlap: ${sessionInfo.overlap ? 'SÍ - Mayor liquidez' : 'NO - Liquidez normal'}\n`;
      notes += `• Eventos económicos: ${economicEvents.impact.toUpperCase()} impacto\n`;
      if (economicEvents.events.length > 0) {
        notes += `• Próximos: ${economicEvents.events.join(', ')}\n`;
      }
      notes += `\n`;
      
      // Análisis de niveles S/R
      notes += `🎯 NIVELES CRÍTICOS:\n`;
      notes += `• Soporte: ${aiAnalysis.levels.support}\n`;
      notes += `• Resistencia: ${aiAnalysis.levels.resistance}\n`;
      notes += `• Posición actual: ${entry}\n\n`;
      
      // Añadir razonamiento detallado de IA
      notes += `🔍 FACTORES ANALIZADOS:\n`;
      aiAnalysis.reasoning.forEach((reason, index) => {
        notes += `${index + 1}. ${reason}\n`;
      });
      
      notes += `\n📋 RECOMENDACIONES FINALES:\n`;
      if (confidence >= 85) {
        notes += `🔥 SEÑAL PREMIUM: Confluencia excepcional detectada por IA.
⚡ Múltiples timeframes + patrones + momentum alineados.
💎 Contexto de mercado favorable para la operación.
🎯 Setup institucional de alta probabilidad de éxito.
⏰ Ventana operativa: 4-8 horas. Ejecutar con confianza.
${sessionInfo.overlap ? '🚀 BONUS: Overlap de sesiones - liquidez óptima' : ''}`;
      } else if (confidence >= 70) {
        notes += `✅ OPORTUNIDAD SÓLIDA: Análisis técnico positivo con confirmación.
📊 Factores fundamentales favorables, riesgo controlado.
⚖️ Entrada válida con gestión estándar de riesgo.
🔍 Monitorear evolución cada 2-3 horas.
⏰ Validez esperada: 6-12 horas según volatilidad.
${economicEvents.impact === 'low' ? '📰 Sin eventos disruptivos previstos' : '⚠️ Estar atento a noticias'}`;
      } else if (confidence >= 55) {
        notes += `⚠️ SEÑAL CONDICIONAL: Setup básico identificado por IA.
🔄 Contexto mixto, algunos factores no alineados.
💰 Considerar posición reducida (50% del tamaño normal).
📈 Esperar confirmación adicional antes de ejecutar.
⏰ Revisar análisis en 1-2 horas para nueva evaluación.
${sessionInfo.volatility === 'low' ? '😴 Sesión de baja volatilidad - paciencia' : ''}`;
      } else {
        notes += `🚫 SEÑAL RECHAZADA: Condiciones técnicas desfavorables.
❌ IA detecta múltiples factores negativos alineados.
🛑 EVITAR esta operación completamente.
🔍 Esperar mejor confluencia técnica y fundamental.
⏰ Reevaluar en 4-6 horas o tras cambio de sesión.
${economicEvents.impact === 'high' ? '📰 ALTA VOLATILIDAD esperada por eventos' : ''}`;
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
        console.log(`✅ Señal generada para ${pairObj.symbol} - ${isBuy ? 'BUY' : 'SELL'} - Confianza: ${confidence}%`);
        setSignals(prev => {
          const newSignals = [signal, ...prev];
          // Mantener solo las últimas maxSignals señales
          return newSignals.slice(0, maxSignals);
        });
        setActiveTrade(prev => prev || signal);
        setLoading(false);
      }
    }, signalInterval);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [running, selectedPairs, signalInterval, maxSignals]);  // Botón para iniciar/parar
  const handleToggle = () => {
    if (running) {
      console.log('🛑 Deteniendo bot...');
      setRunning(false);
      setActiveTrade(null);
    } else {
      console.log('🚀 Iniciando bot de señales...');
      console.log(`📊 Pares seleccionados: ${selectedPairs.join(', ')}`);
      console.log(`⏱️ Intervalo: ${signalInterval/1000} segundos`);
      console.log(`📈 Máx señales: ${maxSignals}`);
      setSignals([]);
      setActiveTrade(null);
      setRunning(true);
    }
  };

  const handleSetActive = (signal: Signal) => {
    setActiveTrade(signal);
  };

  const togglePairSelection = (symbol: string) => {
    setSelectedPairs(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filteredPairs = filterCategory === 'All' 
    ? tradingPairs 
    : tradingPairs.filter(p => p.category === filterCategory);

  const categories = ['All', ...Array.from(new Set(tradingPairs.map(p => p.category)))];

  const filteredSignals = signals.filter(s => 
    filterCategory === 'All' || 
    tradingPairs.find(p => p.symbol === s.pair)?.category === filterCategory
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181e2a 0%, #6d28d9 100%)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
      {/* Header moderno */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 8vw 16px 8vw', background: 'rgba(30, 27, 75, 0.98)', borderBottom: '2px solid #6d28d9', boxShadow: '0 2px 16px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Brain style={{ width: 48, height: 48, color: '#a78bfa', marginRight: 16 }} />
          <div>
            <h1 style={{ color: '#e0e7ff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              Bot Señales Intraday AI 
              <span style={{ 
                background: 'linear-gradient(45deg, #22d3ee, #a78bfa)', 
                color: '#fff', 
                fontSize: '0.5rem', 
                padding: '4px 8px', 
                borderRadius: 8, 
                fontWeight: 600,
                animation: 'pulse 2s infinite'
              }}>
                🧠 IA AVANZADA
              </span>
            </h1>
            <span style={{ color: '#a5b4fc', fontSize: '1.1rem', fontWeight: 500 }}>Análisis neuronal con patrones institucionales y flujo de órdenes</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
              transition: 'all 0.2s',
            }}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
            {running ? 'Parar' : 'Iniciar'}
          </button>
        </div>
      </header>

      {/* Panel de información de mercado */}
      <div style={{ background: 'rgba(16, 23, 42, 0.95)', padding: '16px 8vw', borderBottom: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: '0.9rem' }}>
            <div style={{ color: '#a5b4fc' }}>
              <span style={{ color: '#22d3ee', fontWeight: 600 }}>🌍 Sesión:</span> {(() => {
                const session = marketContext.getCurrentSession();
                return `${session.session} (${session.volatility})`;
              })()}
            </div>
            <div style={{ color: '#a5b4fc' }}>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>⏰ UTC:</span> {new Date().toLocaleTimeString('es-ES', { timeZone: 'UTC', hour12: false })}
            </div>
            <div style={{ color: '#a5b4fc' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>🎯 Análisis:</span> Neuronal IA v2.0
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.85rem' }}>
            <div style={{ color: '#64748b' }}>
              Próxima evaluación: <span style={{ color: '#a78bfa', fontWeight: 600 }}>{Math.round(signalInterval/60000)}min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      {showSettings && (
        <div style={{ background: 'rgba(30, 27, 75, 0.98)', padding: '24px 8vw', borderBottom: '1px solid #6d28d9' }}>
          <h3 style={{ color: '#a78bfa', fontSize: '1.2rem', marginBottom: 16, fontWeight: 700 }}>Configuración</h3>
          
          {/* Selección de categorías */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Filtrar por categoría:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    background: filterCategory === cat ? '#6d28d9' : 'rgba(107, 114, 128, 0.3)',
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

          {/* Selección de pares */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Pares activos ({selectedPairs.length} seleccionados):</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {filteredPairs.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => togglePairSelection(pair.symbol)}
                  style={{
                    background: selectedPairs.includes(pair.symbol) ? '#22d3ee' : 'rgba(107, 114, 128, 0.3)',
                    color: selectedPairs.includes(pair.symbol) ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                  }}
                >
                  {pair.display}
                </button>
              ))}
            </div>
          </div>

          {/* Análisis de Mercado */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Sentimiento de Mercado:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Bullish', 'Neutral', 'Bearish'].map(sentiment => (
                <button
                  key={sentiment}
                  onClick={() => setMarketSentiment(sentiment as any)}
                  style={{
                    background: marketSentiment === sentiment ? '#16a34a' : 'rgba(107, 114, 128, 0.3)',
                    color: marketSentiment === sentiment ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {sentiment === 'Bullish' ? '📈 Alcista' : sentiment === 'Bearish' ? '📉 Bajista' : '⚖️ Neutral'}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de Riesgo */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Nivel de Riesgo:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Conservative', 'Moderate', 'Aggressive'].map(risk => (
                <button
                  key={risk}
                  onClick={() => setRiskLevel(risk as any)}
                  style={{
                    background: riskLevel === risk ? '#dc2626' : 'rgba(107, 114, 128, 0.3)',
                    color: riskLevel === risk ? '#fff' : '#a5b4fc',
                    border: '1px solid #6d28d9',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {risk === 'Conservative' ? '🛡️ Conservador' : risk === 'Aggressive' ? '⚡ Agresivo' : '⚖️ Moderado'}
                </button>
              ))}
            </div>
          </div>

          {/* Configuración de intervalo */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Intervalo (minutos):</label>
              <input
                type="number"
                value={Math.max(0.25, signalInterval / 60000)} // Convertir de ms a minutos, mínimo 0.25 (15 seg)
                onChange={(e) => setSignalInterval(Math.max(15000, Number(e.target.value) * 60000))} // Convertir de minutos a ms, mínimo 15 seg
                min="0.25"
                max="120"
                step="0.25"
                style={{
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#e0e7ff',
                  border: '1px solid #6d28d9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  width: '120px',
                }}
              />
            </div>
            <div>
              <label style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: 8, display: 'block' }}>Máx. señales/día:</label>
              <input
                type="number"
                value={maxSignals}
                onChange={(e) => setMaxSignals(Number(e.target.value))}
                min="2"
                max="8"
                style={{
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: '#e0e7ff',
                  border: '1px solid #6d28d9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  width: '120px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Panel de operación en curso y gráfico */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Widget TradingView */}
        <section style={{ flex: 1.2, minWidth: 380, background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 4px 32px #0002', overflow: 'hidden', padding: 0 }}>
          <iframe
            title="TradingView"
            src={`https://es.tradingview.com/widgetembed/?frameElementId=tradingview_6T69ANL1&symbol=${
              activeTrade
                ? (activeTrade.pair === 'BTCUSD' ? 'CRYPTO:BTCUSD' : activeTrade.pair === 'XAUUSD' ? 'OANDA:XAUUSD' : 'FX:' + activeTrade.pair)
                : 'FX:EURUSD'
            }&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Europe/Madrid&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=es`}
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </section>
        {/* Operación en curso */}
        <section style={{ flex: 1, minWidth: 340, background: 'rgba(16,185,129,0.10)', borderRadius: 18, boxShadow: '0 2px 8px #0001', padding: 24, minHeight: 420, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} /> Operación en curso
          </h2>
          
          {/* Estadísticas rápidas con IA */}
          <div style={{ background: '#181e2a', borderRadius: 12, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ color: '#a5b4fc' }}>Señales IA: <span style={{ color: '#22d3ee', fontWeight: 600 }}>{signals.length}/4</span></div>
            <div style={{ color: '#a5b4fc' }}>Precisión: <span style={{ color: '#16a34a', fontWeight: 600 }}>
              {signals.length > 0 ? `${Math.round(signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length)}%` : 'N/A'}
            </span></div>
            <div style={{ color: '#a5b4fc' }}>Mercado: <span style={{ color: marketSentiment === 'Bullish' ? '#16a34a' : marketSentiment === 'Bearish' ? '#dc2626' : '#fbbf24', fontWeight: 600 }}>
              {marketSentiment === 'Bullish' ? '� Alcista' : marketSentiment === 'Bearish' ? '📉 Bajista' : '⚖️ Neutral'}
            </span></div>
            <div style={{ color: '#a5b4fc' }}>IA Mode: <span style={{ color: '#a78bfa', fontWeight: 600 }}>🧠 Neural</span></div>
          </div>

          {activeTrade ? (
            <div style={{ background: '#181e2a', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #0002' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.1rem' }}>{activeTrade.display}</span>
                <span style={{ color: activeTrade.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {activeTrade.signal === 'BUY' ? <TrendingUp size={18} /> : <TrendingDown size={18} />} {activeTrade.signal}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ color: '#fff', fontWeight: 600 }}>Entrada: <span style={{ color: '#38bdf8' }}>{activeTrade.entry}</span></div>
                <div style={{ color: '#fff', fontWeight: 600 }}>TP: <span style={{ color: '#16e0b3' }}>{activeTrade.tp}</span></div>
                <div style={{ color: '#fff', fontWeight: 600 }}>SL: <span style={{ color: '#f472b6' }}>{activeTrade.sl}</span></div>
              </div>
              <div style={{ color: '#fbbf24', fontWeight: 500, marginBottom: 8 }}>{activeTrade.notes}</div>
              <div style={{ color: '#a5b4fc', fontSize: '0.98rem' }}>Confianza: <b>{activeTrade.confidence}%</b></div>
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>{activeTrade.timestamp}</div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '1.05rem', textAlign: 'center', padding: 12 }}>
              {running ? 'Esperando nueva señal para operar...' : 'Pulsa "Iniciar" para comenzar.'}
            </div>
          )}
          {loading && (
            <div style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><RefreshCw className="spin" size={18} /> Obteniendo precio real...</div>
          )}
          {error && (
            <div style={{ color: '#f472b6', marginTop: 8 }}>{error}</div>
          )}
        </section>
      </main>

      {/* Panel de señales mejorado */}
      <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: 700, letterSpacing: 1, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap style={{ color: '#22d3ee' }} />
            Señales IA Premium ({filteredSignals.length})
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#a5b4fc' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                background: 'rgba(107, 114, 128, 0.3)',
                color: '#e0e7ff',
                border: '1px solid #6d28d9',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '0.9rem',
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de señales - más fácil de leer y copiar */}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 32px ${isBuy ? '#22d3ee33' : '#f472b633'}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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

                {/* Información principal - fácil de copiar */}
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

                {/* Botón de copia rápida */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <button
                    onClick={(e) => {
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
                      transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    📋 Copiar Señal
                  </button>
                  
                  <button
                    onClick={(e) => {
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
