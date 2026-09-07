import { prisma } from '@/lib/prisma';
import {
  BacktestConfig,
  BacktestReport,
  StrategyComparisonItem,
  StrategyItem,
  StrategyRules,
} from '@/types/quant';
import { backtestEngine } from '../engine/backtest.engine';
import { strategyReviewService } from '../ai-review/strategy-review.service';

export const STANDARD_STRATEGY_TEMPLATES: Array<{
  name: string;
  description: string;
  universe: string;
  rules: StrategyRules;
}> = [
  {
    name: 'Multi-Pillar Momentum Growth',
    description: 'Strategi kuantitatif menggabungkan skor teknikal tinggi, fundamental solid, dan harga di atas MA50.',
    universe: 'LQ45',
    rules: {
      entryRules: {
        logicalOperator: 'AND',
        conditions: [
          { field: 'technical_score', operator: '>=', value: 75 },
          { field: 'fundamental_score', operator: '>=', value: 70 },
          { field: 'rsi_14', operator: '<=', value: 70 },
        ],
      },
      exitRules: {
        stopLossPct: 3.5,
        takeProfitPct: 7.5,
        maxHoldDays: 45,
      },
      positionSizePct: 20,
      maxPositions: 5,
    },
  },
  {
    name: 'Trend Following Moving Average Breakout',
    description: 'Membeli saat harga menembus di atas SMA20 dengan konfirmasi volume tinggi di sektor terdepan.',
    universe: 'LQ45',
    rules: {
      entryRules: {
        logicalOperator: 'AND',
        conditions: [
          { field: 'technical_score', operator: '>=', value: 80 },
          { field: 'rsi_14', operator: '>=', value: 50 },
        ],
      },
      exitRules: {
        stopLossPct: 4.0,
        takeProfitPct: 8.0,
        maxHoldDays: 30,
      },
      positionSizePct: 25,
      maxPositions: 4,
    },
  },
  {
    name: 'RSI Oversold Value Mean-Reversion',
    description: 'Mencari emiten fundamental prima dengan valuasi murah saat RSI memasuki area oversold.',
    universe: 'BANKING',
    rules: {
      entryRules: {
        logicalOperator: 'AND',
        conditions: [
          { field: 'fundamental_score', operator: '>=', value: 80 },
          { field: 'valuation_score', operator: '>=', value: 70 },
          { field: 'rsi_14', operator: '<=', value: 45 },
        ],
      },
      exitRules: {
        stopLossPct: 3.0,
        takeProfitPct: 6.0,
        maxHoldDays: 20,
      },
      positionSizePct: 25,
      maxPositions: 4,
    },
  },
];

export class StrategyService {
  /**
   * Creates a new quantitative strategy in the database.
   */
  public async createStrategy(params: {
    userId: string;
    name: string;
    description: string;
    rules: StrategyRules;
    universe?: string;
    timeframe?: string;
  }): Promise<StrategyItem> {
    const strategy = await prisma.strategy.create({
      data: {
        user_id: params.userId,
        name: params.name,
        description: params.description,
        rules_json: JSON.stringify(params.rules),
        universe: params.universe || 'LQ45',
        timeframe: params.timeframe || '1D',
      },
    });

    return {
      id: strategy.id,
      userId: strategy.user_id,
      name: strategy.name,
      description: strategy.description,
      rules: JSON.parse(strategy.rules_json),
      universe: strategy.universe,
      timeframe: strategy.timeframe,
      createdAt: strategy.created_at.toISOString(),
      updatedAt: strategy.updated_at.toISOString(),
    };
  }

