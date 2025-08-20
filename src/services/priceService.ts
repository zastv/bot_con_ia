import axios from 'axios';

export const fetchPrice = async (pair: string): Promise<number> => {
  // Usar Binance para BTCUSDT y ETHUSDT, TwelveData para forex y oro
  if (pair === 'BTCUSDT' || pair === 'ETHUSDT') {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      return parseFloat(res.data.price);
    } catch {
      return 0;
    }
  } else {
    // TwelveData demo API (limitado, solo para demo)
    try {
      const res = await axios.get(`https://api.twelvedata.com/price?symbol=${pair}&apikey=demo`);
      return parseFloat(res.data.price);
    } catch {
      return 0;
    }
  }
};
