export type ToolType =
  | 'cursor'
  | 'trendline'
  | 'horizontal'
  | 'fibonacci'
  | 'rectangle'
  | 'brush'
  | 'text'
  | 'measure';

export interface ChartPoint {
  index: number;      // candle index (0 to candles.length - 1)
  time: string;       // timestamp or time label
  price: number;      // price in IDR
}

export interface DrawingElement {
  id: string;
  type: ToolType;
  points: ChartPoint[]; // points in data space (price and candle index)
  color: string;
  lineWidth: number;
  text?: string;        // for text tool
  extra?: {
    isLocked?: boolean;
    fillColor?: string;
  };
}

export type ChartType = 'candles' | 'line' | 'bars';
export type ChartTheme = 'light' | 'dark';

export interface IndicatorConfig {
  ma9: boolean;
  ma20: boolean;
  ema50: boolean;
  sma200: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

export interface ChartBounds {
  minPrice: number;
  maxPrice: number;
  chartWidth: number;
  chartHeight: number;
  paddingTop: number;
  paddingLeft: number;
  candleCount: number;
  theme?: ChartTheme;
}
