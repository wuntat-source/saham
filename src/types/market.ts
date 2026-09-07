export interface StockQuote {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  change_percent: number;
  changePct?: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  prevClose?: number;
  volume: number;
  marketCap?: string;
  peRatio?: number;
  description?: string;
  timestamp?: string;
}

export interface HistoricalCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockBasicInfo {
  ticker: string;
  name: string;
  sector: string;
  basePrice: number;
  peRatio: number;
  marketCap: string;
  yahooSymbol: string;
  description: string;
}

export interface OrderBookLevel {
  price: number;
  lots: number;
  orders: number;
}

export interface OrderBookDepth {
  ticker: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  lastPrice: number;
}
