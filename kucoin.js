const axios = require('axios');
const crypto = require('crypto');

const KUCOIN_API = process.env.KUCOIN_API || 'https://api.kucoin.com';
const API_KEY = process.env.KUCOIN_API_KEY;
const API_SECRET = process.env.KUCOIN_API_SECRET;
const API_PASSPHRASE = process.env.KUCOIN_API_PASSPHRASE;

class KucoinClient {
  generateSignature(timestamp, method, endpoint, body = '') {
    const what = timestamp + method + endpoint + body;
    return crypto.createHmac('sha256', API_SECRET).update(what).digest('base64');
  }

  async getFuturesFavoritePairs() {
    try {
      if (!API_KEY || !API_SECRET || !API_PASSPHRASE) {
        console.warn('⚠️  KuCoin API credentials not found. Using default pairs.');
        return this.getDefaultFavorites();
      }

      const timestamp = Date.now();
      const endpoint = '/api/v1/favoriteSymbols';
      const signature = this.generateSignature(timestamp, 'GET', endpoint);
      const passphraseHash = crypto.createHmac('sha256', API_SECRET).update(API_PASSPHRASE).digest('base64');

      const response = await axios.get(`${KUCOIN_API}${endpoint}`, {
        headers: {
          'KC-API-SIGN': signature,
          'KC-API-TIMESTAMP': timestamp,
          'KC-API-KEY': API_KEY,
          'KC-API-PASSPHRASE': passphraseHash,
          'KC-API-KEY-VERSION': '2'
        }
      });

      const favoriteSymbols = (response.data?.data || []).map(symbol => symbol);
      return favoriteSymbols.length > 0 ? favoriteSymbols : this.getDefaultFavorites();
    } catch (error) {
      console.error('Error fetching KuCoin futures favorite pairs:', error.message);
      return this.getDefaultFavorites();
    }
  }

  getDefaultFavorites() {
    return [];
  }

  async getAllTickers() {
    try {
      const response = await axios.get(`${KUCOIN_API}/api/v1/market/allTickers`);
      return response.data.data.ticker;
    } catch (error) {
      console.error('Error fetching Kucoin tickers:', error.message);
      return [];
    }
  }

  async getFavoritePairs(favorites) {
    try {
      const tickers = await this.getAllTickers();
      const favoriteMap = favorites.reduce((acc, fav) => {
        acc[fav.toUpperCase()] = true;
        acc[fav.replace('/', '-').toUpperCase()] = true;
        return acc;
      }, {});

      return tickers
        .filter(ticker => ticker.symbol.endsWith('USDT') && favoriteMap[ticker.symbol.toUpperCase()])
        .map(ticker => ({
          symbol: ticker.symbol.replace('-', ''),
          pair: ticker.symbol.replace('-', ''),
          priceChange: this.calculatePriceChange(ticker),
          volume24h: ticker.vol,
          lastPrice: ticker.last
        }));
    } catch (error) {
      console.error('Error fetching favorite pairs from Kucoin:', error.message);
      return [];
    }
  }

  async getTopActiveByVolume(limit = 50) {
    try {
      const tickers = await this.getAllTickers();
      return tickers
        .filter(ticker => ticker.symbol.endsWith('USDT') && parseFloat(ticker.vol) > 0)
        .sort((a, b) => parseFloat(b.volValue) - parseFloat(a.volValue))
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.symbol.replace('-', ''),
          pair: ticker.symbol.replace('-', ''),
          volume24h: ticker.vol,
          priceChange: this.calculatePriceChange(ticker),
          lastPrice: ticker.last
        }));
    } catch (error) {
      console.error('Error fetching top active pairs from Kucoin:', error.message);
      return [];
    }
  }

  async getTopGainers(limit = 50) {
    try {
      const tickers = await this.getAllTickers();
      return tickers
        .filter(ticker => {
          const change = this.calculatePriceChange(ticker);
          return ticker.symbol.endsWith('USDT') && change > 0;
        })
        .sort((a, b) => this.calculatePriceChange(b) - this.calculatePriceChange(a))
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.symbol.replace('-', ''),
          pair: ticker.symbol.replace('-', ''),
          priceChange: this.calculatePriceChange(ticker),
          volume24h: ticker.vol,
          lastPrice: ticker.last
        }));
    } catch (error) {
      console.error('Error fetching top gainers from Kucoin:', error.message);
      return [];
    }
  }

  async getTopLosers(limit = 50) {
    try {
      const tickers = await this.getAllTickers();
      return tickers
        .filter(ticker => {
          const change = this.calculatePriceChange(ticker);
          return ticker.symbol.endsWith('USDT') && change < 0;
        })
        .sort((a, b) => this.calculatePriceChange(a) - this.calculatePriceChange(b))
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.symbol.replace('-', ''),
          pair: ticker.symbol.replace('-', ''),
          priceChange: this.calculatePriceChange(ticker),
          volume24h: ticker.vol,
          lastPrice: ticker.last
        }));
    } catch (error) {
      console.error('Error fetching top losers from Kucoin:', error.message);
      return [];
    }
  }

  calculatePriceChange(ticker) {
    if (!ticker.last || !ticker.buy) return 0;
    const change = ((ticker.last - ticker.buy) / ticker.buy) * 100;
    return parseFloat(change.toFixed(2));
  }
}

module.exports = new KucoinClient();
