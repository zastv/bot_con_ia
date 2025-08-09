#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SISTEMA DE TRADING IA AVANZADO - MAIN
Autor: AI Trading Team
Versión: 2.0
Fecha: 2025

IMPORTANTE: 
- Usar siempre en cuenta DEMO primero
- El trading conlleva riesgos significativos
- No operar con dinero que no puedas permitirte perder
"""

import sys
import os
import argparse
import signal
import time
import threading
from datetime import datetime
import logging
from pathlib import Path

# Crear directorios necesarios
Path("logs").mkdir(exist_ok=True)
Path("data").mkdir(exist_ok=True)
Path("models").mkdir(exist_ok=True)

# Configurar logging principal
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/main.log'),
        logging.StreamHandler(sys.stdout)
    ]
)


logger = logging.getLogger('MainSystem')

# === PRUEBA DE CONEXIÓN Y ENVÍO DE ORDEN REAL ===
try:
    from config import MT5_CONFIG
    from mt5_connector import MT5Connector
    mt5 = MT5Connector(
        MT5_CONFIG['login'],
        MT5_CONFIG['password'],
        MT5_CONFIG['server']
    )
    mt5.test_connection()
    # Ejemplo: enviar orden real BUY 0.01 lotes EURUSD
    # mt5.send_order('EURUSD', 'BUY', 0.01)
except Exception as e:
    print(f'Error en prueba de conexión/orden: {e}')

# Importar componentes del sistema
try:
    from config import (
        MT5_CONFIG, TRADING_CONFIG, NOTIFICATION_CONFIG, 
        ML_CONFIG, RISK_CONFIG
    )
    from mt5_connector import MT5Connector
    from ai_system import AdvancedAITradingSystem
    from database import DatabaseManager
    from notifications import NotificationManager
    from ml_predictor import MLPredictor
    
    logger.info("✅ Todos los módulos importados correctamente")
    
except ImportError as e:
    logger.error(f"❌ Error importando módulos: {e}")
    logger.error("💡 Asegúrate de tener todos los archivos en el directorio")
    sys.exit(1)

mt5 = MT5Connector(
    MT5_CONFIG['login'],
    MT5_CONFIG['password'],
    MT5_CONFIG['server']
)
mt5.test_connection()

# ...existing code...
# (El resto del código está en el mensaje del usuario y se copiará completo)
