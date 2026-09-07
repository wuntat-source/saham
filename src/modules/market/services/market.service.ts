import { defaultMarketProvider } from '../providers';
import { StockQuote, HistoricalCandle, StockBasicInfo, OrderBookDepth } from '@/types/market';
import { STOCKS } from '@/lib/constants';

export class MarketService {
  private provider = defaultMarketProvider;

  async getQuote(ticker: string): Promise<StockQuote> {
    return this.provider.getQuote(ticker);
  }

  async getAllQuotes(): Promise<StockQuote[]> {
    const stocks = await this.provider.getStockList();
    return Promise.all(stocks.map((s) => this.provider.getQuote(s.ticker)));
  }

  async getMarketOverview(): Promise<{
    allQuotes: StockQuote[];
    topGainers: StockQuote[];
    topLosers: StockQuote[];
    highestVolume: StockQuote[];
    popularStocks: StockQuote[];
  }> {
    const allQuotes = await this.getAllQuotes();

    const sortedByGain = [...allQuotes].sort((a, b) => b.change_percent - a.change_percent);
    const topGainers = sortedByGain.filter((q) => q.change_percent > 0).slice(0, 5);
    const topLosers = [...allQuotes].sort((a, b) => a.change_percent - b.change_percent).slice(0, 5);
    const highestVolume = [...allQuotes].sort((a, b) => b.volume - a.volume).slice(0, 5);
    const popularTickers = ['BBCA', 'BBRI', 'TLKM', 'BMRI', 'ASII', 'GOTO'];
    const popularStocks = allQuotes.filter((q) => popularTickers.includes(q.ticker));

    return {
      allQuotes,
      topGainers,
      topLosers,
      highestVolume,
      popularStocks,
    };
  }

  async getHistoricalPrices(ticker: string, range: '1D' | '1W' | '1M' | '1Y'): Promise<HistoricalCandle[]> {
    return this.provider.getHistoricalPrices(ticker, range);
  }

  async getHistoricalDaily(ticker: string, days = 60): Promise<HistoricalCandle[]> {
    return this.provider.getHistoricalPrices(ticker, days > 30 ? '1Y' : '1M');
  }

  async getOrderBook(ticker: string, currentPrice?: number): Promise<OrderBookDepth> {
    return this.provider.getOrderBook(ticker, currentPrice);
  }
}

export const marketService = new MarketService();
