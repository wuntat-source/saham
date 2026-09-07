import { StockQuote, HistoricalCandle, StockBasicInfo, OrderBookDepth } from '@/types/market';

export interface MarketDataProvider {
  name: string;
  getQuote(ticker: string): Promise<StockQuote>;
  getHistoricalPrices(ticker: string, range: '1D' | '1W' | '1M' | '1Y'): Promise<HistoricalCandle[]>;
  getStockList(): Promise<StockBasicInfo[]>;
  getOrderBook(ticker: string, currentPrice?: number): Promise<OrderBookDepth>;
}
