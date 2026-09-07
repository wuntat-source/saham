export type RuleOperator =
  | '>'
  | '<'
  | '>='
  | '<='
  | '=='
  | '!='
  | 'CROSSES_ABOVE'
  | 'CROSSES_BELOW';

export type RuleField =
  // Pillar and Intelligence Scores
  | 'technical_score'
  | 'fundamental_score'
  | 'valuation_score'
  | 'smart_money_score'
  | 'sentiment_score'
  | 'risk_score'
  | 'overall_score'
  | 'relative_strength'
  // Technical Price & Indicators
  | 'price'
  | 'rsi_14'
  | 'sma_20'
  | 'sma_50'
  | 'sma_200'
  | 'ema_12'
  | 'ema_26'
  | 'macd_line'
  | 'macd_signal'
  | 'volume'
  | 'volume_sma_20'
  | 'bb_upper'
  | 'bb_lower'
  // Fundamental Ratios
  | 'pe_ratio'
  | 'pbv_ratio'
  | 'roe'
  | 'npm'
  | 'der'
  | 'dividend_yield';

export interface RuleCondition {
  field: RuleField;
  operator: RuleOperator;
  value: number | string;
}

export interface StrategyRuleGroup {
  logicalOperator: 'AND' | 'OR';
  conditions: RuleCondition[];
}

export interface ExitRules {
  stopLossPct: number; // e.g. 3.5 (%)
  takeProfitPct: number; // e.g. 7.0 (%)
  maxHoldDays?: number; // e.g. 30 (trading days)
  technicalExit?: RuleCondition[];
}

export interface StrategyRules {
  entryRules: StrategyRuleGroup;
  exitRules: ExitRules;
  positionSizePct: number; // e.g. 20 (% of capital per position)
  maxPositions: number; // e.g. 5
}

export interface StrategyItem {
  id: string;
  userId: string;
  name: string;
  description: string;
  rules: StrategyRules;
  universe: string;
  timeframe: string;
  createdAt: string;
  updatedAt: string;
  backtestCount?: number;
}

export interface BacktestConfig {
  strategyId?: string;
  strategyRules?: StrategyRules;
  startDate: string;
  endDate: string;
  initialCapital?: number; // default 100_000_000
  buyFeePct?: number; // default 0.15%
  sellFeePct?: number; // default 0.25%
  slippagePct?: number; // default 0.1%
  universe?: string; // 'LQ45' | 'KOMPAS100' | 'BANKING' | 'CONSUMER' | 'ALL'
  walkForward?: boolean;
}

export interface BacktestTradeItem {
  id: string;
  backtestId: string;
  ticker: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  lots: number;
  shares: number;
  fees: number;
  grossPnl: number;
  netPnl: number;
  returnPct: number;
  holdingDays: number;
  exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'TECHNICAL_EXIT' | 'TIME_EXIT' | 'END_OF_BACKTEST';
}

export interface EquityPoint {
  date: string;
  portfolioEquity: number;
  benchmarkEquity: number;
  drawdownPct: number;
  cashBalance: number;
}

export interface WalkForwardSplit {
  period: 'IN_SAMPLE_TRAINING' | 'VALIDATION' | 'OUT_OF_SAMPLE_TEST';
  label: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  cagr: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  tradeCount: number;
}

export interface AIStrategyReview {
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  marketDependency: string;
  overfittingRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  overfittingReason?: string;
  suggestedImprovements: string[];
}

export interface BacktestReport {
  id: string;
  strategyId: string;
  strategyName: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalEquity: number;
  totalReturn: number;
  cagr: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgHoldingDays: number;
  equityCurve: EquityPoint[];
  trades: BacktestTradeItem[];
  walkForwardSplits?: WalkForwardSplit[];
  aiReview?: AIStrategyReview;
  createdAt: string;
}

export interface StrategyComparisonItem {
  strategyId: string;
  strategyName: string;
  totalReturn: number;
  cagr: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  profitFactor: number;
  totalTrades: number;
  consistencyScore: number; // 0-100
  equityCurve: { date: string; equity: number }[];
}
