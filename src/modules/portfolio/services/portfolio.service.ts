import { prisma } from '@/lib/prisma';
import { defaultMarketProvider } from '@/modules/market/providers';
import { DEFAULT_INITIAL_BALANCE, STOCKS } from '@/lib/constants';
import { PortfolioSummary, HoldingItem } from '@/types/portfolio';

export class PortfolioService {
  async getUserPortfolio(userId: string): Promise<PortfolioSummary> {
    const [wallet, portfolios, classMember, transactions] = await Promise.all([
      prisma.wallet.findUnique({
        where: { user_id: userId },
      }),
      prisma.portfolio.findMany({
        where: {
          user_id: userId,
          total_shares: { gt: 0 },
        },
      }),
      prisma.classMember.findFirst({
        where: { student_id: userId },
        include: { class: true },
      }),
      prisma.transaction.findMany({
        where: { user_id: userId },
        select: { realized_pnl: true },
      }),
    ]);

    const cash = wallet?.cash_balance ?? DEFAULT_INITIAL_BALANCE;
    const initialBalance = classMember?.class.initial_balance ?? DEFAULT_INITIAL_BALANCE;
    const totalRealizedPnl = transactions.reduce((acc, t) => acc + (t.realized_pnl || 0), 0);

    let totalMarketValue = 0;
    let totalInvestedValue = 0;

    const holdings: HoldingItem[] = await Promise.all(
      portfolios.map(async (p) => {
        const quote = await defaultMarketProvider.getQuote(p.stock_code);
        const meta = STOCKS.find((s) => s.ticker === p.stock_code);

        const currentPrice = quote.price;
        const marketValue = p.total_shares * currentPrice;
        const costBasis = p.total_shares * p.avg_buy_price;
        const unrealizedPnl = marketValue - costBasis;
        const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

        totalMarketValue += marketValue;
        totalInvestedValue += costBasis;

        return {
          stock_code: p.stock_code,
          name: meta?.name || `${p.stock_code} Tbk`,
          sector: meta?.sector || 'General',
          lots: Math.floor(p.total_shares / 100),
          total_shares: p.total_shares,
          avg_buy_price: p.avg_buy_price,
          current_price: currentPrice,
          market_value: marketValue,
          cost_basis: costBasis,
          unrealized_pnl: unrealizedPnl,
          unrealized_pnl_pct: parseFloat(unrealizedPnlPct.toFixed(2)),
        };
      })
    );

    const totalEquity = cash + totalMarketValue;
    const totalUnrealizedPnl = totalMarketValue - totalInvestedValue;
    const totalUnrealizedPnlPct = totalInvestedValue > 0 ? (totalUnrealizedPnl / totalInvestedValue) * 100 : 0;
    const returnPercent = ((totalEquity - initialBalance) / initialBalance) * 100;

    return {
      cash_balance: cash,
      invested_value: totalInvestedValue,
      market_value: totalMarketValue,
      total_equity: totalEquity,
      initial_balance: initialBalance,
      unrealized_pnl: totalUnrealizedPnl,
      unrealized_pnl_pct: parseFloat(totalUnrealizedPnlPct.toFixed(2)),
      realized_pnl: totalRealizedPnl,
      return_percent: parseFloat(returnPercent.toFixed(2)),
      holdings,
    };
  }

  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    return this.getUserPortfolio(userId);
  }
}

export const portfolioService = new PortfolioService();
