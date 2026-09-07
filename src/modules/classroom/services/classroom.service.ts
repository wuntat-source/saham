import { prisma } from '@/lib/prisma';
import { DEFAULT_INITIAL_BALANCE } from '@/lib/constants';
import { defaultMarketProvider } from '@/modules/market/providers';

export class ClassroomService {
  private generateCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createClass(teacherId: string, className: string, initialBalance = DEFAULT_INITIAL_BALANCE) {
    let code = this.generateCode(6);
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.class.findUnique({ where: { invitation_code: code } });
      if (!existing) isUnique = true;
      else {
        code = this.generateCode(6);
        attempts++;
      }
    }

    return prisma.class.create({
      data: {
        teacher_id: teacherId,
        class_name: className.trim(),
        invitation_code: code,
        initial_balance: initialBalance,
      },
    });
  }

  async joinClass(studentId: string, invitationCode: string) {
    const code = invitationCode.toUpperCase().trim();
    const targetClass = await prisma.class.findUnique({
      where: { invitation_code: code },
    });

    if (!targetClass) {
      throw new Error('Kode undangan kelas tidak valid atau kelas tidak ditemukan.');
    }

    const existing = await prisma.classMember.findUnique({
      where: {
        class_id_student_id: {
          class_id: targetClass.id,
          student_id: studentId,
        },
      },
    });

    if (existing) {
      throw new Error('Anda sudah terdaftar di dalam kelas ini.');
    }

    // Join
    await prisma.classMember.create({
      data: {
        class_id: targetClass.id,
        student_id: studentId,
      },
    });

    // Initialize wallet if needed
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: studentId },
    });

    if (!wallet) {
      await prisma.wallet.create({
        data: {
          user_id: studentId,
          cash_balance: targetClass.initial_balance,
        },
      });
    }

    return targetClass;
  }

  async getTeacherDashboardData(teacherId: string) {
    const classes = await prisma.class.findMany({
      where: { teacher_id: teacherId },
      include: {
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

    if (classes.length === 0) {
      return {
        classes: [],
        totalStudents: 0,
        classEquityAverage: 0,
        averageRoi: 0,
        topPerformer: null,
        mostActiveTrader: null,
        recentTransactions: [],
      };
    }

    const activeClass = classes[0];
    const studentIds = activeClass.members.map((m) => m.student_id);

    // Get quotes for all student portfolio stocks
    const stockSet = new Set<string>();
    activeClass.members.forEach((m) => {
      m.student.portfolios.forEach((p) => stockSet.add(p.stock_code));
    });

    const quoteMap = new Map<string, number>();
    for (const t of Array.from(stockSet)) {
      const q = await defaultMarketProvider.getQuote(t);
      quoteMap.set(t, q.price);
    }

    const studentMetrics = activeClass.members.map((m) => {
      const s = m.student;
      const cash = s.wallet?.cash_balance ?? activeClass.initial_balance;
      let stockVal = 0;
      s.portfolios.forEach((p) => {
        const pPrice = quoteMap.get(p.stock_code) ?? p.avg_buy_price;
        stockVal += p.total_shares * pPrice;
      });
      const equity = cash + stockVal;
      const roi = ((equity - activeClass.initial_balance) / activeClass.initial_balance) * 100;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        cash,
        stockVal,
        equity,
        roi,
        tradeCount: s.transactions.length,
      };
    });

    const totalStudents = studentMetrics.length;
    const totalClassEquity = studentMetrics.reduce((acc, s) => acc + s.equity, 0);
    const classEquityAverage = totalStudents > 0 ? totalClassEquity / totalStudents : activeClass.initial_balance;
    const averageRoi = totalStudents > 0 ? studentMetrics.reduce((acc, s) => acc + s.roi, 0) / totalStudents : 0;

    const sortedByEquity = [...studentMetrics].sort((a, b) => b.equity - a.equity);
    const topPerformer = sortedByEquity.length > 0 ? sortedByEquity[0] : null;

    const sortedByTrades = [...studentMetrics].sort((a, b) => b.tradeCount - a.tradeCount);
    const mostActiveTrader = sortedByTrades.length > 0 && sortedByTrades[0].tradeCount > 0 ? sortedByTrades[0] : null;

    const recentTransactions = await prisma.transaction.findMany({
      where: { user_id: { in: studentIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { executed_at: 'desc' },
      take: 20,
    });

    return {
      classes,
      activeClass,
      studentMetrics,
      totalStudents,
      classEquityAverage,
      averageRoi: parseFloat(averageRoi.toFixed(2)),
      topPerformer,
      mostActiveTrader,
      recentTransactions,
    };
  }
}

export const classroomService = new ClassroomService();
