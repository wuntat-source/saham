export type LensType =
  | 'INSTITUTIONAL'
  | 'LONG_TERM_QUALITY'
  | 'FUNDAMENTAL_GROWTH'
  | 'MACRO_CATALYST'
  | 'EARNINGS_EXPECTATIONS'
  | 'QUALITY_COMPOUNDER';

export type EducationalSafetyStatus =
  | 'ATTRACTIVE SETUP'
  | 'POSITIVE BIAS'
  | 'WATCH'
  | 'WAIT FOR CONFIRMATION'
  | 'HIGH RISK'
  | 'UNATTRACTIVE';

export type DataQualityStatus =
  | 'HIGH'
  | 'MEDIUM'
  | 'STALE'
  | 'INSUFFICIENT'
  | 'DATA NOT AVAILABLE';

export interface TransparencyBreakdown {
  fact: string;
  calculation: string;
  interpretation: string;
  aiOpinion: string;
}

export interface StudentEducationalGuide {
  whatDoesThisMean: string;
  whatShouldILearn: string;
}

export interface CaseScenario {
  name: 'Bull Case' | 'Base Case' | 'Bear Case';
  probabilityPct: number;
  fairValue: number;
  impliedUpsidePct: number;
  description: string;
}

export interface LensMetadata {
  type: LensType;
  slug: string;
  name: string;
  iconName: string;
  horizon: string;
  primaryFocus: string;
  keyMetrics: string[];
  riskProfile: string;
  description: string;
  route: string;
}

// ==========================================
// LENS 1 — INSTITUTIONAL / RISK-ADJUSTED
// ==========================================
export interface InstitutionalAnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  score: number; // 0-100
  confidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  dataQuality: DataQualityStatus;
  pillarScores: {
    businessQuality: number;
    growthScore: number;
    valuationScore: number;
    riskScore: number;
    catalystScore: number;
  };
  metrics: {
    roe: number;
    roic: number;
    npm: number;
    der: number;
    fcfYield: number;
    per: number;
    pbv: number;
    beta: number;
  };
  scenarios: CaseScenario[];
  expectedReturnAnnualized: number;
  downsideRiskPct: number;
  keyRisks: string[];
  keyCatalysts: string[];
  thesis: string;
  transparency: TransparencyBreakdown[];
  educationalGuide: StudentEducationalGuide;
}

// ==========================================
// LENS 2 — LONG-TERM QUALITY & VALUATION
// ==========================================
export interface LongTermQualityAnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  score: number; // 0-100
  confidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  dataQuality: DataQualityStatus;
  valuationStatus: 'UNDERVALUED' | 'FAIRLY VALUED' | 'OVERVALUED';
  pillarScores: {
    businessQuality: number;
    compoundingPotential: number;
    valuationScore: number;
    durabilityScore: number;
  };
  metrics: {
    roic5YearAvg: number;
    earningsGrowth5YearCAGR: number;
    fcfConversionRate: number;
    dividendSustainabilityScore: number;
    economicMoatWidth: 'WIDE' | 'NARROW' | 'NONE';
  };
  scenarios: CaseScenario[];
  estimatedAnnualizedReturn: number;
  keyRisks: string[];
  thesis: string;
  transparency: TransparencyBreakdown[];
  educationalGuide: StudentEducationalGuide;
}

// ==========================================
// LENS 3 — FUNDAMENTAL GROWTH
// ==========================================
export interface FundamentalGrowthAnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  score: number; // 0-100
  confidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  dataQuality: DataQualityStatus;
  classification:
    | 'GROWTH AT REASONABLE PRICE (GARP)'
    | 'EXPENSIVE GROWTH'
    | 'VALUE TRAP'
    | 'QUALITY GROWTH';
  pillarScores: {
    growthScore: number;
    earningsMomentumScore: number;
    growthQualityScore: number;
    valuationScore: number;
  };
  growthVsExpectations: {
    actualRevenueGrowth: number;
    consensusRevenueGrowth: number | string; // number or 'CONSENSUS DATA NOT AVAILABLE'
    actualEpsGrowth: number;
    consensusEpsGrowth: number | string;
    accelerationTrend: 'ACCELERATING' | 'STABLE' | 'DECELERATING';
  };
  growthDrivers: string[];
  growthCatalysts: string[];
  earningsRisks: string[];
  valuationRisks: string[];
  fivePointThesis: string[];
  transparency: TransparencyBreakdown[];
  educationalGuide: StudentEducationalGuide;
}

// ==========================================
// LENS 4 — MACRO + FUNDAMENTAL + CATALYST
// ==========================================
export interface MacroSensitivityScenario {
  variable: string;
  shockDescription: string;
  revenueImpactPct: number;
  operatingProfitImpactPct: number;
  netProfitImpactPct: number;
  epsImpactPct: number;
  impliedFairValue: number;
}

