import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
  Brain, TrendingUp, TrendingDown, DollarSign, BarChart3, AlertTriangle, CheckCircle, Eye, Zap, Target, Settings, Bell, Database, Activity, Pause, Play, RotateCcw
} from 'lucide-react';

const TradingDashboard = () => {
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  type RealTimeDataItem = {
    price: number;
    change: number;
    volume: number;
    signal: string;
    confidence: number;
    mlConfidence: number;
    technicalScore: number;
    sentimentScore: number;
    riskLevel: string;
    lastUpdate: string;
  };
  
  type RealTimeData = {
    [pair: string]: RealTimeDataItem;
  };
  
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  type Trade = {
    id: number;
    entryPrice: number;
    pair: string;
    signal: string;
    lotSize: number;
    confidence: number;
    timestamp: string;
    status: string;
    pnl?: string;
  };

  type Performance = {
    totalTrades: number;
    winningTrades: number;
    totalProfit: number;
    winRate: number;
  };

  type Notification = {
    id: number;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
    timestamp: string;
  };

  const [performance, setPerformance] = useState<Performance>({
    totalTrades: 0,
    winningTrades: 0,
    totalProfit: 0,
    winRate: 0,
  });
  const [mlModelStatus, setMlModelStatus] = useState({ trained: false, accuracy: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    riskPerTrade: 1.5,
    maxDailyTrades: 8,
    minConfidence: 75,
    symbols: ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'],
    notifications: { telegram: false, discord: false }
  });

  const tradingPairs = settings.symbols;
  const websocket = useRef(null);

  // Simular conexión WebSocket para datos en tiempo real
  useEffect(() => {
    if (isSystemRunning) {
      const interval = setInterval(() => {
        const newData: RealTimeData = {};
        tradingPairs.forEach((pair: string) => {
          const basePrice: { [key: string]: number } = {
            'XAUUSD': 2000 + Math.random() * 100,
            'EURUSD': 1.08 + Math.random() * 0.05,
            'BTCUSD': 45000 + Math.random() * 5000,
            'GBPUSD': 1.25 + Math.random() * 0.05
          };
          newData[pair] = {
            price: basePrice[pair] ?? 0,
            change: (Math.random() - 0.5) * 2,
            volume: Math.random() * 1000000,
            signal: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : 'HOLD',
            confidence: 60 + Math.random() * 40,
            mlConfidence: 50 + Math.random() * 50,
            technicalScore: Math.random() * 100,
            sentimentScore: Math.random() * 100,
            riskLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
            lastUpdate: new Date().toISOString()
          };
        });
        setRealTimeData(newData);
        setConnectionStatus('connected');

        // Simular trades ocasionales
        if (Math.random() > 0.95) {
          const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)];
          const signal = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const price = pair ? (newData[pair]?.price ?? 0) : 0;
          const newTrade: Trade = {
            id: Date.now(),
            entryPrice: price,
            pair: pair ?? '',
            signal,
            lotSize: Math.random() * 2 + 0.01,
            confidence: 70 + Math.random() * 30,
            timestamp: new Date().toISOString(),
            status: 'OPEN',
          };
          setTrades((prev: Trade[]) => [newTrade, ...prev.slice(0, 19)]);

          // Simular cierre de trade después de un tiempo
          setTimeout(() => {
            const outcome = Math.random() > 0.5;
            const pnl = (Math.random() - 0.5) * 100;
            setTrades((prev: Trade[]) => prev.map(t =>
              t.id === newTrade.id
                ? { ...t, status: outcome ? 'WIN' : 'LOSS', pnl: pnl.toFixed(2) }
                : t
            ));
            setPerformance(prev => ({
              ...prev,
              totalTrades: (prev.totalTrades || 0) + 1,
              winningTrades: (prev.winningTrades || 0) + (outcome ? 1 : 0),
              totalProfit: (prev.totalProfit || 0) + pnl,
              winRate: (((prev.winningTrades || 0) + (outcome ? 1 : 0)) / ((prev.totalTrades || 0) + 1)) * 100
            }));
            const notification: Notification = {
              id: Date.now(),
              type: outcome ? 'success' : 'error',
              message: `Trade ${outcome ? 'ganador' : 'perdedor'}: ${pair} ${signal} - P&L: $${pnl.toFixed(2)}`,
              timestamp: new Date().toISOString()
            };
            setNotifications((prev: Notification[]) => [notification, ...prev.slice(0, 9)]);
          }, 5000 + Math.random() * 15000);
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isSystemRunning]);

  // Simular actualización del modelo ML
  useEffect(() => {
    if (isSystemRunning) {
      const mlInterval = setInterval(() => {
        setMlModelStatus(prev => ({
          ...prev,
          trained: true,
          accuracy: Math.min(95, prev.accuracy + Math.random() * 2),
          lastTraining: 'Hace 2 horas'
        }));
      }, 10000);
      return () => clearInterval(mlInterval);
    }
  }, [isSystemRunning]);

  const handleSystemToggle = () => {
    if (!isSystemRunning) {
      setIsSystemRunning(true);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'info',
        message: '🚀 Sistema de Trading IA iniciado correctamente',
        timestamp: new Date().toISOString()
      }, ...prev]);
    } else {
      setIsSystemRunning(false);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'warning',
        message: '🛑 Sistema de Trading IA detenido',
        timestamp: new Date().toISOString()
      }, ...prev]);
      setRealTimeData({});
    }
  };
  const getStatusColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-600 bg-green-50 border-green-200';
      case 'SELL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Brain style={{ width: 32, height: 32, color: '#a78bfa', marginRight: 8 }} />
          <div>
            <h1 className="dashboard-title">Trading IA Pro</h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Sistema Avanzado Multi-Mercado</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className={connectionStatus === 'connected' ? 'dashboard-status-connected' : 'dashboard-status-disconnected'}>
            {connectionStatus === 'connected' ? 'MT5 Conectado' : 'MT5 Desconectado'}
          </span>
          <button onClick={handleSystemToggle} className="dashboard-btn">
            {isSystemRunning ? <Pause style={{ width: 20, height: 20, marginRight: 8 }} /> : <Play style={{ width: 20, height: 20, marginRight: 8 }} />}
            {isSystemRunning ? 'Detener' : 'Iniciar'} Sistema
          </button>
        </div>
      </div>

      <div>
        {/* Métricas Principales */}
        <div className="dashboard-metrics">
          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Balance</p>
                <p className="text-2xl font-bold text-green-400">$25,847.32</p>
                <p className="text-xs text-slate-500">+$1,247 hoy</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-blue-400">{(performance.winRate || 0).toFixed(1)}%</p>
                <p className="text-xs text-slate-500">{performance.totalTrades || 0} trades</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">P&L Total</p>
                <p className={`text-2xl font-bold ${(performance.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(performance.totalProfit || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">Últimos 7 días</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Modelo IA</p>
                <p className={`text-2xl font-bold ${mlModelStatus.trained ? 'text-green-400' : 'text-red-400'}`}>
                  {mlModelStatus.accuracy?.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-slate-500">
                  {mlModelStatus.trained ? 'Entrenado' : 'Sin entrenar'}
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Panel de Pares de Divisas */}
          <div>
            <div className="dashboard-card">
              <h3 className="dashboard-section-title">
                <Activity className="w-6 h-6 text-green-400 mr-2" />
                Análisis en Tiempo Real
              </h3>
              <div>
                {tradingPairs.map(pair => {
                  const data = realTimeData[pair];
                  return (
                    <div key={pair} className="dashboard-card" style={{ marginBottom: 12, background: 'rgba(51,65,85,0.7)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a78bfa' }}>{pair}</h4>
                        {data && (
                          <span className={
                            data.signal === 'BUY' ? 'dashboard-trade-win' :
                            data.signal === 'SELL' ? 'dashboard-trade-loss' :
                            'dashboard-trade-open'
                          }>{data.signal}</span>
                        )}
                      </div>
                      {data ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8' }}>Precio:</span>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontFamily: 'monospace', color: '#fff' }}>
                                {data.price.toFixed(pair === 'XAUUSD' || pair === 'BTCUSD' ? 2 : 5)}
                              </span>
                              <span style={{ marginLeft: 8, fontSize: '0.95rem', color: data.change >= 0 ? '#22c55e' : '#ef4444' }}>
                                {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Confianza IA:</span>
                            <span style={{ fontWeight: 'bold', color: data.confidence >= 80 ? '#22c55e' : data.confidence >= 60 ? '#eab308' : '#ef4444' }}>{data.confidence.toFixed(1)}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>ML Score:</span>
                            <span style={{ fontWeight: 'bold', color: data.mlConfidence >= 80 ? '#22c55e' : data.mlConfidence >= 60 ? '#eab308' : '#ef4444' }}>{data.mlConfidence.toFixed(1)}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Riesgo:</span>
                            <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 'bold', background: data.riskLevel === 'High' ? '#fecaca' : data.riskLevel === 'Medium' ? '#fef08a' : '#bbf7d0', color: data.riskLevel === 'High' ? '#ef4444' : data.riskLevel === 'Medium' ? '#eab308' : '#22c55e' }}>{data.riskLevel}</span>
                          </div>
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                              <span style={{ color: '#94a3b8' }}>Técnico:</span>
                              <span>{data.technicalScore.toFixed(0)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                              <span style={{ color: '#94a3b8' }}>Sentiment:</span>
                              <span>{data.sentimentScore.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                          <div style={{ textAlign: 'center' }}>
                            <Eye style={{ width: 32, height: 32, color: '#64748b', margin: '0 auto 8px' }} />
                            <p style={{ color: '#64748b' }}>Esperando datos...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historial de Trades */}
            <div className="dashboard-card">
              <h3 className="dashboard-section-title">
                <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                Trades Recientes
              </h3>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {trades.length > 0 ? trades.map(trade => (
                  <div key={trade.id} className="dashboard-card" style={{ marginBottom: 12, background: 'rgba(51,65,85,0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{trade.pair}</span>
                        <span className={
                          trade.signal === 'BUY' ? 'dashboard-trade-win' :
                          trade.signal === 'SELL' ? 'dashboard-trade-loss' :
                          'dashboard-trade-open'
                        }>{trade.signal}</span>
                        {trade.status !== 'OPEN' && (
                          <span className={trade.status === 'WIN' ? 'dashboard-trade-win' : 'dashboard-trade-loss'}>{trade.status}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.95rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Entry: </span>
                        <span style={{ fontFamily: 'monospace' }}>{trade.entryPrice.toFixed(trade.pair === 'XAUUSD' || trade.pair === 'BTCUSD' ? 2 : 5)}</span>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Lote: </span>
                        <span>{trade.lotSize.toFixed(2)}</span>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Confianza: </span>
                        <span style={{ fontWeight: 'bold', color: trade.confidence >= 80 ? '#22c55e' : trade.confidence >= 60 ? '#eab308' : '#ef4444' }}>{trade.confidence.toFixed(1)}%</span>
                      </div>
                      {trade.pnl && (
                        <div>
                          <span style={{ color: '#94a3b8' }}>P&L: </span>
                          <span style={{ fontWeight: 'bold', color: parseFloat(trade.pnl) >= 0 ? '#22c55e' : '#ef4444' }}>${trade.pnl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <BarChart3 style={{ width: 48, height: 48, color: '#64748b', margin: '0 auto 12px' }} />
                    <p style={{ color: '#64748b' }}>No hay trades recientes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div>
            {/* Notificaciones */}
            <div className="dashboard-card">
              <h3 className="dashboard-section-title">
                <Bell className="w-5 h-5 text-yellow-400 mr-2" />
                Notificaciones
              </h3>
              <div style={{ maxHeight: 256, overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(notification => (
                  <div key={notification.id} className={
                    notification.type === 'success' ? 'dashboard-notification-success' :
                    notification.type === 'error' ? 'dashboard-notification-error' :
                    notification.type === 'warning' ? 'dashboard-notification-warning' :
                    'dashboard-notification-info'
                  } style={{ padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <p style={{ fontSize: '0.95rem' }}>{notification.message}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>{new Date(notification.timestamp).toLocaleTimeString()}</p>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Bell style={{ width: 32, height: 32, color: '#64748b', margin: '0 auto 8px' }} />
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Sin notificaciones</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="dashboard-card">
              <h3 className="dashboard-section-title">
                <Settings className="w-5 h-5 text-purple-400 mr-2" />
                Estado del Sistema
              </h3>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Sistema:</span>
                  <span className={isSystemRunning ? 'dashboard-status-connected' : 'dashboard-status-disconnected'}>
                    {isSystemRunning ? 'ACTIVO' : 'DETENIDO'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Trades Hoy:</span>
                  <span style={{ color: '#fff' }}>{performance.totalTrades || 0}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Modelo ML:</span>
                  <span className={mlModelStatus.trained ? 'dashboard-status-connected' : 'dashboard-status-disconnected'}>
                    {mlModelStatus.trained ? 'ENTRENADO' : 'NO ENTRENADO'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Riesgo/Trade:</span>
                  <span style={{ color: '#fff' }}>{settings.riskPerTrade}%</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Min. Confianza:</span>
                  <span style={{ color: '#fff' }}>{settings.minConfidence}%</span>
                </div>
              </div>
            </div>

            {/* Configuración Rápida */}
            <div className="dashboard-card">
              <h3 className="dashboard-section-title">
                <RotateCcw className="w-5 h-5 text-blue-400 mr-2" />
                Configuración
              </h3>
              
              <div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.95rem', marginBottom: 4 }}>Riesgo por Trade (%)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={settings.riskPerTrade}
                    onChange={(e) => setSettings(prev => ({...prev, riskPerTrade: parseFloat(e.target.value)}))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.95rem', marginBottom: 4 }}>Confianza Mínima (%)</label>
                  <input
                    type="number"
                    min="50"
                    step="5"
                    value={settings.minConfidence}
                    onChange={(e) => setSettings(prev => ({...prev, minConfidence: parseInt(e.target.value)}))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.95rem', marginBottom: 4 }}>Trades Máx/Día</label>
                  <input
                    type="number"
                    max={20}
                    value={settings.maxDailyTrades}
                    onChange={(e) => setSettings(prev => ({...prev, maxDailyTrades: parseInt(e.target.value)}))}
                    className="input"
                  />
                </div>
                <button
                  className="dashboard-btn"
                  style={{ width: '100%', marginTop: 16 }}
                  onClick={() => {
                    setNotifications(prev => [{
                      id: Date.now(),
                      type: 'info',
                      message: '⚙️ Configuración actualizada',
                      timestamp: new Date().toISOString()
                    }, ...prev]);
                  }}
                >
                  Aplicar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradingDashboard;