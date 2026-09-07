import { MarketDataProvider } from './market-data.provider';
import { YahooMarketDataProvider } from './yahoo-market.provider';
import { MockMarketDataProvider } from './mock-market.provider';

export * from './market-data.provider';
export * from './mock-market.provider';
export * from './yahoo-market.provider';

// Default provider: Yahoo Finance with Mock fallback
export const defaultMarketProvider: MarketDataProvider = new YahooMarketDataProvider();
export const mockMarketProvider: MarketDataProvider = new MockMarketDataProvider();
