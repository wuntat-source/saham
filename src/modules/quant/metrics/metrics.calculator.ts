import { BacktestTradeItem, EquityPoint } from '@/types/quant';

export interface PerformanceMetricsResult {
  totalReturn: number; // %
  cagr: number; // %
  winRate: number; // %
  avgWin: number; // Rp
  avgLoss: number; // Rp
  profitFactor: number;
  maxDrawdown: number; // %
  sharpeRatio: number;
  sortinoRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgHoldingDays: number;
}

export class MetricsCalculator {
  /**
   * Computes comprehensive quantitative performance metrics.
   */
  public calculate(
    initialCapital: number,
    finalEquity: number,
    startDate: Date,
    endDate: Date,
    equityCurve: EquityPoint[],
    trades: BacktestTradeItem[]
  ): PerformanceMetricsResult {
    const totalReturn = Math.round(((finalEquity - initialCapital) / initialCapital) * 10000) / 100;

    // Calculate elapsed years for CAGR
    const diffDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.max(0.1, diffDays / 365.25);
    const cagrRaw = (Math.pow(Math.max(0.001, finalEquity / initialCapital), 1 / years) - 1) * 100;
    const cagr = Math.round(cagrRaw * 100) / 100;

    const totalTrades = trades.length;
    const winningList = trades.filter((t) => t.netPnl > 0);
    const losingList = trades.filter((t) => t.netPnl <= 0);

    const winningTrades = winningList.length;
    const losingTrades = losingList.length;
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 10000) / 100 : 0;

    const grossGains = winningList.reduce((acc, t) => acc + t.netPnl, 0);
    const grossLosses = Math.abs(losingList.reduce((acc, t) => acc + t.netPnl, 0));

    const avgWin = winningTrades > 0 ? Math.round(grossGains / winningTrades) : 0;
    const avgLoss = losingTrades > 0 ? Math.round(grossLosses / losingTrades) : 0;

    let profitFactor = 1.0;
    if (grossLosses === 0) {
      profitFactor = grossGains > 0 ? 99.99 : 1.0;
    } else {
      profitFactor = Math.round((grossGains / grossLosses) * 100) / 100;
    }

    // Maximum Drawdown (MDD) from daily equity curve
    let peak = initialCapital;
    let maxDrawdown = 0;

    for (const pt of equityCurve) {
      if (pt.portfolioEquity > peak) {
        peak = pt.portfolioEquity;
      }
      const dd = peak > 0 ? ((peak - pt.portfolioEquity) / peak) * 100 : 0;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }
    maxDrawdown = Math.round(maxDrawdown * 100) / 100;

    // Daily returns for Sharpe & Sortino
    const dailyReturns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1].portfolioEquity;
      const curr = equityCurve[i].portfolioEquity;
      if (prev > 0) {
        dailyReturns.push((curr - prev) / prev);
      }
    }

    const rfDaily = 0.06 / 252; // 6% annual risk-free rate (BI benchmark)
    let sharpeRatio = 0;
    let sortinoRatio = 0;

    if (dailyReturns.length > 5) {
      const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
      const excessReturn = meanReturn - rfDaily;

      // Standard Deviation (All variance)
      const variance =
        dailyReturns.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) / (dailyReturns.length - 1);
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0.0001) {
        sharpeRatio = Math.round(((excessReturn / stdDev) * Math.sqrt(252)) * 100) / 100;
      }

      // Downside Deviation (Negative excess returns only)
      const downsideVariance =
        dailyReturns.reduce((acc, r) => (r < rfDaily ? acc + Math.pow(r - rfDaily, 2) : acc), 0) /
        dailyReturns.length;
      const downsideStdDev = Math.sqrt(downsideVariance);

      if (downsideStdDev > 0.0001) {
        sortinoRatio = Math.round(((excessReturn / downsideStdDev) * Math.sqrt(252)) * 100) / 100;
      }
    }

    // Average holding period
    const totalHoldingDays = trades.reduce((acc, t) => acc + t.holdingDays, 0);
    const avgHoldingDays = totalTrades > 0 ? Math.round((totalHoldingDays / totalTrades) * 10) / 10 : 0;

    return {
      totalReturn,
      cagr,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      maxDrawdown,
      sharpeRatio,
      sortinoRatio,
      totalTrades,
      winningTrades,
      losingTrades,
      avgHoldingDays,
    };
  }
}

export const metricsCalculator = new MetricsCalculator();
