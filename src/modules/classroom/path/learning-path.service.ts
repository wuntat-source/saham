import { LearningStage } from '@/types/classroom';

export const CURRICULUM_STAGES: Omit<LearningStage, 'unlocked' | 'completed'>[] = [
  {
    level: 1,
    title: 'Market Basics & Stock Structure',
    subtitle: 'Foundation of Indonesia Stock Exchange (IDX/BEI)',
    description: 'Learn market mechanics, lot sizes, order book dynamics, bid-offer spreads, and exchange trading hours.',
    category: 'Foundations',
    xpRequired: 0,
    modules: [
      { id: 'mb-101', title: 'What is a Share & How BEI Works', duration: '15 mins', completed: false },
      { id: 'mb-102', title: 'Reading the Order Book (Bid vs Offer & Queues)', duration: '20 mins', completed: false },
      { id: 'mb-103', title: 'Order Types: Market, Limit & Auto-Rejection Rules', duration: '25 mins', completed: false },
    ],
  },
  {
    level: 2,
    title: 'Fundamental Analysis & Financial Literacy',
    subtitle: 'Financial Statements, Profitability & Health Ratios',
    description: 'Deconstruct Balance Sheet, Income Statement, and Cash Flow. Master ROE, DER, NPM, PBV, and PER metrics.',
    category: 'Fundamental',
    xpRequired: 150,
    modules: [
      { id: 'fa-201', title: 'Reading Balance Sheets & Debt Burden (DER)', duration: '30 mins', completed: false },
      { id: 'fa-202', title: 'Profitability Engines: ROE, ROA & Net Margins', duration: '25 mins', completed: false },
      { id: 'fa-203', title: 'Free Cash Flow vs Accounting Profit', duration: '30 mins', completed: false },
    ],
  },
  {
    level: 3,
    title: 'Technical Analysis & Chart Dynamics',
    subtitle: 'Price Action, Support/Resistance & Momentum',
    description: 'Master candlestick patterns, moving average crossovers (SMA20/50/200), RSI momentum, and volume validation.',
    category: 'Technical',
    xpRequired: 350,
    modules: [
      { id: 'ta-301', title: 'Support, Resistance & Trend Identification', duration: '30 mins', completed: false },
      { id: 'ta-302', title: 'Moving Averages & Multi-Timeframe Alignment', duration: '35 mins', completed: false },
      { id: 'ta-303', title: 'RSI, MACD & Volume Confirmation', duration: '30 mins', completed: false },
    ],
  },
  {
    level: 4,
    title: 'Market Microstructure & Smart Money Flow',
    subtitle: 'Foreign Flow, Broker Summary & Accumulation Patterns',
    description: 'Analyze top-buyer concentration, foreign institutional flows, big player accumulation, and distribution traps.',
    category: 'Microstructure',
    xpRequired: 600,
    modules: [
      { id: 'sm-401', title: 'Foreign Flow Footprints & Index Movers', duration: '35 mins', completed: false },
      { id: 'sm-402', title: 'Broker Summary (Top 3 Buyers vs Sellers)', duration: '40 mins', completed: false },
      { id: 'sm-403', title: 'Recognizing Accumulation vs Stealth Distribution', duration: '40 mins', completed: false },
    ],
  },
  {
    level: 5,
    title: 'Macro Regime & Sector Rotation',
    subtitle: 'Top-Down Analysis: Macro to Sector to Stock',
    description: 'Assess interest rates, inflation, Rupiah exchange rate, commodity cycles, and leading sector rotation.',
    category: 'Macro & Sector',
    xpRequired: 900,
    modules: [
      { id: 'mr-501', title: 'Classifying Bullish, Sideways & Volatile Regimes', duration: '35 mins', completed: false },
      { id: 'mr-502', title: 'Sector Relative Strength & Rotation Cycles', duration: '40 mins', completed: false },
      { id: 'mr-503', title: 'Commodity Cycles & Indonesian Resource Plays', duration: '40 mins', completed: false },
    ],
  },
  {
    level: 6,
    title: 'Risk Management & Position Sizing',
    subtitle: 'Capital Preservation, Stop Loss & R-Multiples',
    description: 'Formulate stop-loss rules, position size calculations using 1-2% risk models, risk/reward ratios, and drawdown limits.',
    category: 'Risk Management',
    xpRequired: 1300,
    modules: [
      { id: 'rm-601', title: 'Position Sizing Formula & The 1% Risk Rule', duration: '30 mins', completed: false },
      { id: 'rm-602', title: 'Setting Logical Invalidation Stops (ATR & Structure)', duration: '35 mins', completed: false },
      { id: 'rm-603', title: 'Managing Drawdown & Overtrading Psychology', duration: '40 mins', completed: false },
    ],
  },
  {
    level: 7,
    title: 'Quantitative Strategy & Algorithmic Design',
    subtitle: 'Multi-Factor Models, Rule Building & Backtesting',
    description: 'Construct rule-based strategies in Quant Lab, backtest against historical data, optimize Sharpe ratio, and avoid overfitting.',
    category: 'Quantitative',
    xpRequired: 1800,
    modules: [
      { id: 'qs-701', title: 'Building Multi-Factor Quantitative Rules', duration: '45 mins', completed: false },
      { id: 'qs-702', title: 'Backtesting Metrics: Sharpe Ratio, Win Rate & Max DD', duration: '45 mins', completed: false },
      { id: 'qs-703', title: 'Formulating Your Capstone Investment Thesis', duration: '60 mins', completed: false },
    ],
  },
];

export class LearningPathService {
  /**
   * Compute student progress across the 7-stage curriculum based on user XP and completed modules
   */
  static getProgress(userXp: number, completedModuleIds: string[] = []): LearningStage[] {
    return CURRICULUM_STAGES.map((stage, index) => {
      const unlocked = userXp >= stage.xpRequired;
      const stageModuleIds = stage.modules.map((m) => m.id);
      const stageCompletedCount = stageModuleIds.filter((id) => completedModuleIds.includes(id)).length;
      const allModulesDone = stageModuleIds.length > 0 && stageCompletedCount === stageModuleIds.length;

      const nextStage = CURRICULUM_STAGES[index + 1];
      const completed = allModulesDone || (nextStage ? userXp >= nextStage.xpRequired : userXp >= stage.xpRequired + 300);

      const modulesWithStatus = stage.modules.map((mod) => ({
        ...mod,
        completed: completedModuleIds.includes(mod.id) || (unlocked && completed),
      }));

      return {
        ...stage,
        unlocked,
        completed,
        modules: modulesWithStatus,
      };
    });
  }

  /**
   * Determine the current active stage the student is learning
   */
  static getCurrentActiveStage(userXp: number): LearningStage {
    const stages = this.getProgress(userXp);
    const current = stages.find((s) => s.unlocked && !s.completed);
    return current || stages[stages.length - 1];
  }
}
