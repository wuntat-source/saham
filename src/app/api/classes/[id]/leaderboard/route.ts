import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchStockQuote } from '@/lib/market';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            student: {
              include: {
                wallet: true,
                portfolios: {
                  where: { total_shares: { gt: 0 } },
                },
                transactions: {
                  take: 5,
                  orderBy: { executed_at: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!classInfo) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan.' }, { status: 404 });
    }

    // Collect all distinct stock codes across student portfolios
    const stockSet = new Set<string>();
    classInfo.members.forEach((m) => {
      m.student.portfolios.forEach((p) => {
        stockSet.add(p.stock_code);
      });
    });

    // Fetch live market quotes for all relevant stocks
    const quotesMap = new Map<string, number>();
    for (const ticker of Array.from(stockSet)) {
      const quote = await fetchStockQuote(ticker);
      quotesMap.set(ticker, quote.price);
    }

    const initialBalance = classInfo.initial_balance || 100_000_000.0;

    // Calculate metrics for each student
    const leaderboard = classInfo.members.map((m) => {
      const student = m.student;
      const cash = student.wallet?.cash_balance || 0;

      let stockValue = 0;
      const holdings = student.portfolios.map((p) => {
        const currentPrice = quotesMap.get(p.stock_code) || p.avg_buy_price;
        const value = p.total_shares * currentPrice;
        const costBasis = p.total_shares * p.avg_buy_price;
        const floatingPnl = value - costBasis;
        const floatingPnlPct = costBasis > 0 ? (floatingPnl / costBasis) * 100 : 0;

        stockValue += value;

        return {
          stockCode: p.stock_code,
          lots: Math.floor(p.total_shares / 100),
          shares: p.total_shares,
          avgBuyPrice: p.avg_buy_price,
          currentPrice,
          marketValue: value,
          floatingPnl,
          floatingPnlPct: parseFloat(floatingPnlPct.toFixed(2)),
        };
      });

      const totalEquity = cash + stockValue;
      const floatingReturn = ((totalEquity - initialBalance) / initialBalance) * 100;

      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        cashBalance: cash,
        stockValue,
        totalEquity,
        initialBalance,
        returnPct: parseFloat(floatingReturn.toFixed(2)),
        totalReturnRp: totalEquity - initialBalance,
        holdingsCount: holdings.length,
        holdings,
        recentTradesCount: student.transactions.length,
      };
    });

    // Sort descending by Total Equity
    leaderboard.sort((a, b) => b.totalEquity - a.totalEquity);

    // Assign ranks
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return NextResponse.json({
      class: {
        id: classInfo.id,
        className: classInfo.class_name,
        invitationCode: classInfo.invitation_code,
        initialBalance: classInfo.initial_balance,
        teacher: classInfo.teacher,
        totalStudents: rankedLeaderboard.length,
      },
      leaderboard: rankedLeaderboard,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: error.message || 'Gagal memuat leaderboard.' }, { status: 500 });
  }
}
