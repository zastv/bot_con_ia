TRADINGVIEW_SYMBOLS = {"XAUUSD", "EURUSD", "GBPUSD", "BTCUSD"}

def is_symbol_valid(pair):
    return pair in TRADINGVIEW_SYMBOLS

import yfinance as yf
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


SYMBOLS = {
    'XAUUSD': 'GC=F',   # Gold Futures
    'EURUSD': 'EURUSD=X',
    'GBPUSD': 'GBPUSD=X',
    'BTCUSD': 'BTCUSD=X',  # Yahoo Finance spot BTC/USD
}

def get_current_prices():
    prices = {}
    for pair, symbol in SYMBOLS.items():
        ticker = yf.Ticker(symbol)
        data = ticker.history(period='1d', interval='1m')
        if not data.empty:
            last = data['Close'].iloc[-1]
            prices[pair] = float(last)
        else:
            prices[pair] = None
    return prices

def is_price_reasonable(pair, entry, tolerance=0.02):
    """Verifica si el precio de entrada está dentro de un rango razonable del precio actual."""
    prices = get_current_prices()
    if pair not in prices or prices[pair] is None:
        return False
    real_price = prices[pair]
    return abs(entry - real_price) / real_price <= tolerance


@app.route('/api/prices')
def get_prices():
    prices = get_current_prices()
    return jsonify(prices)

@app.route('/api/verify_signal', methods=['POST'])
def verify_signal():
    """
    Espera un JSON con: { "pair": "BTCUSD", "entry": 113.15 }
    Devuelve: { "ok": true/false, "real_price": ..., "msg": ... }
    """
    data = request.json
    pair = data.get("pair")
    entry = data.get("entry")
    if pair is None or entry is None:
        return jsonify({"ok": False, "msg": "Faltan datos"}), 400
    if not is_symbol_valid(pair):
        return jsonify({"ok": False, "msg": f"El símbolo {pair} no es válido en TradingView"}), 400
    if not isinstance(entry, (int, float)):
        try:
            entry = float(entry)
        except Exception:
            return jsonify({"ok": False, "msg": "Entrada inválida"}), 400
    prices = get_current_prices()
    real_price = prices.get(pair)
    if real_price is None:
        return jsonify({"ok": False, "msg": "No hay precio actual para ese par"}), 400
    if is_price_reasonable(pair, entry):
        return jsonify({"ok": True, "real_price": real_price, "msg": "Precio razonable"})
    else:
        return jsonify({
            "ok": False,
            "real_price": real_price,
            "msg": f"El precio de entrada ({entry}) está fuera del rango permitido respecto al precio actual ({real_price})"
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