  /**
   * Retrieves all strategies for a user, automatically seeding default templates if empty.
   */
  public async getStrategies(userId: string): Promise<StrategyItem[]> {
    let strategies = await prisma.strategy.findMany({
      where: { user_id: userId },
      include: {
        _count: {
          select: { backtests: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (strategies.length === 0) {
      // Seed educational templates for the user
      for (const tpl of STANDARD_STRATEGY_TEMPLATES) {
        await this.createStrategy({
          userId,
          name: tpl.name,
          description: tpl.description,
          rules: tpl.rules,
          universe: tpl.universe,
        });
      }

      strategies = await prisma.strategy.findMany({
        where: { user_id: userId },
        include: {
          _count: {
            select: { backtests: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    return strategies.map((s) => ({
      id: s.id,
      userId: s.user_id,
      name: s.name,
      description: s.description,
      rules: JSON.parse(s.rules_json),
      universe: s.universe,
      timeframe: s.timeframe,
      createdAt: s.created_at.toISOString(),
      updatedAt: s.updated_at.toISOString(),
      backtestCount: s._count.backtests,
    }));
  }

  public async getStrategyById(id: string): Promise<StrategyItem | null> {
    const strategy = await prisma.strategy.findUnique({
      where: { id },
      include: {
        _count: {
          select: { backtests: true },
        },
      },
    });

    if (!strategy) return null;

    return {
      id: strategy.id,
      userId: strategy.user_id,
      name: strategy.name,
      description: strategy.description,
      rules: JSON.parse(strategy.rules_json),
      universe: strategy.universe,
      timeframe: strategy.timeframe,
      createdAt: strategy.created_at.toISOString(),
      updatedAt: strategy.updated_at.toISOString(),
      backtestCount: strategy._count.backtests,
    };
  }

  /**
   * Executes backtest on a strategy and stores results in the database.
   */
  public async executeBacktest(config: BacktestConfig): Promise<BacktestReport> {
    let rules: StrategyRules;
    let strategyName = 'Quantitative Strategy';

    if (config.strategyId) {
      const strat = await prisma.strategy.findUnique({ where: { id: config.strategyId } });
      if (strat) {
        rules = JSON.parse(strat.rules_json);
        strategyName = strat.name;
        if (!config.universe) {
          config.universe = strat.universe;
        }
      } else {
        throw new Error('Strategy not found');
      }
    } else if (config.strategyRules) {
      rules = config.strategyRules;
    } else {
      throw new Error('Either strategyId or strategyRules must be provided');
    }

    // Run simulation
    const report = backtestEngine.runBacktest(config, rules);
    report.strategyName = strategyName;

    // Generate AI Review
    const aiReview = strategyReviewService.generateReview(report, rules);
    report.aiReview = aiReview;

    // Persist in DB if strategyId exists
    if (config.strategyId) {
      const savedBacktest = await prisma.backtest.create({
        data: {
          strategy_id: config.strategyId,
          start_date: new Date(config.startDate),
          end_date: new Date(config.endDate),
          initial_capital: report.initialCapital,
          final_equity: report.finalEquity,
          total_return: report.totalReturn,
          cagr: report.cagr,
          win_rate: report.winRate,
          max_drawdown: report.maxDrawdown,
          sharpe_ratio: report.sharpeRatio,
          sortino_ratio: report.sortinoRatio,
          profit_factor: report.profitFactor,
          total_trades: report.totalTrades,
          equity_curve_json: JSON.stringify(report.equityCurve),
          walk_forward_json: report.walkForwardSplits ? JSON.stringify(report.walkForwardSplits) : null,
          ai_review_json: JSON.stringify(aiReview),
        },
      });

      report.id = savedBacktest.id;

      // Save top 30 trades for performance
      for (const t of report.trades.slice(0, 30)) {
        await prisma.backtestTrade.create({
          data: {
            backtest_id: savedBacktest.id,
            ticker: t.ticker,
            entry_date: new Date(t.entryDate),
            entry_price: t.entryPrice,
            exit_date: new Date(t.exitDate),
            exit_price: t.exitPrice,
            shares: t.shares,
            fees: t.fees,
            gross_pnl: t.grossPnl,
            net_pnl: t.netPnl,
            exit_reason: t.exitReason,
          },
        });
      }
    }

    return report;
  }

  /**
   * Retrieves a stored backtest by ID with its trade log and curves.
   */
  public async getBacktestById(id: string): Promise<BacktestReport | null> {
    const bt = await prisma.backtest.findUnique({
      where: { id },
      include: {
        strategy: true,
        trades: {
          orderBy: { entry_date: 'asc' },
        },
      },
    });

    if (!bt) return null;

    const equityCurve = JSON.parse(bt.equity_curve_json);
    const walkForwardSplits = bt.walk_forward_json ? JSON.parse(bt.walk_forward_json) : undefined;
    const aiReview = bt.ai_review_json ? JSON.parse(bt.ai_review_json) : undefined;

    const trades = bt.trades.map((t) => ({
      id: t.id,
      backtestId: t.backtest_id,
      ticker: t.ticker,
      entryDate: t.entry_date.toISOString().split('T')[0],
      entryPrice: t.entry_price,
      exitDate: t.exit_date.toISOString().split('T')[0],
      exitPrice: t.exit_price,
      lots: Math.round(t.shares / 100),
      shares: t.shares,
      fees: t.fees,
      grossPnl: t.gross_pnl,
      netPnl: t.net_pnl,
      returnPct: Math.round((t.net_pnl / (t.shares * t.entry_price)) * 10000) / 100,
      holdingDays: Math.max(1, Math.round((t.exit_date.getTime() - t.entry_date.getTime()) / (1000 * 60 * 60 * 24))),
      exitReason: t.exit_reason as any,
    }));

    return {
      id: bt.id,
      strategyId: bt.strategy_id,
      strategyName: bt.strategy.name,
      startDate: bt.start_date.toISOString().split('T')[0],
      endDate: bt.end_date.toISOString().split('T')[0],
      initialCapital: bt.initial_capital,
      finalEquity: bt.final_equity,
      totalReturn: bt.total_return,
      cagr: bt.cagr,
      winRate: bt.win_rate,
      avgWin: trades.filter((t) => t.netPnl > 0).reduce((a, b) => a + b.netPnl, 0) / Math.max(1, trades.filter((t) => t.netPnl > 0).length),
      avgLoss: Math.abs(trades.filter((t) => t.netPnl <= 0).reduce((a, b) => a + b.netPnl, 0) / Math.max(1, trades.filter((t) => t.netPnl <= 0).length)),
      profitFactor: bt.profit_factor,
      maxDrawdown: bt.max_drawdown,
      sharpeRatio: bt.sharpe_ratio,
      sortinoRatio: bt.sortino_ratio,
      totalTrades: bt.total_trades,
      winningTrades: trades.filter((t) => t.netPnl > 0).length,
      losingTrades: trades.filter((t) => t.netPnl <= 0).length,
      avgHoldingDays: Math.round(trades.reduce((a, b) => a + b.holdingDays, 0) / Math.max(1, trades.length)),
      equityCurve,
      trades,
      walkForwardSplits,
      aiReview,
      createdAt: bt.created_at.toISOString(),
    };
  }

  /**
   * Retrieves all historical backtests.
   */
  public async getBacktests(strategyId?: string): Promise<any[]> {
    const backtests = await prisma.backtest.findMany({
      where: strategyId ? { strategy_id: strategyId } : {},
      include: { strategy: true },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return backtests.map((b) => ({
      id: b.id,
      strategyId: b.strategy_id,
      strategyName: b.strategy.name,
      startDate: b.start_date.toISOString().split('T')[0],
      endDate: b.end_date.toISOString().split('T')[0],
      initialCapital: b.initial_capital,
      finalEquity: b.final_equity,
      totalReturn: b.total_return,
      cagr: b.cagr,
      winRate: b.win_rate,
      maxDrawdown: b.max_drawdown,
      sharpeRatio: b.sharpe_ratio,
      sortinoRatio: b.sortino_ratio,
      profitFactor: b.profit_factor,
      totalTrades: b.total_trades,
      createdAt: b.created_at.toISOString(),
    }));
  }

  /**
   * Compares 2-4 strategies side by side over identical backtest period.
   */
  public async compareStrategies(strategyIds: string[]): Promise<StrategyComparisonItem[]> {
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    const results: StrategyComparisonItem[] = [];

    for (const stratId of strategyIds) {
      const report = await this.executeBacktest({
        strategyId: stratId,
        startDate,
        endDate,
        initialCapital: 100_000_000,
        walkForward: false,
      });

      // Consistency score (0-100) based on Sharpe, drawdown, and win rate
      const consistency = Math.min(
        99,
        Math.max(
          10,
          Math.round(
            (report.winRate * 0.4) +
            Math.max(0, (100 - report.maxDrawdown * 2.5) * 0.3) +
            Math.min(30, Math.max(0, report.sharpeRatio * 15))
          )
        )
      );

      results.push({
        strategyId: stratId,
        strategyName: report.strategyName,
        totalReturn: report.totalReturn,
        cagr: report.cagr,
        winRate: report.winRate,
        maxDrawdown: report.maxDrawdown,
        sharpeRatio: report.sharpeRatio,
        sortinoRatio: report.sortinoRatio,
        profitFactor: report.profitFactor,
        totalTrades: report.totalTrades,
        consistencyScore: consistency,
        equityCurve: report.equityCurve.map((e) => ({ date: e.date, equity: e.portfolioEquity })),
      });
    }

    return results;
  }
}

export const strategyService = new StrategyService();
