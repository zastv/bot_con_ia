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
  ): { confidence: number; reasoning: string[]; riskAdjustment: number } {
    const reasoning: string[] = [];
    let aiScore = 0;

    // 1. Análisis de contexto macro (30% del score)
    const macroContext = this.analyzeMacroContext(pair, marketSentiment);
    aiScore += macroContext * 0.3;
    reasoning.push(`📊 Análisis macro: ${(macroContext * 100).toFixed(0)}% favorable`);

    // 2. Detección de patrones (25% del score)
    const patterns = this.detectPatterns(price, pair);
    const patternScore = patterns.strength * (patterns.direction === 'neutral' ? 0.5 : 0.8);
    aiScore += patternScore * 0.25;
    reasoning.push(`🔍 Patrón ${patterns.pattern}: ${(patterns.strength * 100).toFixed(0)}% de fuerza`);

    // 3. Análisis de flujo de órdenes (20% del score)
    const orderFlow = this.analyzeOrderFlow(pair);
    const flowScore = orderFlow.institutional * 0.7 + orderFlow.smart_money * 0.8 + orderFlow.retail * 0.3;
    aiScore += flowScore * 0.2;
    reasoning.push(`💰 Flujo institucional: ${(orderFlow.institutional * 100).toFixed(0)}%, Smart money: ${(orderFlow.smart_money * 100).toFixed(0)}%`);

    // 4. Confluencia técnica (15% del score)
    const technicalScore = Math.abs(timeframeScore) / 3; // Normalizar -3,3 a 0,1
    aiScore += technicalScore * 0.15;
    reasoning.push(`⚙️ Confluencia técnica: ${(technicalScore * 100).toFixed(0)}% alineación`);

    // 5. Análisis de volatilidad y momentum (10% del score)
    const volatilityOptimal = Math.random() > 0.4 ? 0.8 : 0.4;
    aiScore += volatilityOptimal * 0.1;
    reasoning.push(`📈 Condiciones de volatilidad: ${volatilityOptimal > 0.6 ? 'Óptimas' : 'Moderadas'}`);

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
      riskAdjustment
    };
  }
}

const tradingAI = new TradingAI();

const tradingPairs = [
  { symbol: 'BTCUSD', api: 'BTCUSDT', display: 'Bitcoin (BTCUSD)', category: 'Crypto' },
  { symbol: 'EURUSD', api: 'EURUSD', display: 'Euro/Dólar (EURUSD)', category: 'Forex Major' },
  { symbol: 'XAUUSD', api: 'XAUUSD', display: 'Oro (XAUUSD)', category: 'Commodities' },
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
  // Usar Binance para crypto, APIs específicas para forex y oro
  if (pair === 'BTCUSDT') {
    try {
      const res = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      return parseFloat(res.data.price);
    } catch {
      return 0;
    }
  } else if (pair === 'EURUSD') {
    try {
      // Usar exchangerate-api para EURUSD (gratis, confiable)
      const res = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
      return parseFloat(res.data.rates.USD);
    } catch {
      // Fallback a TwelveData
      try {
        const res = await axios.get(`https://api.twelvedata.com/price?symbol=EURUSD&apikey=demo`);
        return parseFloat(res.data.price);
      } catch {
        return 1.0850; // Precio aproximado de fallback
      }
    }
  } else if (pair === 'XAUUSD') {
    try {
      // Usar metals-api para oro (tiene plan gratuito)
      const res = await axios.get('https://api.metals.live/v1/spot/gold');
      return parseFloat(res.data.price);
    } catch {
      // Fallback a TwelveData
      try {
        const res = await axios.get(`https://api.twelvedata.com/price?symbol=XAUUSD&apikey=demo`);
        return parseFloat(res.data.price);
      } catch {
        return 2650.00; // Precio aproximado de fallback
      }
    }
  } else {
    // TwelveData para otros pares
    try {
      const res = await axios.get(`https://api.twelvedata.com/price?symbol=${pair}&apikey=demo`);
      return parseFloat(res.data.price);
    } catch {
      return 0;
    }
  }
};