export interface MacroCatalystAnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  score: number; // 0-100
  confidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  dataQuality: DataQualityStatus;
  dominantMacroVariables: Array<{
    variable: string;
    direction: 'TAILWIND' | 'HEADWIND' | 'NEUTRAL';
    importance: 'CRITICAL' | 'HIGH' | 'MODERATE';
    note: string;
  }>;
  sensitivities: MacroSensitivityScenario[];
  scenarios: CaseScenario[];
  catalystsNext3To12Months: Array<{
    title: string;
    timeframe: string;
    expectedImpact: 'HIGH' | 'MEDIUM' | 'LOW';
    type: string;
  }>;
  thesis: string;
  transparency: TransparencyBreakdown[];
  educationalGuide: StudentEducationalGuide;
}

// ==========================================
// LENS 5 — EARNINGS & MARKET EXPECTATIONS
// ==========================================
export interface EarningsExpectationScenario {
  outcome: 'BEAT' | 'IN-LINE' | 'MISS';
  probabilityPct: number;
  projectedEarningsImpact: string;
  valuationImpact: string;
  investorSentiment: string;
  potentialPriceResponseRange: string;
}

export interface EarningsExpectationsAnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  score: number; // 0-100
  confidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  dataQuality: DataQualityStatus;
  expectationClassification:
    | 'POSITIVE SURPRISE'
    | 'NEGATIVE SURPRISE'
    | 'IN-LINE'
    | 'EXPECTATION RISK';
  marketNarrative: {
    marketExpects: string;
    actualTrend: string;
    potentialReaction: string;
  };
  scenarios: EarningsExpectationScenario[];
  recentSurpriseHistory: Array<{
    quarter: string;
    actualVsConsensus: string;
    surprisePct: number;
    priceReactionPct: number;
  }>;
  thesis: string;
  transparency: TransparencyBreakdown[];
  educationalGuide: StudentEducationalGuide;
}

// ==========================================
// LENS 6 — QUALITY COMPOUNDER
// ==========================================
export interface FiveYearShareholderReturnModel {
  fundamentalReturnPctAnnualized: number;
  dividendReturnPctAnnualized: number;
  valuationMultipleChangePctAnnualized: number;
  totalEstimatedShareholderReturnAnnualized: number;
  scenarios: {
    bear: number;
    base: number;
    bull: number;
  };
}

export interface QualityCompounderAnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  score: number; // 0-100
  confidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  dataQuality: DataQualityStatus;
  compounderClassification:
    | 'POTENTIAL COMPOUNDER'
    | 'CYCLICAL'
    | 'VALUE TRAP'
    | 'MATURE BUSINESS';
  pillarScores: {
    compounderScore: number;
    roicQuality: number;
    reinvestmentQuality: number;
    moatScore: number;
    growthDurability: number;
    valuationScore: number;
  };
  compoundingEngines: {
    revenueCagr: number;
    epsCagr: number;
    roic: number;
    reinvestmentRatePct: number;
    pricingPowerRating: 'STRONG' | 'MODERATE' | 'WEAK';
    sourceOfCompoundingExplanation: string;
  };
  fiveYearReturnModel: FiveYearShareholderReturnModel;
  thesis: string;
  transparency: TransparencyBreakdown[];
  educationalGuide: StudentEducationalGuide;
}

// ==========================================
// CONSENSUS & MULTI-LENS COMPARISON
// ==========================================
export interface LensScoreSummary {
  lensType: LensType;
  slug: string;
  name: string;
  score: number;
  confidence: number;
  safetyStatus: EducationalSafetyStatus;
  weightPct: number;
}

export interface LensDisagreementItem {
  lensA: string;
  scoreA: number;
  lensB: string;
  scoreB: number;
  divergence: number;
  explanation: string;
}

export interface LensConsensusResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  consensusScore: number; // 0-100
  consensusConfidence: number; // 0-100
  safetyStatus: EducationalSafetyStatus;
  calculatedAt: string;
  dataAsOf: string;
  scores: LensScoreSummary[];
  strongestLens: LensScoreSummary;
  weakestLens: LensScoreSummary;
  disagreements: LensDisagreementItem[];
  executiveSummary: {
    businessQuality: 'STRONG' | 'MODERATE' | 'WEAK';
    growth: 'STRONG' | 'MODERATE' | 'WEAK';
    valuation: 'CHEAP' | 'FAIR' | 'EXPENSIVE';
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    catalyst: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    longTermQuality: 'STRONG' | 'MODERATE' | 'WEAK';
    compounderPotential: 'HIGH' | 'MODERATE' | 'LOW';
  };
  investmentThesis: {
    whyAttractive: string[];
    whyMayDisappoint: string[];
    whatMarketMayBeMissing: string[];
    whatCouldInvalidateThesis: string[];
    whatInvestorsShouldMonitor: string[];
  };
  disclaimer: string;
}
