import { STOCKS, StockInfo } from './constants';

export interface StockQuote {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  description: string;
  lastUpdated: string;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  lots: number;
  orders: number;
}

export interface OrderBook {
  ticker: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  lastPrice: number;
}

// In-memory quote cache with timestamp
const quoteCache = new Map<string, { quote: StockQuote; timestamp: number }>();
const CACHE_TTL_MS = 10000; // 10 seconds

// Deterministic tick noise generator based on minute
function getPriceVariation(ticker: string, basePrice: number): number {
  const stock = STOCKS.find((s) => s.ticker === ticker);
  if (!stock) return basePrice;

  const now = Date.now();
  // Generate a subtle oscillating wave + pseudorandom offset
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cycle = Math.sin((now / 60000) * 2 + hash);
  const microCycle = Math.cos((now / 15000) + hash * 2);

  // Volatility percentage (around -1.8% to +2.4%)
  const variationPct = (cycle * 1.5 + microCycle * 0.8) / 100;
  let price = Math.round(stock.basePrice * (1 + variationPct));

  // Minimum tick size rounding (IDX tick rules)
  if (price < 200) price = Math.round(price);
  else if (price < 500) price = Math.round(price / 2) * 2;
  else if (price < 2000) price = Math.round(price / 5) * 5;
  else if (price < 5000) price = Math.round(price / 10) * 10;
  else price = Math.round(price / 25) * 25;

  return Math.max(1, price);
}

export async function fetchStockQuote(ticker: string): Promise<StockQuote> {
  const upperTicker = ticker.toUpperCase();
  const cached = quoteCache.get(upperTicker);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.quote;
  }

  const stockInfo = STOCKS.find((s) => s.ticker === upperTicker) || {
    ticker: upperTicker,
    name: `${upperTicker} Tbk`,
    sector: 'Diversified',
    basePrice: 1000,
    peRatio: 12.0,
    marketCap: '50 T',
    yahooSymbol: `${upperTicker}.JK`,
    description: `Perusahaan publik tercatat di Bursa Efek Indonesia (${upperTicker}).`,
  };

  let currentPrice = stockInfo.basePrice;
  let prevClose = stockInfo.basePrice;
  let high = currentPrice;
  let low = currentPrice;
  let open = currentPrice;
  let volume = 15420000;

  try {
    // Attempt Yahoo Finance Public Query
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockInfo.yahooSymbol}?interval=1d&range=2d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && meta.regularMarketPrice) {
        currentPrice = meta.regularMarketPrice;
        prevClose = meta.chartPreviousClose || meta.previousClose || stockInfo.basePrice;
        high = meta.regularMarketDayHigh || currentPrice;
        low = meta.regularMarketDayLow || currentPrice;
        open = meta.regularMarketDayOpen || currentPrice;
        volume = meta.regularMarketVolume || volume;
      }
    }
  } catch {
    // Graceful fallback to dynamic simulated market price
  }

  // If live query didn't return (outside trading hours or rate-limited), apply market noise
  if (currentPrice === stockInfo.basePrice) {
    currentPrice = getPriceVariation(upperTicker, stockInfo.basePrice);
    prevClose = stockInfo.basePrice;
    high = Math.max(currentPrice, Math.round(prevClose * 1.025));
    low = Math.min(currentPrice, Math.round(prevClose * 0.975));
    open = Math.round((prevClose + currentPrice) / 2);
  }

  const change = currentPrice - prevClose;
  const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

  const quote: StockQuote = {
    ticker: stockInfo.ticker,
    name: stockInfo.name,
    sector: stockInfo.sector,
    price: currentPrice,
    change: Math.round(change),
    changePct: parseFloat(changePct.toFixed(2)),
    open,
    high,
    low,
    prevClose,
    volume,
    marketCap: stockInfo.marketCap,
    peRatio: stockInfo.peRatio,
    description: stockInfo.description,
    lastUpdated: new Date().toISOString(),
  };

  quoteCache.set(upperTicker, { quote, timestamp: Date.now() });
  return quote;
}

export async function getAllQuotes(): Promise<StockQuote[]> {
  const promises = STOCKS.map((s) => fetchStockQuote(s.ticker));
  return Promise.all(promises);
}

export function getHistoricalCandles(ticker: string, range: '1D' | '1W' | '1M' | '1Y'): CandleData[] {
  const stock = STOCKS.find((s) => s.ticker === ticker.toUpperCase()) || STOCKS[0];
  const base = stock.basePrice;
  const candles: CandleData[] = [];
  const now = new Date();

  let count = 24;
  let stepMs = 60 * 60 * 1000; // 1 hour for 1D

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

  let runningPrice = base * 0.92;
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
      time: range === '1D' ? time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
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

export function generateOrderBook(currentPrice: number, ticker: string): OrderBook {
  const getTick = (price: number) => {
    if (price < 200) return 1;
    if (price < 500) return 2;
    if (price < 2000) return 5;
    if (price < 5000) return 10;
    return 25;
  };

  const tick = getTick(currentPrice);
  const hash = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  for (let i = 1; i <= 5; i++) {
    const bidPrice = Math.max(1, currentPrice - i * tick);
    const askPrice = currentPrice + (i - 1) * tick;

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
    ticker,
    bids,
    asks,
    spread: asks[0].price - bids[0].price,
    lastPrice: currentPrice,
  };
}