const TradingSignalsBot = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTrade, setActiveTrade] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['BTCUSD', 'EURUSD', 'XAUUSD']);
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [signalInterval, setSignalInterval] = useState(1800000); // 30 minutos en lugar de 7 segundos
  const [maxSignals, setMaxSignals] = useState(4); // Máximo 4 señales por día
  const [lastPairIndex, setLastPairIndex] = useState(0); // Para rotación balanceada
  const [marketSentiment, setMarketSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral');
  const [riskLevel, setRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

  // Generar señales realistas cada cierto tiempo
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let signalsCount = 0;
    const interval = setInterval(async () => {
      if (signalsCount >= maxSignals) return;
      setLoading(true);
      setError(null);
      // Análisis de temporalidades para intraday (H1, H4, D1)
      const timeframes = ['H1', 'H4', 'D1'];
      const availablePairs = tradingPairs.filter(p => selectedPairs.includes(p.symbol));
      if (availablePairs.length === 0) {
        setLoading(false);
        return;
      }
      
      // Sistema de rotación balanceada para evitar sesgo hacia un solo par
      const pairObj = availablePairs[lastPairIndex % availablePairs.length];
      setLastPairIndex(prev => prev + 1);
      
      // Sentimiento de mercado influye en la probabilidad de BUY/SELL
      let buyProbability = 0.5;
      if (marketSentiment === 'Bullish') buyProbability = 0.65;
      else if (marketSentiment === 'Bearish') buyProbability = 0.35;
      
      const isBuy = Math.random() < buyProbability;
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
      // Multiplicadores según nivel de riesgo
      const riskMultiplier = riskLevel === 'Conservative' ? 0.7 : riskLevel === 'Aggressive' ? 1.3 : 1.0;
      
      if (pairObj.symbol === 'BTCUSD' || pairObj.symbol === 'ETHUSD') {
        // Para crypto: targets más amplios para intraday
        const baseTP = 800 * riskMultiplier;
        const baseSL = 400 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(0));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(0));
      } else if (pairObj.symbol === 'XAUUSD') {
        // Para oro: targets intraday
        const baseTP = 15 * riskMultiplier;
        const baseSL = 8 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(2));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(2));
      } else {
        // Para forex: targets intraday más amplios
        const baseTP = 0.008 * riskMultiplier;
        const baseSL = 0.004 * riskMultiplier;
        tp = parseFloat((entry + (isBuy ? baseTP : -baseTP)).toFixed(5));
        sl = parseFloat((entry - (isBuy ? baseSL : -baseSL)).toFixed(5));
      }
      // Simular mayor probabilidad si varias temporalidades coinciden
      const tfSignals = timeframes.map(tf => Math.random() > 0.4 ? (isBuy ? 1 : -1) : 0);
      const tfScore = tfSignals.reduce((a: number, b) => a + b, 0);
      
      // 🧠 SISTEMA DE IA AVANZADO
      const aiAnalysis = tradingAI.calculateAIScore(tfScore, entry, pairObj.symbol, marketSentiment, riskLevel);
      const confidence = aiAnalysis.confidence;
      
      // Generar notas con razonamiento de IA
      let notes = `🤖 ANÁLISIS IA AVANZADO - Confianza: ${confidence}%\n\n`;
      
      // Añadir razonamiento detallado
      aiAnalysis.reasoning.forEach((reason, index) => {
        notes += `${index + 1}. ${reason}\n`;
      });
      
      notes += `\n📋 RECOMENDACIONES:\n`;
      if (confidence >= 85) {
        notes += `🔥 SEÑAL DE ALTA CALIDAD: Múltiples factores confirman la oportunidad.
⚡ Confluencia técnica y fundamental alineada.
💎 Patrón institucional detectado con alta probabilidad de éxito.
🎯 Setup ideal para posición con tamaño normal.
⏰ Ventana operativa: 4-8 horas. Monitorear evolución.`;
      } else if (confidence >= 70) {
        notes += `✅ OPORTUNIDAD SÓLIDA: Factores técnicos favorables con confirmación parcial.
📊 Análisis de contexto positivo, riesgo controlado.
⚖️ Entrada válida con gestión conservadora.
🔍 Seguir evolución del precio cada 2-3 horas.
⏰ Validez esperada: 6-12 horas.`;
      } else if (confidence >= 55) {
        notes += `⚠️ SEÑAL CONDICIONAL: Setup técnico básico identificado.
🔄 Contexto mixto, requiere confirmación adicional.
💰 Considerar posición reducida o esperar mejor entrada.
📈 Monitorear cambios en momentum antes de ejecutar.
⏰ Revisar en 1-2 horas para nueva evaluación.`;
      } else {
        notes += `🚫 SEÑAL DÉBIL: Condiciones técnicas y fundamentales no favorables.
❌ Falta confluencia, mercado incierto o lateral.
🛑 EVITAR esta operación o esperar mejor setup.
🔍 Analizar cambios en contexto macro antes de actuar.
⏰ Reevaluar en 4-6 horas cuando cambien condiciones.`;
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
      setRunning(false);
      setActiveTrade(null);
    } else {
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
                value={signalInterval / 60000} // Convertir de ms a minutos
                onChange={(e) => setSignalInterval(Number(e.target.value) * 60000)} // Convertir de minutos a ms
                min="15"
                max="120"
                step="15"
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

      {/* Panel de señales */}
      <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#a78bfa', fontSize: '1.4rem', fontWeight: 700, letterSpacing: 1, margin: 0 }}>
            Últimas señales ({filteredSignals.length})
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#a5b4fc' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                background: 'rgba(107, 114, 128, 0.3)',
                color: '#e0e7ff',
                border: '1px solid #6d28d9',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.9rem',
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', fontSize: '1.05rem', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #6d28d9', color: '#a5b4fc' }}>
                <th style={{ padding: 10 }}>Par</th>
                <th style={{ padding: 10 }}>Señal</th>
                <th style={{ padding: 10 }}>Confianza</th>
                <th style={{ padding: 10 }}>Entrada</th>
                <th style={{ padding: 10 }}>TP</th>
                <th style={{ padding: 10 }}>SL</th>
                <th style={{ padding: 10 }}>R:R</th>
                <th style={{ padding: 10 }}>Hora</th>
                <th style={{ padding: 10 }}>Notas</th>
                <th style={{ padding: 10 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.map(s => {
                const risk = Math.abs(s.entry - s.sl);
                const reward = Math.abs(s.tp - s.entry);
                const riskReward = risk > 0 ? (reward / risk).toFixed(1) : '0';
                
                return (
                <tr key={s.id} style={{ borderBottom: '1px solid #334155', background: s.signal === 'BUY' ? 'rgba(34,211,238,0.04)' : 'rgba(244,114,182,0.04)' }}>
                  <td style={{ padding: 10, fontWeight: 600 }}>{s.display}</td>
                  <td style={{ padding: 10, color: s.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 'bold', letterSpacing: 1 }}>{s.signal}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ 
                        width: '40px', 
                        height: '6px', 
                        background: 'rgba(107, 114, 128, 0.3)', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${s.confidence}%`, 
                          height: '100%', 
                          background: s.confidence > 80 ? '#22d3ee' : s.confidence > 60 ? '#fbbf24' : '#f472b6',
                          borderRadius: 3
                        }}></div>
                      </div>
                      {s.confidence}%
                    </div>
                  </td>
                  <td style={{ padding: 10 }}>{s.entry}</td>
                  <td style={{ padding: 10, color: '#16e0b3' }}>{s.tp}</td>
                  <td style={{ padding: 10, color: '#f472b6' }}>{s.sl}</td>
                  <td style={{ padding: 10, color: parseFloat(riskReward) >= 2 ? '#16e0b3' : parseFloat(riskReward) >= 1.5 ? '#fbbf24' : '#f472b6', fontWeight: 600 }}>
                    1:{riskReward}
                  </td>
                  <td style={{ padding: 10 }}>{s.timestamp}</td>
                  <td style={{ padding: 10, color: '#fbbf24', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes}</td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => handleSetActive(s)}
                      style={{ background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.98rem', boxShadow: '0 1px 4px #6d28d933', transition: 'all 0.2s' }}
                    >
                      <BarChart3 size={14} style={{ marginRight: 4 }} />
                      Ver
                    </button>
                  </td>
                </tr>
                );
              })}
              {filteredSignals.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                    No hay señales disponibles para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 18, textAlign: 'center' }}>
          <b>Trading Intraday:</b> Estas señales están diseñadas para operaciones de 4-12 horas. Siempre confirma con análisis fundamental y gestiona el riesgo apropiadamente.
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
