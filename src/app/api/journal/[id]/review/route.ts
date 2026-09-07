import { NextRequest, NextResponse } from 'next/server';
import { journalService } from '@/modules/learning/journal/journal.service';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { realizedPnl, exitPrice } = body;

    const review = await journalService.reviewTrade({
      journalId: id,
      userId: user.id,
      realizedPnl: realizedPnl !== undefined ? parseFloat(realizedPnl) : 1500000,
      exitPrice: exitPrice !== undefined ? parseFloat(exitPrice) : undefined,
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error: any) {
    console.error('Error in /api/journal/[id]/review:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to review trade' },
      { status: 500 }
    );
  }
}
