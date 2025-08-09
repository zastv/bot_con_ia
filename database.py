# database.py
"""
Gestor de base de datos para el sistema de trading IA
"""
import sqlite3
import logging

class DatabaseManager:
    def __init__(self, db_path='data/trading.db'):
        self.db_path = db_path
        self.logger = logging.getLogger('DatabaseManager')
        self.conn = None

    def init_database(self):
        self.conn = sqlite3.connect(self.db_path)
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT,
                signal TEXT,
                confidence REAL,
                pnl REAL,
                timestamp TEXT
            )
        ''')
        self.conn.commit()
        self.logger.info('Base de datos inicializada')

    def get_performance_stats(self, days=1):
        # Simulación de estadísticas
        return {
            'total_trades': 0,
            'win_rate': 0,
            'total_profit': 0,
            'avg_profit': 0
        }
