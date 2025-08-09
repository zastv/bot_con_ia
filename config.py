# config.py - Configuración del Sistema

# === CONFIGURACIÓN MT5 ===
MT5_CONFIG = {
    'login': 19379696,          # Número de cuenta MT5
    'password': 'jY4)mB[9',     # Contraseña comercial
    'server': 'Weltrade-Demo', # Servidor demo (ajusta si es otro)
    'leverage': '1:1000',
    'balance': 200.00,
    'premium': False,
    'tipo_cuenta': 'Demo'
}

# === CONFIGURACIÓN DE TRADING ===
TRADING_CONFIG = {
    'symbols': ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'],
    'risk_per_trade': 0.015,    # 1.5% por trade
    'max_daily_trades': 8,      # Máximo 8 trades por día
    'min_confidence': 75,       # Mínimo 75% confianza
    'analysis_interval': 30,    # Segundos entre análisis
    'enable_ml': True,          # Habilitar Machine Learning
    'enable_notifications': True
}

# === NOTIFICACIONES ===
NOTIFICATION_CONFIG = {
    'telegram': {
        'enabled': False,       # Cambiar a True para habilitar
        'bot_token': 'TU_BOT_TOKEN',
        'chat_id': 'TU_CHAT_ID'
    },
    'discord': {
        'enabled': False,       # Cambiar a True para habilitar
        'webhook_url': 'TU_WEBHOOK_URL'
    }
}

# === CONFIGURACIÓN ML ===
ML_CONFIG = {
    'model_path': 'trading_model.joblib',
    'retrain_frequency': 'weekly',  # daily, weekly, monthly
    'min_training_samples': 100,
    'feature_importance_threshold': 0.01
}

# === CONFIGURACIÓN DE RIESGO ===
RISK_CONFIG = {
    'max_drawdown': 0.15,       # 15% máximo drawdown
    'max_concurrent_trades': 4,  # Máximo 4 trades simultáneos
    'emergency_stop_loss': 0.05, # 5% pérdida = parar sistema
    'profit_target_daily': 0.03  # 3% ganancia diaria objetivo
}

# === LÍMITES DE SEGURIDAD ===
SAFETY_LIMITS = {
    'max_loss_per_day': 500,    # $500 máximo por día
    'max_loss_per_trade': 100,  # $100 máximo por trade
    'stop_on_consecutive_losses': 3,  # Parar tras 3 pérdidas
    'emergency_balance_limit': 1000   # Parar si balance < $1000
}
