import { MarketDataProvider } from './market-data.provider';
import { StockQuote, HistoricalCandle, StockBasicInfo, OrderBookDepth } from '@/types/market';
import { STOCKS } from '@/lib/constants';

export class MockMarketDataProvider implements MarketDataProvider {
  name = 'MockMarketDataProvider';

  private quoteCache = new Map<string, { quote: StockQuote; timestamp: number }>();
  private CACHE_TTL_MS = 10000;

  private getTickSize(price: number): number {
    if (price < 200) return 1;
    if (price < 500) return 2;
    if (price < 2000) return 5;
    if (price < 5000) return 10;
    return 25;
  }

  async getStockList(): Promise<StockBasicInfo[]> {
    return STOCKS;
  }

  async getQuote(ticker: string): Promise<StockQuote> {
    const upperTicker = ticker.toUpperCase();
    const cached = this.quoteCache.get(upperTicker);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.quote;
    }

    const stock = STOCKS.find((s) => s.ticker === upperTicker) || {
      ticker: upperTicker,
      name: `${upperTicker} Tbk`,
      sector: 'Diversified',
      basePrice: 1000,
      peRatio: 12.0,
      marketCap: '50 T',
      yahooSymbol: `${upperTicker}.JK`,
      description: `Emiten ${upperTicker} di Bursa Efek Indonesia.`,
    };

    const now = Date.now();
    const hash = upperTicker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const cycle = Math.sin((now / 45000) * 2 + hash);
    const microCycle = Math.cos(now / 12000 + hash * 2);

    const variationPct = (cycle * 1.6 + microCycle * 0.7) / 100;
    let price = Math.round(stock.basePrice * (1 + variationPct));

    const tick = this.getTickSize(price);
    price = Math.round(price / tick) * tick;
    price = Math.max(1, price);

    const prevClose = stock.basePrice;
    const change = price - prevClose;
    const changePercent = parseFloat(((change / prevClose) * 100).toFixed(2));
    const high = Math.max(price, Math.round(prevClose * 1.025));
    const low = Math.min(price, Math.round(prevClose * 0.975));
    const open = Math.round((prevClose + price) / 2);
    const volume = Math.round(15000000 + Math.sin(hash + now / 60000) * 8000000);

    const quote: StockQuote = {
      ticker: upperTicker,
      name: stock.name,
      sector: stock.sector,
      price,
      change,
      change_percent: changePercent,
      open,
      high,
      low,
      prev_close: prevClose,
      volume,
      timestamp: new Date().toISOString(),
    };

    this.quoteCache.set(upperTicker, { quote, timestamp: Date.now() });
    return quote;
  }

  async getHistoricalPrices(ticker: string, range: '1D' | '1W' | '1M' | '1Y'): Promise<HistoricalCandle[]> {
    const stock = STOCKS.find((s) => s.ticker === ticker.toUpperCase()) || STOCKS[0];
    const base = stock.basePrice;
    const candles: HistoricalCandle[] = [];
    const now = new Date();

    let count = 24;
    let stepMs = 60 * 60 * 1000;

    if (range === '1W') {
      count = 7;
      stepMs = 24 * 60 * 60 * 1000;
    } else if (range === '1M') {
      count = 30;
      stepMs = 24 * 60 * 60 * 1000;
    } else if (range === '1Y') {
      count = 52;
      stepMs = 7 * 24 * 60 * 60 * 1000;
    }

    let runningPrice = base * 0.93;
    const hash = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    for (let i = count; i >= 0; i--) {
      const time = new Date(now.getTime() - i * stepMs);
      const wave = Math.sin((i + hash) * 0.4) * (base * 0.04);
      const noise = ((Math.sin(i * 13 + hash) + 1) / 2 - 0.5) * (base * 0.03);

      const open = Math.round(runningPrice);
      const close = Math.round(Math.max(base * 0.7, runningPrice + wave * 0.3 + noise));
      const high = Math.round(Math.max(open, close) + Math.abs(noise * 1.5) + 20);
      const low = Math.round(Math.max(base * 0.6, Math.min(open, close) - Math.abs(noise * 1.2) - 15));
      const volume = Math.round(200000 + Math.abs(Math.sin(i + hash)) * 1500000);

      candles.push({
        timestamp: range === '1D' ? time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        open,
        high,
        low,
        close,
        volume,
      });

      runningPrice = close;
    }

    return candles;
  }

  async getOrderBook(ticker: string, currentPrice?: number): Promise<OrderBookDepth> {
    const price = currentPrice || (await this.getQuote(ticker)).price;
    const tick = this.getTickSize(price);
    const hash = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    const bids = [];
    const asks = [];

    for (let i = 1; i <= 5; i++) {
      const bidPrice = Math.max(1, price - i * tick);
      const askPrice = price + (i - 1) * tick;

      const bidLots = Math.round(1500 + Math.sin(i + hash) * 800 + (6 - i) * 1200);
      const askLots = Math.round(1400 + Math.cos(i + hash) * 700 + (6 - i) * 1100);

      bids.push({
        price: bidPrice,
        lots: bidLots,
        orders: Math.round(bidLots / 25 + 5),
      });

      asks.push({
        price: askPrice,
        lots: askLots,
        orders: Math.round(askLots / 25 + 5),
      });
    }

    return {
      ticker: ticker.toUpperCase(),
      bids,
      asks,
      spread: asks[0].price - bids[0].price,
      lastPrice: price,
    };
  }
}
