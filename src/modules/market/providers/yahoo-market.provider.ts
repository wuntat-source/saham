import { MarketDataProvider } from './market-data.provider';
import { MockMarketDataProvider } from './mock-market.provider';
import { StockQuote, HistoricalCandle, StockBasicInfo, OrderBookDepth } from '@/types/market';
import { STOCKS } from '@/lib/constants';

export class YahooMarketDataProvider implements MarketDataProvider {
  name = 'YahooMarketDataProvider';
  private fallbackProvider = new MockMarketDataProvider();
  private quoteCache = new Map<string, { quote: StockQuote; timestamp: number }>();
  private CACHE_TTL_MS = 15000;

  async getStockList(): Promise<StockBasicInfo[]> {
    return STOCKS;
  }

  async getQuote(ticker: string): Promise<StockQuote> {
    const upperTicker = ticker.toUpperCase();
    const cached = this.quoteCache.get(upperTicker);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.quote;
    }

    const stock = STOCKS.find((s) => s.ticker === upperTicker);
    const yahooSymbol = stock?.yahooSymbol || `${upperTicker}.JK`;

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        next: { revalidate: 15 },
      });

      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || meta.previousClose || price;
          const change = price - prevClose;
          const changePercent = parseFloat(((change / prevClose) * 100).toFixed(2));

          const quote: StockQuote = {
            ticker: upperTicker,
            name: stock?.name || `${upperTicker} Tbk`,
            sector: stock?.sector || 'General',
            price,
            change: Math.round(change),
            change_percent: changePercent,
            open: meta.regularMarketDayOpen || price,
            high: meta.regularMarketDayHigh || price,
            low: meta.regularMarketDayLow || price,
            prev_close: prevClose,
            volume: meta.regularMarketVolume || 10000000,
            timestamp: new Date().toISOString(),
          };

          this.quoteCache.set(upperTicker, { quote, timestamp: Date.now() });
          return quote;
        }
      }
    } catch {
      // Fallback
    }

    return this.fallbackProvider.getQuote(upperTicker);
  }

  async getHistoricalPrices(ticker: string, range: '1D' | '1W' | '1M' | '1Y'): Promise<HistoricalCandle[]> {
    return this.fallbackProvider.getHistoricalPrices(ticker, range);
  }

  async getOrderBook(ticker: string, currentPrice?: number): Promise<OrderBookDepth> {
    return this.fallbackProvider.getOrderBook(ticker, currentPrice);
  }
}
