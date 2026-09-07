export type TrendSignal = 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' | 'BREAKOUT' | 'BREAKDOWN';
export type ValuationStatus = 'UNDERVALUED' | 'FAIR' | 'OVERVALUED';
export type SmartMoneyStatus = 'ACCUMULATION' | 'RE-ACCUMULATION' | 'NEUTRAL' | 'DISTRIBUTION' | 'DATA NOT AVAILABLE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface OHLCV {
  date?: string;
  time?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundamentalData {
  period: string;
  revenue: number | null;
  revenueGrowth: number | null; // percentage
  grossProfit: number | null;
  operatingProfit: number | null;
  netProfit: number | null;
  eps: number | null;
  epsGrowth: number | null;
  roe: number | null; // percentage
  roa: number | null; // percentage
  roic: number | null; // percentage
  debt: number | null;
  cash: number | null;
  freeCashFlow: number | null;
  operatingCashFlow: number | null;
  debtToEquity: number | null;
  netMargin: number | null;
  operatingMargin: number | null;
  dataAsOf: string;
  source: string;
}

export interface FundamentalScoreResult {
  score: number; // 0-100
  confidence: number; // 0-100
  metrics: FundamentalData;
  breakdown: {
    profitability: number; // 0-100
    growth: number; // 0-100
    leverage: number; // 0-100
    cashFlow: number; // 0-100
    returnOnCapital: number; // 0-100
    earningsQuality: number; // 0-100
  };
  summary: string;
  missingFields: string[];
}

export interface TechnicalIndicators {
  price: number;
  sma20: number | null;
  sma50: number | null;
  sma100: number | null;
  sma200: number | null;
  ema20: number | null;
  rsi: number | null; // 14 period
  macd: {
    line: number | null;
    signal: number | null;
    histogram: number | null;
  };
  stochastic: {
    k: number | null;
    d: number | null;
  };
  adx: number | null;
  atr: number | null;
  bollingerBands: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
  };
  obv: number | null;
}

export interface TechnicalScoreResult {
  score: number; // 0-100
  confidence: number; // 0-100
  signal: TrendSignal;
  indicators: TechnicalIndicators;
  breakdown: {
    trendScore: number;
    momentumScore: number;
    volatilityScore: number;
    volumeScore: number;
  };
  summary: string;
}

export interface ValuationData {
  period: string;
  pe: number | null;
  forwardPe: number | null;
  pbv: number | null;
  evEbitda: number | null;
  psr: number | null;
  peg: number | null;
  dividendYield: number | null;
  fcfYield: number | null;
  sectorAvgPe: number;
  sectorAvgPbv: number;
  dataAsOf: string;
  source: string;
}

export interface ValuationScoreResult {
  score: number; // 0-100
  confidence: number; // 0-100
  status: ValuationStatus;
  metrics: ValuationData;
  breakdown: {
    peRating: string;
    pbvRating: string;
    dividendRating: string;
    fcfRating: string;
  };
  summary: string;
}

export interface SmartMoneyData {
  foreignNetFlow1D: number | null; // in IDR
  foreignNetFlow5D: number | null; // in IDR
  foreignNetFlow20D: number | null; // in IDR
  institutionalSharePct: number | null;
  topBrokerConcentration: number | null; // Top 3 broker volume %
  volumePriceDivergence: boolean;
  dataAvailable: boolean;
}

export interface SmartMoneyScoreResult {
  score: number; // 0-100
  confidence: number; // 0-100
  status: SmartMoneyStatus;
  metrics: SmartMoneyData;
  summary: string;
}

export interface SentimentArticleItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // 0-100
}

export interface SentimentScoreResult {
  score: number; // 0-100
  confidence: number; // 0-100
  sentimentLabel: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  articles: SentimentArticleItem[];
  summary: string;
}

export interface RiskData {
  volatility30D: number; // annualized %
  maxDrawdown1Y: number; // %
  liquidityDailyTurnover: number; // in IDR
  debtToEquity: number | null;
  beta: number | null;
  eventRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskScoreResult {
  score: number; // 0-100 (higher score = safer / better managed risk)
  confidence: number; // 0-100
  riskLevel: RiskLevel;
  metrics: RiskData;
  summary: string;
}

export interface PillarWeights {
  fundamental: number; // 0.20
  technical: number; // 0.20
  valuation: number; // 0.15
  smartMoney: number; // 0.10
  sentiment: number; // 0.10
  risk: number; // 0.15
  dataQuality: number; // 0.05
  marketRegime: number; // 0.05
}

export interface StockIntelligenceOverview {
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: number;
  currentPrice: number;
  changePercent: number;
  overallScore: number; // 0-100
  confidenceScore: number; // 0-100
  dataQualityScore: number; // 0-100
  marketRegimeScore: number; // 0-100
  weights: PillarWeights;
  scores: {
    fundamental: FundamentalScoreResult;
    technical: TechnicalScoreResult;
    valuation: ValuationScoreResult;
    smartMoney: SmartMoneyScoreResult;
    sentiment: SentimentScoreResult;
    risk: RiskScoreResult;
  };
  rank?: number;
  catalyst?: string;
  mainRisk?: string;
  strongestPillar?: string;
  weakestPillar?: string;
  calculatedAt: string;
  engineVersion: string;
}

export interface ScreenerFilterParams {
  search?: string;
  sector?: string;
  minScore?: number;
  maxScore?: number;
  signal?: TrendSignal;
  valuation?: ValuationStatus;
  risk?: RiskLevel;
  sortBy?: 'score' | 'rank' | 'fundamental' | 'technical' | 'valuation' | 'price' | 'changePercent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ScreenerItem {
  rank: number;
  ticker: string;
  companyName: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: string;
  overallScore: number;
  confidenceScore: number;
  fundamentalScore: number;
  technicalScore: number;
  valuationScore: number;
  smartMoneyScore: number;
  sentimentScore: number;
  riskScore: number;
  signal: TrendSignal;
  valuationStatus: ValuationStatus;
  riskLevel: RiskLevel;
  strongestPillar: string;
  weakestPillar: string;
  catalyst?: string;
  mainRisk?: string;
}

export interface ExplainScoreRequest {
  ticker: string;
  pillar: 'overall' | 'fundamental' | 'technical' | 'valuation' | 'smartMoney' | 'sentiment' | 'risk';
}

export interface ExplainScoreResponse {
  ticker: string;
  pillar: string;
  score: number;
  confidence: number;
  evidence: string[]; // deterministic data points
  calculation: string; // how the score was computed
  interpretation: string; // AI qualitative strategic takeaway
  riskFactors: string[]; // key risks identified
  generatedAt: string;
}
