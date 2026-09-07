import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchStockQuote } from '@/lib/market';
import { DEFAULT_INITIAL_BALANCE, STOCKS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user wallet and active portfolios
    const [wallet, portfolios, classMember] = await Promise.all([
      prisma.wallet.findUnique({
        where: { user_id: user.userId },
      }),
      prisma.portfolio.findMany({
        where: {
          user_id: user.userId,
          total_shares: { gt: 0 },
        },
      }),
      prisma.classMember.findFirst({
        where: { student_id: user.userId },
        include: { class: true },
      }),
    ]);

    const cash = wallet?.cash_balance || DEFAULT_INITIAL_BALANCE;
    const initialBalance = classMember?.class.initial_balance || DEFAULT_INITIAL_BALANCE;

    let totalStockValue = 0;
    let totalCostBasis = 0;

    const holdings = await Promise.all(
      portfolios.map(async (p) => {
        const quote = await fetchStockQuote(p.stock_code);
        const stockMeta = STOCKS.find((s) => s.ticker === p.stock_code);

        const currentPrice = quote.price;
        const totalValue = p.total_shares * currentPrice;
        const costBasis = p.total_shares * p.avg_buy_price;
        const floatingPnl = totalValue - costBasis;
        const floatingPnlPct = costBasis > 0 ? (floatingPnl / costBasis) * 100 : 0;

        totalStockValue += totalValue;
        totalCostBasis += costBasis;

        return {
          stockCode: p.stock_code,
          companyName: stockMeta?.name || `${p.stock_code} Tbk`,
          sector: stockMeta?.sector || 'General',
          lots: Math.floor(p.total_shares / 100),
          totalShares: p.total_shares,
          avgBuyPrice: p.avg_buy_price,
          currentPrice,
          marketValue: totalValue,
          costBasis,
          unrealizedPnl: floatingPnl,
          unrealizedPnlPct: parseFloat(floatingPnlPct.toFixed(2)),
          change24hPct: quote.changePct,
        };
      })
    );

    const totalEquity = cash + totalStockValue;
    const totalFloatingPnl = totalStockValue - totalCostBasis;
    const totalFloatingPnlPct = totalCostBasis > 0 ? (totalFloatingPnl / totalCostBasis) * 100 : 0;
    const totalReturnPct = ((totalEquity - initialBalance) / initialBalance) * 100;

    return NextResponse.json({
      cash,
      stockValue: totalStockValue,
      totalEquity,
      initialBalance,
      totalReturnPct: parseFloat(totalReturnPct.toFixed(2)),
      totalFloatingPnl,
      totalFloatingPnlPct: parseFloat(totalFloatingPnlPct.toFixed(2)),
      holdings,
      classInfo: classMember?.class || null,
    });
  } catch (error: any) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
