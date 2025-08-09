import MetaTrader5 as mt5
from config import MT5_CONFIG

print('Iniciando prueba de conexión a MetaTrader 5...')

if not mt5.initialize():
    print('Error inicializando MT5:', mt5.last_error())
else:
    authorized = mt5.login(
        MT5_CONFIG['login'],
        password=MT5_CONFIG['password'],
        server=MT5_CONFIG['server']
    )
    if not authorized:
        print('Error de login:', mt5.last_error())
    else:
        print('Conexión exitosa')
        print('Info de cuenta:', mt5.account_info())
    mt5.shutdown()
