import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');

    const whereClause: any = { user_id: user.userId };
    if (ticker) {
      whereClause.stock_code = ticker.toUpperCase();
    }

    const [transactions, orders] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { executed_at: 'desc' },
        take: 50,
      }),
      prisma.order.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      transactions,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
