# ml_predictor.py
"""
Módulo de Machine Learning para predicción de señales de trading
"""
import joblib
import os
import logging

class MLPredictor:
    def __init__(self, ml_config):
        self.model_path = ml_config.get('model_path', 'trading_model.joblib')
        self.logger = logging.getLogger('MLPredictor')
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                self.logger.info(f"Modelo ML cargado: {self.model_path}")
            except Exception as e:
                self.logger.error(f"Error cargando modelo ML: {e}")
        else:
            self.logger.info("No se encontró modelo ML, se requiere entrenamiento")

    def predict(self, features):
        if self.model:
            return self.model.predict([features])[0]
        else:
            self.logger.warning("Modelo ML no disponible")
            return None
