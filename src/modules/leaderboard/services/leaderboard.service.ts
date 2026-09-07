import { prisma } from '@/lib/prisma';
import { defaultMarketProvider } from '@/modules/market/providers';
import { StudentLeaderboardRow } from '@/types/classroom';

export class LeaderboardService {
  async getClassLeaderboard(classId: string): Promise<{
    classInfo: {
      id: string;
      className: string;
      invitationCode: string;
      initialBalance: number;
      teacherName: string;
    };
    leaderboard: StudentLeaderboardRow[];
    updatedAt: string;
  }> {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            student: {
              include: {
                wallet: true,
                portfolios: { where: { total_shares: { gt: 0 } } },
                transactions: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new Error('Kelas tidak ditemukan.');
    }

    const stockSet = new Set<string>();
    classData.members.forEach((m) => {
      m.student.portfolios.forEach((p) => stockSet.add(p.stock_code));
    });

    const quoteMap = new Map<string, number>();
    for (const ticker of Array.from(stockSet)) {
      const q = await defaultMarketProvider.getQuote(ticker);
      quoteMap.set(ticker, q.price);
    }

    const initialBalance = classData.initial_balance || 100_000_000.0;

    const rows: StudentLeaderboardRow[] = classData.members.map((m) => {
      const student = m.student;
      const cash = student.wallet?.cash_balance ?? initialBalance;
      let stockValue = 0;

      student.portfolios.forEach((p) => {
        const curPrice = quoteMap.get(p.stock_code) ?? p.avg_buy_price;
        stockValue += p.total_shares * curPrice;
      });

      const totalEquity = cash + stockValue;
      const roiPercent = ((totalEquity - initialBalance) / initialBalance) * 100;
      const totalRealizedPnl = student.transactions.reduce((acc, t) => acc + (t.realized_pnl || 0), 0);

      return {
        rank: 0,
        student_id: student.id,
        student_name: student.name,
        email: student.email,
        cash_balance: cash,
        portfolio_value: stockValue,
        total_equity: totalEquity,
        initial_balance: initialBalance,
        roi_percent: parseFloat(roiPercent.toFixed(2)),
        realized_pnl: totalRealizedPnl,
        holdings_count: student.portfolios.length,
      };
    });

    // Rank descending by Total Equity
    rows.sort((a, b) => b.total_equity - a.total_equity);
    rows.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return {
      classInfo: {
        id: classData.id,
        className: classData.class_name,
        invitationCode: classData.invitation_code,
        initialBalance: classData.initial_balance,
        teacherName: classData.teacher.name,
      },
      leaderboard: rows,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const leaderboardService = new LeaderboardService();
