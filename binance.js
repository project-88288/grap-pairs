const { USDMClient } = require('binance');

const client = new USDMClient();

class BinanceClient {
  async getFuturesFavoritePairs() {
    return this.getDefaultFavorites();
  }

  getDefaultFavorites() {
    return [];
  }

  async get24hStats() {
    try {
      const tickers = await client.get24hrChangeStatistics();
      return tickers.filter(t => t.symbol.endsWith('USDT'));
    } catch (error) {
      console.error('Error fetching Binance 24h stats:', error.message);
      return [];
    }
  }

  async getFavoritePairs(favorites) {
    try {
      const stats = await this.get24hStats();
      const favoriteSymbols = favorites.map(f => f.replace('/', ''));

      return stats
        .filter(ticker => favoriteSymbols.includes(ticker.symbol))
        .map(ticker => ({
          symbol: ticker.symbol,
          pair: this.formatPair(ticker.symbol),
          priceChange: ticker.priceChangePercent,
          volume24h: ticker.quoteVolume,
          lastPrice: ticker.lastPrice
        }));
    } catch (error) {
      console.error('Error fetching favorite pairs from Binance:', error.message);
      return [];
    }
  }

  async getTopActiveByVolume(limit = 50) {
    try {
      const stats = await this.get24hStats();
      return stats
        .filter(ticker => parseFloat(ticker.quoteVolume) > 0)
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.symbol,
          pair: this.formatPair(ticker.symbol),
          volume24h: ticker.quoteVolume,
          priceChange: ticker.priceChangePercent,
          lastPrice: ticker.lastPrice
        }));
    } catch (error) {
      console.error('Error fetching top active pairs from Binance:', error.message);
      return [];
    }
  }

  async getTopGainers(limit = 50) {
    try {
      const stats = await this.get24hStats();
      return stats
        .filter(ticker => parseFloat(ticker.priceChangePercent) > 0)
        .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.symbol,
          pair: this.formatPair(ticker.symbol),
          priceChange: ticker.priceChangePercent,
          volume24h: ticker.quoteVolume,
          lastPrice: ticker.lastPrice
        }));
    } catch (error) {
      console.error('Error fetching top gainers from Binance:', error.message);
      return [];
    }
  }

  async getTopLosers(limit = 50) {
    try {
      const stats = await this.get24hStats();
      return stats
        .filter(ticker => parseFloat(ticker.priceChangePercent) < 0)
        .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.symbol,
          pair: this.formatPair(ticker.symbol),
          priceChange: ticker.priceChangePercent,
          volume24h: ticker.quoteVolume,
          lastPrice: ticker.lastPrice
        }));
    } catch (error) {
      console.error('Error fetching top losers from Binance:', error.message);
      return [];
    }
  }

  async getTopPairs(limit = 20) {
    try {
      const tickers = await client.get24hrChangeStatistics();
      const top = tickers
        .filter(t => t.symbol.endsWith('USDT'))
        .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
        .slice(0, limit);

      return top.map(t => ({
        symbol: t.symbol,
        volume: Number(t.quoteVolume).toLocaleString(),
        change: `${t.priceChangePercent}%`,
        price: t.lastPrice
      }));
    } catch (error) {
      console.error('Error fetching top pairs from Binance:', error.message);
      return [];
    }
  }

  formatPair(symbol) {
    // Convert BTCUSDT to BTC/USDT format
    if (symbol.endsWith('USDT')) {
      return symbol.slice(0, -4) + '/USDT';
    }
    if (symbol.endsWith('BUSD')) {
      return symbol.slice(0, -4) + '/BUSD';
    }
    if (symbol.endsWith('USDC')) {
      return symbol.slice(0, -4) + '/USDC';
    }
    if (symbol.endsWith('TUSD')) {
      return symbol.slice(0, -4) + '/TUSD';
    }
    return symbol;
  }
}

module.exports = new BinanceClient();
