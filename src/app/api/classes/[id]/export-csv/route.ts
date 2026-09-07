import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchStockQuote } from '@/lib/market';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = await params;

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: true,
        members: {
          include: {
            student: {
              include: {
                wallet: true,
                portfolios: {
                  where: { total_shares: { gt: 0 } },
                },
                transactions: true,
              },
            },
          },
        },
      },
    });

    if (!classInfo) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan.' }, { status: 404 });
    }

    // Verify teacher owns class or admin
    if (classInfo.teacher_id !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const stockSet = new Set<string>();
    classInfo.members.forEach((m) => {
      m.student.portfolios.forEach((p) => stockSet.add(p.stock_code));
    });

    const quotesMap = new Map<string, number>();
    for (const ticker of Array.from(stockSet)) {
      const q = await fetchStockQuote(ticker);
      quotesMap.set(ticker, q.price);
    }

    const initialBalance = classInfo.initial_balance || 100_000_000.0;

    // Build rows
    const rows = [
      ['Rank', 'Nama Siswa', 'Email', 'Saldo Kas (Rp)', 'Nilai Portofolio (Rp)', 'Total Ekuitas (Rp)', 'Floating Return (%)', 'Total Transaksi', 'Kepemilikan Saham'],
    ];

    const studentStats = classInfo.members.map((m) => {
      const s = m.student;
      const cash = s.wallet?.cash_balance || 0;
      let stockVal = 0;
      const holdingSummaries: string[] = [];

      s.portfolios.forEach((p) => {
        const curPrice = quotesMap.get(p.stock_code) || p.avg_buy_price;
        const val = p.total_shares * curPrice;
        stockVal += val;
        holdingSummaries.push(`${p.stock_code}: ${Math.floor(p.total_shares / 100)} lot`);
      });

      const totalEquity = cash + stockVal;
      const returnPct = ((totalEquity - initialBalance) / initialBalance) * 100;

      return {
        name: s.name,
        email: s.email,
        cash,
        stockVal,
        totalEquity,
        returnPct,
        tradesCount: s.transactions.length,
        holdingsStr: holdingSummaries.join('; ') || 'Tidak ada',
      };
    });

    studentStats.sort((a, b) => b.totalEquity - a.totalEquity);

    studentStats.forEach((s, idx) => {
      rows.push([
        (idx + 1).toString(),
        `"${s.name.replace(/"/g, '""')}"`,
        s.email,
        s.cash.toFixed(2),
        s.stockVal.toFixed(2),
        s.totalEquity.toFixed(2),
        s.returnPct.toFixed(2) + '%',
        s.tradesCount.toString(),
        `"${s.holdingsStr.replace(/"/g, '""')}"`,
      ]);
    });

    const csvContent = rows.map((r) => r.join(',')).join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rekap_kelas_${classInfo.class_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: error.message || 'Gagal export CSV.' }, { status: 500 });
  }
}
