# SISTEMA DE TRADING IA AVANZADO - VERSION PRO
# Instalar: pip install MetaTrader5 pandas numpy scikit-learn requests telegram-send discord.py

import MetaTrader5 as mt5
import pandas as pd
import numpy as np
import time
import threading
from datetime import datetime, timedelta
import json
import logging
import sqlite3
from typing import Dict, List, Optional, Tuple
import requests
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

# Configuración de logging avanzado
class ColoredFormatter(logging.Formatter):
    """Formatter con colores para terminal"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{log_color}{record.levelname}{self.RESET}"
        return super().format(record)

# Configurar logging
logger = logging.getLogger('AITrading')
logger.setLevel(logging.INFO)

# Handler para archivo
file_handler = logging.FileHandler('ai_trading_advanced.log')
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# Handler para consola con colores
console_handler = logging.StreamHandler()
console_handler.setFormatter(ColoredFormatter(
    '%(asctime)s - 🤖 %(levelname)s - %(message)s'
))

logger.addHandler(file_handler)
logger.addHandler(console_handler)

class DatabaseManager:
    """Gestor de base de datos para historial y aprendizaje"""
    
    def __init__(self, db_path: str = 'trading_ai.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Inicializar base de datos"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME,
                    symbol TEXT,
                    signal TEXT,
                    confidence REAL,
                    entry_price REAL,
                    exit_price REAL,
                    lot_size REAL,
                    profit REAL,
                    status TEXT,
                    duration_minutes INTEGER,
                    market_conditions TEXT
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS market_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME,
                    symbol TEXT,
                    price REAL,
                    trend_score REAL,
                    momentum_score REAL,
                    volatility_score REAL,
                    rsi REAL,
                    prediction TEXT,
                    confidence REAL
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE,
                    symbol TEXT,
                    total_trades INTEGER,
                    winning_trades INTEGER,
                    total_profit REAL,
                    max_drawdown REAL,
                    sharpe_ratio REAL
                )
            ''')
    
    def save_trade(self, trade_data: dict):
        """Guardar trade en base de datos"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO trades (timestamp, symbol, signal, confidence, entry_price, 
                                  exit_price, lot_size, profit, status, duration_minutes, market_conditions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                trade_data.get('timestamp'),
                trade_data.get('symbol'),
                trade_data.get('signal'),
                trade_data.get('confidence'),
                trade_data.get('entry_price'),
                trade_data.get('exit_price'),
                trade_data.get('lot_size'),
                trade_data.get('profit'),
                trade_data.get('status'),
                trade_data.get('duration_minutes'),
                json.dumps(trade_data.get('market_conditions', {}))
            ))
    
    def get_performance_stats(self, days: int = 30) -> dict:
        """Obtener estadísticas de rendimiento"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT 
                    COUNT(*) as total_trades,
                    SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as winning_trades,
                    SUM(profit) as total_profit,
                    AVG(profit) as avg_profit,
                    MAX(profit) as max_profit,
                    MIN(profit) as max_loss,
                    AVG(confidence) as avg_confidence
                FROM trades 
                WHERE timestamp > datetime('now', '-{} days')
                AND status = 'CLOSED'
            '''.format(days))
            
            row = cursor.fetchone()
            if row[0] == 0:  # No trades
                return {}
            
            return {
                'total_trades': row[0],
                'winning_trades': row[1],
                'win_rate': (row[1] / row[0]) * 100 if row[0] > 0 else 0,
                'total_profit': row[2] or 0,
                'avg_profit': row[3] or 0,
                'max_profit': row[4] or 0,
                'max_loss': row[5] or 0,
                'avg_confidence': row[6] or 0
            }

class NotificationManager:
    """Gestor de notificaciones (Telegram, Discord, Email)"""
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.telegram_enabled = self.config.get('telegram_enabled', False)
        self.discord_enabled = self.config.get('discord_enabled', False)
        
    def send_trade_notification(self, trade_info: dict):
        """Enviar notificación de trade"""
        message = f"""
