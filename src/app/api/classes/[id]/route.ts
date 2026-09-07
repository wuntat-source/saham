import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
        teacher: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                wallet: true,
                portfolios: { where: { total_shares: { gt: 0 } } },
              },
            },
          },
          orderBy: { joined_at: 'desc' },
        },
      },
    });

    if (!classInfo) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan.' }, { status: 404 });
    }

    // Get recent transactions by students in this class
    const studentIds = classInfo.members.map((m) => m.student_id);
    const recentTransactions = await prisma.transaction.findMany({
      where: { user_id: { in: studentIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { executed_at: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      class: classInfo,
      recentTransactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
