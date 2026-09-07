export type MarketRegimeType = 'BULLISH' | 'SIDEWAYS' | 'BEARISH' | 'HIGH_VOLATILITY';

export interface MarketRegimeResult {
  regime: MarketRegimeType;
  score: number; // 0-100
  confidence: number; // 0-100
  ihsgPrice: number;
  ihsgChangePct: number;
  breadth: {
    advancers: number;
    decliners: number;
    unchanged: number;
    ratio: number;
  };
  metrics: {
    trendStatus: 'ABOVE_SMA200' | 'BELOW_SMA200' | 'CONSOLIDATING';
    volatilityIndex: number;
    foreignFlowNet1D: number;
    momentumRsi: number;
    leadingSector: string;
  };
  summary: string;
  timestamp: string;
}

export interface SectorPerformance {
  sector: string;
  performance1D: number;
  performance1W: number;
  performance1M: number;
  performanceYTD: number;
  momentumScore: number; // 0-100
  relativeStrengthScore: number; // 0-100 vs IHSG
  medianPe: number;
  medianPbv: number;
  earningsGrowthYoY: number;
  stockCount: number;
  marketCapTrillion: number;
  topStock: {
    ticker: string;
    companyName: string;
    score: number;
    changePct: number;
  };
}

export interface SectorHierarchyDrilldown {
  market: {
    name: string;
    status: string;
    score: number;
  };
  sectors: SectorPerformance[];
  timestamp: string;
}

export interface RelativeStrengthResult {
  ticker: string;
  score: number; // 0-100 (higher = outperforming benchmark)
  vsMarketIndexPct: number;
  vsSectorPct: number;
  percentileInSector: number; // 0-100
  classification: 'LEADER' | 'OUTPERFORMER' | 'IN_LINE' | 'LAGGARD';
  summary: string;
}

export type CatalystEventType =
  | 'EARNINGS'
  | 'DIVIDEND'
  | 'RUPS'
  | 'BUYBACK'
  | 'ACQUISITION'
  | 'CONTRACT'
  | 'EXPANSION'
  | 'REGULATION'
  | 'INDEX_REBALANCE'
  | 'OTHER';

export type ExpectedImpact =
  | 'HIGH_POSITIVE'
  | 'MODERATE_POSITIVE'
  | 'NEUTRAL'
  | 'MODERATE_NEGATIVE'
  | 'HIGH_NEGATIVE';

export interface CatalystItem {
  id: string;
  ticker: string;
  companyName: string;
  eventType: CatalystEventType;
  title: string;
  description: string;
  eventDate: string;
  expectedImpact: ExpectedImpact;
  confidence: number;
  source: string;
  timeframe: 'TODAY' | 'THIS_WEEK' | 'NEXT_30_DAYS';
}

export interface CatalystsByTimeline {
  today: CatalystItem[];
  thisWeek: CatalystItem[];
  next30Days: CatalystItem[];
  total: number;
  timestamp: string;
}

export type AnomalyType =
  | 'ABNORMAL_VOLUME'
  | 'ABNORMAL_PRICE_MOVEMENT'
  | 'ABNORMAL_VOLATILITY'
  | 'PRICE_VOLUME_DIVERGENCE'
  | 'UNUSUAL_FLOW'
  | 'FUNDAMENTAL_ANOMALY';

export type AnomalySeverity = 'NORMAL' | 'WATCH' | 'WARNING' | 'HIGH_ALERT';

export interface AnomalyItem {
  id: string;
  ticker: string;
  companyName: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  detectedMetric: number | null;
  baselineMetric: number | null;
  confidence: number;
  detectedAt: string;
}

export interface ScenarioCase {
  type: 'BULL' | 'BASE' | 'BEAR';
  probability: number; // 0-100 (sum must equal 100)
  targetRange: {
    low: number;
    high: number;
    upsidePct: number;
  };
  assumptions: string[];
  drivers: string[];
  risks: string[];
  invalidationCondition: string;
}

export interface ScenarioAnalysisResult {
  ticker: string;
  currentPrice: number;
  scenarios: {
    bull: ScenarioCase;
    base: ScenarioCase;
    bear: ScenarioCase;
  };
  expectedValuePrice: number;
  probabilitySumCheck: number; // strictly 100
  confidence: number;
  timestamp: string;
}

export interface AnalystArgument {
  thesis: string;
  keyPoints: string[];
  catalystsOrRisks: string[];
  targetPrice: number;
  convictionScore: number; // 0-100
}

export interface DebateResult {
  ticker: string;
  bullAnalyst: AnalystArgument;
  bearAnalyst: AnalystArgument;
  aiJudge: {
    verdict: string;
    bullScore: number; // 0-100
    bearScore: number; // 0-100
    netConviction: 'BULLISH_BIAS' | 'BALANCED_NEUTRAL' | 'BEARISH_BIAS';
    uncertainties: string[];
    balancedTakeaway: string;
  };
  confidence: number;
  timestamp: string;
}

export interface TradingPlanLevel {
  entryZone: { min: number; max: number; description: string };
  breakoutLevel: number;
  stopLoss: number;
  stopDistancePct: number;
  tp1: number;
  tp1UpsidePct: number;
  tp2: number;
  tp2UpsidePct: number;
  tp3: number;
  tp3UpsidePct: number;
  riskRewardRatio: number;
  logicExplanation: string[];
  disclaimer: string;
}

export interface PositionSizingResult {
  accountBalance: number;
  riskPercentage: 1 | 2 | 5; // User selectable
  maxRiskAmountIdr: number;
  stopDistancePerShare: number;
  maxSharesAllowed: number;
  maxLotsAllowed: number;
  totalCapitalRequiredIdr: number;
  capitalUtilizationPct: number;
  potentialLossIdr: number;
  potentialGainTp1Idr: number;
  potentialGainTp2Idr: number;
}

export interface RadarHubData {
  topSetups: Array<{
    ticker: string;
    companyName: string;
    price: number;
    score: number;
    setupType: string;
    signal: string;
  }>;
  breakoutWatch: Array<{
    ticker: string;
    price: number;
    breakoutTrigger: number;
    bollingerWidth: number;
    volumeExpansionPct: number;
  }>;
  accumulation: Array<{
    ticker: string;
    foreignInflow5D: number;
    concentrationPct: number;
    status: string;
  }>;
  catalystWatch: CatalystItem[];
  anomalyWatch: AnomalyItem[];
  highRiskWatch: Array<{
    ticker: string;
    volatility: number;
    drawdown: number;
    reason: string;
  }>;
  timestamp: string;
}

export interface PortfolioHealthResult {
  healthScore: number; // 0-100
  diversificationScore: number; // 0-100
  riskScore: number; // 0-100
  cashRatioPct: number;
  portfolioVolatilityPct: number;
  maxDrawdownEstimatedPct: number;
  sectorConcentration: Array<{
    sector: string;
    weightPct: number;
    marketValue: number;
  }>;
  positionConcentration: Array<{
    ticker: string;
    weightPct: number;
    marketValue: number;
  }>;
  herfindahlIndex: number; // 0 to 1
  optimizationSuggestions: string[];
  confidence: number;
  timestamp: string;
}