🤖 **TRADE EJECUTADO**
📊 **Par:** {trade_info['symbol']}
📈 **Acción:** {trade_info['signal']}
💰 **Precio:** {trade_info['entry_price']:.5f}
📊 **Lote:** {trade_info['lot_size']}
🎯 **Confianza:** {trade_info['confidence']:.1f}%
⏰ **Hora:** {trade_info['timestamp']}
        """
        
        if self.telegram_enabled:
            self._send_telegram(message)
        
        if self.discord_enabled:
            self._send_discord(message)
    
    def _send_telegram(self, message: str):
        """Enviar mensaje por Telegram"""
        try:
            # Configurar tu bot de Telegram
            bot_token = self.config.get('telegram_bot_token')
            chat_id = self.config.get('telegram_chat_id')
            
            if bot_token and chat_id:
                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                data = {
                    'chat_id': chat_id,
                    'text': message,
                    'parse_mode': 'Markdown'
                }
                requests.post(url, data=data, timeout=10)
        except Exception as e:
            logger.error(f"Error sending Telegram notification: {e}")
    
    def _send_discord(self, message: str):
        """Enviar mensaje por Discord"""
        try:
            webhook_url = self.config.get('discord_webhook_url')
            if webhook_url:
                data = {'content': message}
                requests.post(webhook_url, json=data, timeout=10)
        except Exception as e:
            logger.error(f"Error sending Discord notification: {e}")

class MLPredictor:
    """Predictor de Machine Learning para análisis avanzado"""
    
    def __init__(self, model_path: str = 'trading_model.joblib'):
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.features = []
        
    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Preparar características para el modelo"""
        features = []
        
        # Indicadores técnicos
        df['sma_20'] = df['close'].rolling(20).mean()
        df['sma_50'] = df['close'].rolling(50).mean()
        df['ema_12'] = df['close'].ewm(span=12).mean()
        df['ema_26'] = df['close'].ewm(span=26).mean()
        
        # MACD
        df['macd'] = df['ema_12'] - df['ema_26']
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Bollinger Bands
        bb_period = 20
        df['bb_middle'] = df['close'].rolling(bb_period).mean()
        bb_std = df['close'].rolling(bb_period).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        # Stochastic
        low_14 = df['low'].rolling(14).min()
        high_14 = df['high'].rolling(14).max()
        df['stoch_k'] = 100 * (df['close'] - low_14) / (high_14 - low_14)
        df['stoch_d'] = df['stoch_k'].rolling(3).mean()
        
        # Williams %R
        df['williams_r'] = -100 * (high_14 - df['close']) / (high_14 - low_14)
        
        # Momentum indicators
        df['roc'] = df['close'].pct_change(10) * 100
        df['momentum'] = df['close'] / df['close'].shift(10)
        
        # Volatilidad
        df['volatility'] = df['close'].rolling(20).std()
        df['atr'] = self._calculate_atr(df)
        
        # Price patterns
        df['price_change'] = df['close'].pct_change()
        df['price_change_2'] = df['close'].pct_change(2)
        df['price_change_5'] = df['close'].pct_change(5)
        
        # Volume indicators (si disponible)
        if 'tick_volume' in df.columns:
            df['volume_sma'] = df['tick_volume'].rolling(20).mean()
            df['volume_ratio'] = df['tick_volume'] / df['volume_sma']
        
        # Time features
        df['hour'] = pd.to_datetime(df['time']).dt.hour
        df['day_of_week'] = pd.to_datetime(df['time']).dt.dayofweek
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        
        # Seleccionar características finales
        feature_columns = [
            'rsi', 'macd', 'macd_histogram', 'bb_position', 'stoch_k', 'stoch_d',
            'williams_r', 'roc', 'momentum', 'volatility', 'atr',
            'price_change', 'price_change_2', 'price_change_5',
            'hour_sin', 'hour_cos', 'dow_sin', 'dow_cos'
        ]
        
        # Añadir ratio de EMAs
        df['ema_ratio'] = df['ema_12'] / df['ema_26']
        df['sma_ratio'] = df['sma_20'] / df['sma_50']
        feature_columns.extend(['ema_ratio', 'sma_ratio'])
        
        # Filtrar columnas existentes
        available_features = [col for col in feature_columns if col in df.columns]
        
        return df[available_features].dropna()
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calcular Average True Range"""
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        return true_range.rolling(period).mean()
    
    def train_model(self, historical_data: pd.DataFrame, labels: pd.Series):
        """Entrenar modelo con datos históricos"""
        try:
            # Preparar características
            features_df = self.prepare_features(historical_data)
            
            # Alinear con labels
            min_length = min(len(features_df), len(labels))
            X = features_df.iloc[-min_length:].values
            y = labels.iloc[-min_length:].values
            
            # Eliminar NaN
            mask = ~np.isnan(X).any(axis=1) & ~np.isnan(y)
            X = X[mask]
            y = y[mask]
            
            if len(X) < 100:  # Mínimo de datos para entrenar
                logger.warning("Insufficient data for training ML model")
                return False
            
            # Escalar características
            X_scaled = self.scaler.fit_transform(X)
            
            # Entrenar modelo
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            # Guardar modelo
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
                'features': list(features_df.columns)
            }, self.model_path)
            
            logger.info(f"🧠 ML Model trained successfully with {len(X)} samples")
            return True
            
        except Exception as e:
            logger.error(f"Error training ML model: {e}")
            return False
    
    def predict(self, current_data: pd.DataFrame) -> dict:
        """Hacer predicción con el modelo entrenado"""
        if not self.is_trained and os.path.exists(self.model_path):
            self.load_model()
        
        if not self.is_trained:
            return {'prediction': 0, 'confidence': 0.5, 'method': 'fallback'}
        
        try:
            # Preparar características
            features_df = self.prepare_features(current_data)
            if features_df.empty:
                return {'prediction': 0, 'confidence': 0.5, 'method': 'fallback'}
            
            # Tomar la última fila
            X = features_df.iloc[-1:].values
            
            # Verificar NaN
            if np.isnan(X).any():
                return {'prediction': 0, 'confidence': 0.5, 'method': 'fallback'}
            
            # Escalar y predecir
            X_scaled = self.scaler.transform(X)
            prediction = self.model.predict(X_scaled)[0]
            probabilities = self.model.predict_proba(X_scaled)[0]
            confidence = np.max(probabilities)
            
            return {
                'prediction': int(prediction),
                'confidence': float(confidence),
                'probabilities': probabilities.tolist(),
                'method': 'ml_model'
            }
            
        except Exception as e:
            logger.error(f"Error in ML prediction: {e}")
            return {'prediction': 0, 'confidence': 0.5, 'method': 'error_fallback'}
    
    def load_model(self):
        """Cargar modelo guardado"""
        try:
            if os.path.exists(self.model_path):
                saved_data = joblib.load(self.model_path)
                self.model = saved_data['model']
                self.scaler = saved_data['scaler']
                self.features = saved_data['features']
                self.is_trained = True
                logger.info("🧠 ML Model loaded successfully")
            else:
                logger.warning("No saved ML model found")
        except Exception as e:
            logger.error(f"Error loading ML model: {e}")

class AdvancedAITradingSystem:
    """Sistema de Trading IA Avanzado con Machine Learning"""
    
    def __init__(self, mt5_connector, config: dict = None):
        self.mt5 = mt5_connector
        self.config = config or {}
        
        # Componentes avanzados
        self.db = DatabaseManager()
        self.notifications = NotificationManager(config.get('notifications', {}))
        self.ml_predictor = MLPredictor()
        
        # Configuración
        self.symbols = self.config.get('symbols', ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'])
        self.risk_per_trade = self.config.get('risk_per_trade', 0.02)
        self.max_daily_trades = self.config.get('max_daily_trades', 10)
        self.min_confidence = self.config.get('min_confidence', 70)
        
        # Estado del sistema
        self.is_running = False
        self.daily_trade_count = 0
        self.last_reset_date = datetime.now().date()
        self.analysis_history = {}
        self.active_positions = {}
        
        # Métricas de rendimiento
        self.session_stats = {
            'start_time': None,
            'total_trades': 0,
            'winning_trades': 0,
            'total_profit': 0.0,
            'max_drawdown': 0.0
        }
    
    def analyze_market_advanced(self, symbol: str) -> dict:
        """Análisis de mercado con ML y múltiples timeframes"""
        try:
            # Obtener datos de múltiples timeframes
            data_m15 = self.mt5.get_price_data(symbol, mt5.TIMEFRAME_M15, 500)
            data_h1 = self.mt5.get_price_data(symbol, mt5.TIMEFRAME_H1, 200)
            data_h4 = self.mt5.get_price_data(symbol, mt5.TIMEFRAME_H4, 100)
            
            if any(df.empty for df in [data_m15, data_h1, data_h4]):
                return self._fallback_analysis(symbol)
            
            # Análisis técnico tradicional
            traditional_analysis = self._traditional_technical_analysis(data_m15)
            
            # Predicción ML
            ml_prediction = self.ml_predictor.predict(data_m15)
            
            # Análisis multi-timeframe
            mtf_analysis = self._multi_timeframe_analysis(data_m15, data_h1, data_h4)
            
            # Análisis de sentimiento del mercado
            market_sentiment = self._analyze_market_sentiment(symbol, data_m15)
            
            # Combinar todas las señales
            final_signal = self._combine_signals(
                traditional_analysis,
                ml_prediction,
                mtf_analysis,
                market_sentiment
            )
            
            # Calcular niveles de entrada y salida
            levels = self._calculate_smart_levels(symbol, data_m15, final_signal)
            
            result = {
                'symbol': symbol,
                'signal': final_signal['signal'],
                'confidence': final_signal['confidence'],
                'ml_confidence': ml_prediction['confidence'],
                'traditional_score': traditional_analysis['score'],
                'mtf_alignment': mtf_analysis['alignment'],
                'market_sentiment': market_sentiment['score'],
                **levels,
                'analysis_details': {
                    'traditional': traditional_analysis,
                    'ml_prediction': ml_prediction,
                    'mtf_analysis': mtf_analysis,
                    'market_sentiment': market_sentiment
                },
                'timestamp': datetime.now()
            }
            
            # Guardar análisis en base de datos
            self.db.save_analysis(result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in advanced market analysis for {symbol}: {e}")
            return self._fallback_analysis(symbol)
    
    def _traditional_technical_analysis(self, df: pd.DataFrame) -> dict:
        """Análisis técnico tradicional mejorado"""
        # Calcular indicadores
        df['ema_20'] = df['close'].ewm(span=20).mean()
        df['ema_50'] = df['close'].ewm(span=50).mean()
        df['ema_200'] = df['close'].ewm(span=200).mean()
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        ema_12 = df['close'].ewm(span=12).mean()
        ema_26 = df['close'].ewm(span=26).mean()
        df['macd'] = ema_12 - ema_26
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        
        # ATR
        df['tr'] = np.maximum(
            df['high'] - df['low'],
            np.maximum(
                abs(df['high'] - df['close'].shift()),
                abs(df['low'] - df['close'].shift())
            )
        )
        df['atr'] = df['tr'].rolling(window=14).mean()
        
        # Bollinger Bands
        bb_period = 20
        bb_middle = df['close'].rolling(bb_period).mean()
        bb_std = df['close'].rolling(bb_period).std()
        df['bb_upper'] = bb_middle + (bb_std * 2)
        df['bb_lower'] = bb_middle - (bb_std * 2)
        
        current = df.iloc[-1]
        
        # Puntuaciones de señales
        signals = []
        
        # Tendencia EMA
        if current['ema_20'] > current['ema_50'] > current['ema_200']:
            signals.append(('trend_strong_bull', 1.0, 0.8))
        elif current['ema_20'] > current['ema_50']:
            signals.append(('trend_weak_bull', 0.5, 0.6))
        elif current['ema_20'] < current['ema_50'] < current['ema_200']:
            signals.append(('trend_strong_bear', -1.0, 0.8))
        elif current['ema_20'] < current['ema_50']:
            signals.append(('trend_weak_bear', -0.5, 0.6))
        
        # RSI
        if current['rsi'] < 30:
            signals.append(('oversold', 0.7, 0.7))
        elif current['rsi'] > 70:
            signals.append(('overbought', -0.7, 0.7))
        elif 45 < current['rsi'] < 55:
            signals.append(('neutral_momentum', 0, 0.3))
        
        # MACD
        if current['macd'] > current['macd_signal'] and df['macd'].iloc[-2] <= df['macd_signal'].iloc[-2]:
            signals.append(('macd_bullish_cross', 0.8, 0.7))
        elif current['macd'] < current['macd_signal'] and df['macd'].iloc[-2] >= df['macd_signal'].iloc[-2]:
            signals.append(('macd_bearish_cross', -0.8, 0.7))
        
        # Bollinger Bands
        if current['close'] < current['bb_lower']:
            signals.append(('bb_oversold', 0.6, 0.6))
        elif current['close'] > current['bb_upper']:
            signals.append(('bb_overbought', -0.6, 0.6))
        
        # Calcular puntuación final
        total_score = sum(signal[1] * signal[2] for signal in signals)
        total_weight = sum(signal[2] for signal in signals)
        final_score = total_score / total_weight if total_weight > 0 else 0
        
        return {
            'score': final_score,
            'signals': signals,
            'indicators': {
                'rsi': current['rsi'],
                'macd': current['macd'],
                'macd_signal': current['macd_signal'],
                'atr': current['atr'],
                'bb_position': (current['close'] - current['bb_lower']) / (current['bb_upper'] - current['bb_lower'])
            }
        }
    
    def _multi_timeframe_analysis(self, m15_data: pd.DataFrame, h1_data: pd.DataFrame, h4_data: pd.DataFrame) -> dict:
        """Análisis multi-timeframe"""
        timeframes = {
            'M15': m15_data,
            'H1': h1_data,
            'H4': h4_data
        }
        
        trends = {}
        
        for tf_name, df in timeframes.items():
            # Calcular EMAs
            df['ema_20'] = df['close'].ewm(span=20).mean()
            df['ema_50'] = df['close'].ewm(span=50).mean()
            
            current = df.iloc[-1]
            
            # Determinar tendencia
            if current['ema_20'] > current['ema_50']:
                trend_score = (current['ema_20'] - current['ema_50']) / current['ema_50']
                trends[tf_name] = min(1.0, trend_score * 100)  # Normalizar
            else:
                trend_score = (current['ema_50'] - current['ema_20']) / current['ema_20']
                trends[tf_name] = max(-1.0, -trend_score * 100)  # Normalizar
        
        # Calcular alineación
        alignment_score = 0
        weights = {'H4': 0.5, 'H1': 0.3, 'M15': 0.2}
        
        for tf, weight in weights.items():
            alignment_score += trends[tf] * weight
        
        # Determinar si hay alineación
        same_direction = all(t > 0 for t in trends.values()) or all(t < 0 for t in trends.values())
        
        return {
            'alignment': alignment_score,
            'trends': trends,
            'aligned': same_direction,
            'strength': abs(alignment_score)
        }
    
    def _analyze_market_sentiment(self, symbol: str, df: pd.DataFrame) -> dict:
        """Análisis de sentimiento del mercado"""
        # Volatilidad reciente
        recent_volatility = df['close'].pct_change().tail(20).std()
        avg_volatility = df['close'].pct_change().std()
        
        volatility_ratio = recent_volatility / avg_volatility if avg_volatility > 0 else 1
        
        # Momentum de precio
        price_momentum = df['close'].pct_change(20).iloc[-1]
        
        # Volumen (si está disponible)
        volume_trend = 0
        if 'tick_volume' in df.columns:
            recent_volume = df['tick_volume'].tail(20).mean()
            avg_volume = df['tick_volume'].mean()
            volume_trend = (recent_volume - avg_volume) / avg_volume if avg_volume > 0 else 0
        
        # Combinar factores
        sentiment_score = (price_momentum * 0.4 + volume_trend * 0.3 + 
                          (1 - volatility_ratio) * 0.3)
        
        return {
            'score': sentiment_score,
            'volatility_ratio': volatility_ratio,
            'price_momentum': price_momentum,
            'volume_trend': volume_trend
        }
    
    def _combine_signals(self, traditional: dict, ml_pred: dict, mtf: dict, sentiment: dict) -> dict:
        """Combinar todas las señales para decisión final"""
        
        # Pesos para cada componente
        weights = {
            'traditional': 0.3,
            'ml': 0.4,
            'mtf': 0.2,
            'sentiment': 0.1
        }
        
        # Normalizar ML prediction a -1, 1
        ml_signal = (ml_pred['prediction'] - 1) if ml_pred['prediction'] in [0, 1, 2] else 0
        if ml_pred['prediction'] == 0:  # SELL
            ml_signal = -1
        elif ml_pred['prediction'] == 2:  # BUY
            ml_signal = 1
        else:  # HOLD
            ml_signal = 0
        
        # Calcular señal combinada
        combined_score = (
            traditional['score'] * weights['traditional'] +
            ml_signal * ml_pred['confidence'] * weights['ml'] +
            mtf['alignment'] * weights['mtf'] +
            sentiment['score'] * weights['sentiment']
        )
        
        # Calcular confianza combinada
        confidence_factors = [
            traditional.get('confidence', 0.7),
            ml_pred['confidence'],
            mtf['strength'],
            abs(sentiment['score'])
        ]
        
        combined_confidence = np.average(confidence_factors, weights=list(weights.values()))
        
        # Determinar señal final
        if combined_score > 0.3:
            signal = 'BUY'
        elif combined_score < -0.3:
            signal = 'SELL'
        else:
            signal = 'HOLD'
        
        return {
            'signal': signal,
            'confidence': combined_confidence * 100,
            'combined_score': combined_score,
            'components': {
                'traditional': traditional['score'],
                'ml': ml_signal * ml_pred['confidence'],
                'mtf': mtf['alignment'],
                'sentiment': sentiment['score']
            }
        }
    
    def _calculate_smart_levels(self, symbol: str, df: pd.DataFrame, signal_info: dict) -> dict:
        """Calcular niveles inteligentes de entrada, SL y TP"""
        current_price = df['close'].iloc[-1]
        atr = df['close'].diff().abs().rolling(14).mean().iloc[-1]
        
        # Ajustar ATR por símbolo
        if symbol == 'XAUUSD':
            atr_multiplier = 2.0
        elif symbol in ['EURUSD', 'GBPUSD']:
            atr_multiplier = 1.5
        elif symbol == 'BTCUSD':
            atr_multiplier = 3.0
        else:
            atr_multiplier = 2.0
        
        # Calcular niveles basados en confianza
        confidence_factor = signal_info['confidence'] / 100
        sl_distance = atr * atr_multiplier * (2 - confidence_factor)  # Menos distancia con más confianza
        tp_distance = sl_distance * (1.5 + confidence_factor)  # Más TP con más confianza
        
        if signal_info['signal'] == 'BUY':
            entry_price = current_price
            stop_loss = entry_price - sl_distance
            take_profit = entry_price + tp_distance
        elif signal_info['signal'] == 'SELL':
            entry_price = current_price
            stop_loss = entry_price + sl_distance
            take_profit = entry_price - tp_distance
        else:
            entry_price = stop_loss = take_profit = current_price
        
        return {
            'entry_price': entry_price,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'atr': atr,
            'sl_distance': sl_distance,
            'tp_distance': tp_distance,
            'risk_reward_ratio': tp_distance / sl_distance if sl_distance > 0 else 0
        }
    
    def _fallback_analysis(self, symbol: str) -> dict:
        """Análisis básico en caso de error"""
        try:
            df = self.mt5.get_price_data(symbol, mt5.TIMEFRAME_M15, 50)
            if df.empty:
                return {
                    'symbol': symbol,
                    'signal': 'HOLD',
                    'confidence': 0,
                    'error': 'No data available'
                }
            
            current_price = df['close'].iloc[-1]
            return {
                'symbol': symbol,
                'signal': 'HOLD',
                'confidence': 50,
                'entry_price': current_price,
                'stop_loss': current_price,
                'take_profit': current_price,
                'method': 'fallback'
            }
        except Exception as e:
            logger.error(f"Error in fallback analysis: {e}")
            return {
                'symbol': symbol,
                'signal': 'HOLD',
                'confidence': 0,
                'error': str(e)
            }
    
    def execute_smart_trade(self, analysis: dict) -> dict:
        """Ejecutar trade con lógica avanzada"""
        
        if analysis['signal'] == 'HOLD':
            return {'success': False, 'reason': 'No signal'}
        
        if analysis['confidence'] < self.min_confidence:
            return {'success': False, 'reason': f'Low confidence: {analysis["confidence"]:.1f}%'}
        
        # Verificar límites
        if self.daily_trade_count >= self.max_daily_trades:
            return {'success': False, 'reason': 'Daily limit reached'}
        
        # Verificar si ya hay posición en este símbolo
        if analysis['symbol'] in self.active_positions:
            return {'success': False, 'reason': 'Position already exists'}
        
        # Obtener información de cuenta
        account = self.mt5.get_account_info()
        if not account or account['free_margin'] < 100:
            return {'success': False, 'reason': 'Insufficient margin'}
        
        # Calcular tamaño de posición con gestión avanzada de riesgo
        lot_size = self._calculate_advanced_lot_size(analysis, account)
        
        if lot_size < 0.01:
            return {'success': False, 'reason': 'Lot size too small'}
        
        # Ejecutar orden
        order_type = mt5.ORDER_TYPE_BUY if analysis['signal'] == 'BUY' else mt5.ORDER_TYPE_SELL
        
        result = self.mt5.send_order(
            symbol=analysis['symbol'],
            order_type=order_type,
            volume=lot_size,
            sl=analysis['stop_loss'],
            tp=analysis['take_profit'],
            comment=f"AI_v2_{analysis['confidence']:.0f}_{analysis.get('ml_confidence', 0):.0f}"
        )
        
        if result['success']:
            # Registrar posición activa
            self.active_positions[analysis['symbol']] = {
                'ticket': result['ticket'],
                'symbol': analysis['symbol'],
                'signal': analysis['signal'],
                'entry_time': datetime.now(),
                'entry_price': result.get('price', analysis['entry_price']),
                'lot_size': lot_size,
                'stop_loss': analysis['stop_loss'],
                'take_profit': analysis['take_profit'],
                'analysis': analysis
            }
            
            # Actualizar contadores
            self.daily_trade_count += 1
            self.session_stats['total_trades'] += 1
            
            # Guardar en base de datos
            trade_data = {
                'timestamp': datetime.now(),
                'symbol': analysis['symbol'],
                'signal': analysis['signal'],
                'confidence': analysis['confidence'],
                'entry_price': result.get('price', analysis['entry_price']),
                'lot_size': lot_size,
                'status': 'OPEN',
                'market_conditions': analysis.get('analysis_details', {})
            }
            
            self.db.save_trade(trade_data)
            
            # Enviar notificación
            self.notifications.send_trade_notification({
                'symbol': analysis['symbol'],
                'signal': analysis['signal'],
                'entry_price': result.get('price', analysis['entry_price']),
                'lot_size': lot_size,
                'confidence': analysis['confidence'],
                'timestamp': datetime.now().strftime('%H:%M:%S')
            })
            
            logger.info(f"✅ TRADE EXECUTED: {analysis['symbol']} {analysis['signal']} "
                       f"Lot: {lot_size} Confidence: {analysis['confidence']:.1f}% "
                       f"ML: {analysis.get('ml_confidence', 0):.1f}%")
        
        return result
    
    def _calculate_advanced_lot_size(self, analysis: dict, account: dict) -> float:
        """Cálculo avanzado de tamaño de lote"""
        
        # Riesgo base ajustado por confianza
        confidence_factor = analysis['confidence'] / 100
        adjusted_risk = self.risk_per_trade * (0.5 + 0.5 * confidence_factor)
        
        # Ajustar por performance reciente
        recent_performance = self.db.get_performance_stats(7)  # 7 días
        if recent_performance:
            win_rate = recent_performance.get('win_rate', 50) / 100
            if win_rate < 0.4:  # Si win rate < 40%, reducir riesgo
                adjusted_risk *= 0.5
            elif win_rate > 0.7:  # Si win rate > 70%, aumentar riesgo
                adjusted_risk *= 1.2
        
        # Calcular basado en stop loss
        risk_amount = account['balance'] * adjusted_risk
        sl_distance = abs(analysis['entry_price'] - analysis['stop_loss'])
        
        if sl_distance == 0:
            return 0.01
        
        # Valor por punto (simplificado)
        symbol = analysis['symbol']
        if symbol == 'XAUUSD':
            point_value = 1.0
        elif symbol in ['EURUSD', 'GBPUSD']:
            point_value = 10.0
        elif symbol == 'BTCUSD':
            point_value = 0.01
        else:
            point_value = 1.0
        
        sl_points = sl_distance / (0.01 if symbol in ['EURUSD', 'GBPUSD'] else 0.1)
        lot_size = risk_amount / (sl_points * point_value)
        
        # Límites del símbolo
        symbol_info = self.mt5.get_symbol_info(symbol)
        if symbol_info:
            min_lot = symbol_info.get('min_lot', 0.01)
            max_lot = symbol_info.get('max_lot', 100.0)
            lot_step = symbol_info.get('lot_step', 0.01)
            
            lot_size = max(min_lot, min(max_lot, lot_size))
            lot_size = round(lot_size / lot_step) * lot_step
        
        return round(lot_size, 2)
    
    def monitor_positions(self):
        """Monitorear y gestionar posiciones abiertas"""
        try:
            current_positions = self.mt5.get_positions()
            position_tickets = {pos['ticket'] for pos in current_positions}
            
            # Actualizar posiciones cerradas
            closed_positions = []
            for symbol, position in list(self.active_positions.items()):
                if position['ticket'] not in position_tickets:
                    closed_positions.append(position)
                    del self.active_positions[symbol]
            
            # Procesar posiciones cerradas
            for position in closed_positions:
                self._process_closed_position(position)
            
            # Gestión avanzada de posiciones abiertas
            for position in current_positions:
                self._manage_open_position(position)
                
        except Exception as e:
            logger.error(f"Error monitoring positions: {e}")
    
    def _process_closed_position(self, position: dict):
        """Procesar posición cerrada para estadísticas"""
        try:
            # Buscar la posición actual para obtener el precio de cierre
            deals = mt5.history_deals_get(position=position['ticket'])
            if deals:
                exit_deal = deals[-1]  # Último deal (cierre)
                exit_price = exit_deal.price
                profit = exit_deal.profit
                
                # Calcular duración
                duration = datetime.now() - position['entry_time']
                duration_minutes = int(duration.total_seconds() / 60)
                
                # Actualizar estadísticas de sesión
                if profit > 0:
                    self.session_stats['winning_trades'] += 1
                
                self.session_stats['total_profit'] += profit
                
                # Actualizar en base de datos
                trade_data = {
                    'timestamp': position['entry_time'],
                    'symbol': position['symbol'],
                    'signal': position['signal'],
                    'confidence': position['analysis']['confidence'],
                    'entry_price': position['entry_price'],
                    'exit_price': exit_price,
                    'lot_size': position['lot_size'],
                    'profit': profit,
                    'status': 'CLOSED',
                    'duration_minutes': duration_minutes,
                    'market_conditions': position['analysis'].get('analysis_details', {})
                }
                
                self.db.save_trade(trade_data)
                
                # Log resultado
                result_emoji = "✅" if profit > 0 else "❌"
                logger.info(f"{result_emoji} POSITION CLOSED: {position['symbol']} "
                           f"P&L: ${profit:.2f} Duration: {duration_minutes}min")
                
        except Exception as e:
            logger.error(f"Error processing closed position: {e}")
    
    def _manage_open_position(self, position: dict):
        """Gestión avanzada de posiciones abiertas"""
        try:
            symbol = position['symbol']
            
            # Trailing stop avanzado
            if symbol in self.active_positions:
                self._apply_trailing_stop(position, self.active_positions[symbol])
            
            # Verificar condiciones de cierre anticipado
            self._check_early_exit_conditions(position)
            
        except Exception as e:
            logger.error(f"Error managing position {position.get('ticket', 'unknown')}: {e}")
    
    def _apply_trailing_stop(self, current_position: dict, tracked_position: dict):
        """Aplicar trailing stop inteligente"""
        try:
            current_price = current_position['price_current']
            entry_price = tracked_position['entry_price']
            current_sl = current_position['sl']
            position_type = current_position['type']
            
            # Obtener ATR actual para trailing distance
            df = self.mt5.get_price_data(current_position['symbol'], mt5.TIMEFRAME_M15, 50)
            if df.empty:
                return
            
            atr = df['close'].diff().abs().rolling(14).mean().iloc[-1]
            trailing_distance = atr * 1.5  # Distancia de trailing
            
            # Calcular profit en puntos
            if position_type == mt5.POSITION_TYPE_BUY:
                profit_points = current_price - entry_price
                new_sl = current_price - trailing_distance
                should_update = new_sl > current_sl and profit_points > trailing_distance
            else:  # SELL
                profit_points = entry_price - current_price
                new_sl = current_price + trailing_distance
                should_update = new_sl < current_sl and profit_points > trailing_distance
            
            # Actualizar trailing stop si es beneficioso
            if should_update:
                result = self.mt5.trade.PositionModify(
                    current_position['symbol'],
                    new_sl,
                    current_position['tp']
                )
                
                if result.retcode == mt5.TRADE_RETCODE_DONE:
                    logger.info(f"🔄 Trailing stop updated for {current_position['symbol']}: {new_sl:.5f}")
                
        except Exception as e:
            logger.error(f"Error applying trailing stop: {e}")
    
    def _check_early_exit_conditions(self, position: dict):
        """Verificar condiciones para cierre anticipado"""
        try:
            symbol = position['symbol']
            
            # Obtener análisis actual
            current_analysis = self.analyze_market_advanced(symbol)
            
            # Si la señal cambió significativamente, considerar cierre
            if symbol in self.active_positions:
                original_signal = self.active_positions[symbol]['signal']
                current_signal = current_analysis['signal']
                
                # Señal opuesta con alta confianza
                if (original_signal == 'BUY' and current_signal == 'SELL' and 
                    current_analysis['confidence'] > 80):
                    
                    logger.info(f"⚠️ Strong opposite signal detected for {symbol}, considering early exit")
                    # Aquí podrías implementar lógica de cierre anticipado
                
        except Exception as e:
            logger.error(f"Error checking early exit conditions: {e}")
    
    def train_ml_model_with_history(self):
        """Entrenar modelo ML con historial de trades"""
        try:
            logger.info("🧠 Starting ML model training...")
            
            # Obtener datos históricos para entrenamiento
            all_data = []
            all_labels = []
            
            for symbol in self.symbols:
                # Obtener datos históricos
                historical_data = self.mt5.get_price_data(symbol, mt5.TIMEFRAME_M15, 2000)
                if historical_data.empty:
                    continue
                
                # Generar labels basados en movimientos futuros
                future_returns = historical_data['close'].shift(-10) / historical_data['close'] - 1
                
                # Clasificar: 0=SELL, 1=HOLD, 2=BUY
                labels = pd.Series(1, index=historical_data.index)  # Default HOLD
                labels[future_returns > 0.005] = 2  # BUY si subida > 0.5%
                labels[future_returns < -0.005] = 0  # SELL si bajada > 0.5%
                
                all_data.append(historical_data)
                all_labels.append(labels)
            
            if all_data:
                # Combinar todos los datos
                combined_data = pd.concat(all_data, ignore_index=True)
                combined_labels = pd.concat(all_labels, ignore_index=True)
                
                # Entrenar modelo
                if self.ml_predictor.train_model(combined_data, combined_labels):
                    logger.info("✅ ML model training completed successfully")
                else:
                    logger.warning("⚠️ ML model training failed")
            
        except Exception as e:
            logger.error(f"Error training ML model: {e}")
    
    def run_trading_cycle(self):
        """Ciclo principal de trading"""
        while self.is_running:
            try:
                # Reset contador diario
                current_date = datetime.now().date()
                if current_date != self.last_reset_date:
                    self.daily_trade_count = 0
                    self.last_reset_date = current_date
                    logger.info("🔄 Daily trade counter reset")
                    
                    # Entrenar modelo semanalmente
                    if current_date.weekday() == 0:  # Lunes
                        threading.Thread(target=self.train_ml_model_with_history, daemon=True).start()
                
                # Monitorear posiciones existentes
                self.monitor_positions()
                
                # Analizar mercados
                for symbol in self.symbols:
                    if not self.is_running:
                        break
                    
                    try:
                        # Análisis avanzado
                        analysis = self.analyze_market_advanced(symbol)
                        self.analysis_history[symbol] = analysis
                        
                        logger.info(f"📊 {symbol}: {analysis['signal']} "
                                   f"({analysis['confidence']:.1f}% conf, "
                                   f"ML: {analysis.get('ml_confidence', 0):.1f}%)")
                        
                        # Ejecutar trade si hay señal fuerte
                        if (analysis['confidence'] > self.min_confidence and 
                            analysis['signal'] != 'HOLD'):
                            
                            result = self.execute_smart_trade(analysis)
                            if not result['success']:
                                logger.debug(f"Trade not executed for {symbol}: {result.get('reason')}")
                        
                    except Exception as e:
                        logger.error(f"Error analyzing {symbol}: {e}")
                        continue
                
                # Pausa entre ciclos
                time.sleep(30)
                
            except Exception as e:
                logger.error(f"Error in trading cycle: {e}")
                time.sleep(60)
    
    def start(self):
        """Iniciar sistema avanzado"""
        if not self.mt5.connected:
            if not self.mt5.connect():
                logger.error("❌ Cannot start: MT5 not connected")
                return False
        
        # Cargar modelo ML si existe
        self.ml_predictor.load_model()
        
        # Inicializar estadísticas de sesión
        self.session_stats['start_time'] = datetime.now()
        
        self.is_running = True
        self.trading_thread = threading.Thread(target=self.run_trading_cycle, daemon=True)
        self.trading_thread.start()
        
        logger.info("🚀 Advanced AI Trading System Started")
        logger.info(f"📊 Monitoring: {', '.join(self.symbols)}")
        logger.info(f"🎯 Min Confidence: {self.min_confidence}%")
        logger.info(f"💰 Risk per Trade: {self.risk_per_trade*100}%")
        
        return True
    
    def stop(self):
        """Detener sistema"""
        self.is_running = False
        if hasattr(self, 'trading_thread'):
            self.trading_thread.join(timeout=5)
        
        # Estadísticas finales
        if self.session_stats['total_trades'] > 0:
            win_rate = (self.session_stats['winning_trades'] / 
                       self.session_stats['total_trades']) * 100
            logger.info(f"📊 Session Summary:")
            logger.info(f"   Total Trades: {self.session_stats['total_trades']}")
            logger.info(f"   Win Rate: {win_rate:.1f}%")
            logger.info(f"   Total P&L: ${self.session_stats['total_profit']:.2f}")
        
        logger.info("🛑 Advanced AI Trading System Stopped")
    
    def get_detailed_status(self) -> dict:
        """Obtener estado detallado del sistema"""
        account = self.mt5.get_account_info()
        positions = self.mt5.get_positions()
        recent_performance = self.db.get_performance_stats(7)
        
        return {
            'system': {
                'is_running': self.is_running,
                'daily_trades': self.daily_trade_count,
                'session_start': self.session_stats['start_time'],
                'ml_model_trained': self.ml_predictor.is_trained
            },
            'account': account,
            'positions': {
                'count': len(positions),
                'active_symbols': list(self.active_positions.keys()),
                'total_profit': sum(pos['profit'] for pos in positions)
            },
            'performance': recent_performance,
            'last_analysis': {
                symbol: {
                    'signal': analysis['signal'],
                    'confidence': analysis['confidence'],
                    'timestamp': analysis['timestamp'].strftime('%H:%M:%S')
                }
                for symbol, analysis in self.analysis_history.items()
            }
        }

# Configuración de ejemplo
def create_advanced_config():
    """Crear configuración avanzada"""
    return {
        'symbols': ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'],
        'risk_per_trade': 0.015,  # 1.5% por trade
        'max_daily_trades': 8,
        'min_confidence': 75,
        'notifications': {
            'telegram_enabled': False,
            'telegram_bot_token': 'YOUR_BOT_TOKEN',
            'telegram_chat_id': 'YOUR_CHAT_ID',
            'discord_enabled': False,
            'discord_webhook_url': 'YOUR_WEBHOOK_URL'
        }
    }

# Función principal mejorada
def main_advanced():
    """Función principal del sistema avanzado"""
    
    # CONFIGURACIÓN - CAMBIAR CON TUS DATOS
    MT5_LOGIN = 12345678
    MT5_PASSWORD = "tu_password"
    MT5_SERVER = "MetaQuotes-Demo"
    
    # Crear conector MT5 (reutilizar la clase anterior)
    from advanced_ai_trading import MT5Connector  # Importar de archivo anterior
    mt5_connector = MT5Connector(MT5_LOGIN, MT5_PASSWORD, MT5_SERVER)
    
    # Configuración avanzada
    config = create_advanced_config()
    
    # Crear sistema avanzado
    trading_system = AdvancedAITradingSystem(mt5_connector, config)
    
    try:
        if trading_system.start():
            print("🤖 Sistema de Trading IA Avanzado iniciado")
            print("🧠 Incluye: ML, Multi-timeframe, Gestión avanzada de riesgo")
            print("📊 Monitoreando múltiples pares con análisis inteligente")
            print("⚠️  Presiona Ctrl+C para detener")
            
            # Loop principal con estadísticas
            last_status_time = time.time()
            
            while True:
                time.sleep(5)
                
                # Mostrar estado cada 30 segundos
                if time.time() - last_status_time > 30:
                    status = trading_system.get_detailed_status()
                    
                    print(f"\n{'='*60}")
                    print(f"⏰ {datetime.now().strftime('%H:%M:%S')}")
                    print(f"💰 Balance: ${status['account'].get('balance', 0):.2f}")
                    print(f"📈 Equity: ${status['account'].get('equity', 0):.2f}")
                    print(f"📊 Trades hoy: {status['system']['daily_trades']}")
                    print(f"🔄 Posiciones: {status['positions']['count']}")
                    print(f"🧠 ML Model: {'✅' if status['system']['ml_model_trained'] else '❌'}")
                    
                    if status['performance']:
                        perf = status['performance']
                        print(f"🎯 Win Rate (7d): {perf.get('win_rate', 0):.1f}%")
                        print(f"💵 P&L (7d): ${perf.get('total_profit', 0):.2f}")
                    
                    print(f"📊 Último análisis:")
                    for symbol, analysis in status['last_analysis'].items():
                        signal_emoji = "📈" if analysis['signal'] == 'BUY' else "📉" if analysis['signal'] == 'SELL' else "⏸️"
                        print(f"   {symbol}: {signal_emoji} {analysis['signal']} ({analysis['confidence']:.1f}%)")
                    
                    last_status_time = time.time()
        
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo sistema avanzado...")
        trading_system.stop()
        mt5_connector.disconnect()
        print("✅ Sistema detenido correctamente")
    except Exception as e:
        logger.error(f"Error in main: {e}")
        trading_system.stop()
        mt5_connector.disconnect()

if __name__ == "__main__":
    main_advanced()