
# mt5_connector.py
"""
Conector para MetaTrader 5
"""
import MetaTrader5 as mt5
import logging

class MT5Connector:
    def __init__(self, login, password, server):
        self.login = login
        self.password = password
        self.server = server
        self.connected = False
        self.logger = logging.getLogger('MT5Connector')

    def test_connection(self):
        print('Probando conexión a MetaTrader 5...')
        if not mt5.initialize():
            print('Error inicializando MT5:', mt5.last_error())
            return False
        authorized = mt5.login(self.login, password=self.password, server=self.server)
        if not authorized:
            print('Error de login:', mt5.last_error())
            mt5.shutdown()
            return False
        print('Conexión exitosa')
        info = mt5.account_info()
        if info:
            print('Info de cuenta:', info._asdict())
        else:
            print('No se pudo obtener info de la cuenta')
        mt5.shutdown()
        return True

    def connect(self):
        if mt5.initialize():
            if mt5.login(self.login, password=self.password, server=self.server):
                self.connected = True
                self.logger.info('Conexión MT5 exitosa')
                return True
            else:
                self.logger.error('Error de login MT5')
        else:
            self.logger.error('Error inicializando MT5')
        self.connected = False
        return False

    def disconnect(self):
        mt5.shutdown()
        self.connected = False
        self.logger.info('Conexión MT5 cerrada')

    def get_account_info(self):
        info = mt5.account_info()
        if info:
            return info._asdict()
        return {}

    def get_symbol_info(self, symbol):
        info = mt5.symbol_info(symbol)
        if info:
            return info._asdict()
        return {}

    def send_order(self, symbol, action, lot, price=None, sl=None, tp=None):
        order_type = mt5.ORDER_TYPE_BUY if action == 'BUY' else mt5.ORDER_TYPE_SELL
        tick = mt5.symbol_info_tick(symbol)
        if not tick:
            print(f'No se pudo obtener tick para {symbol}')
            return None
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": lot,
            "type": order_type,
            "price": price if price else (tick.ask if action == 'BUY' else tick.bid),
            "sl": sl,
            "tp": tp,
            "deviation": 10,
            "magic": 123456,
            "comment": "AI Trade",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        result = mt5.order_send(request)
        print('Resultado de la orden:', result)
        return result
