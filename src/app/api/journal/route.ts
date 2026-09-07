import { NextRequest, NextResponse } from 'next/server';
import { journalService } from '@/modules/learning/journal/journal.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const journals = await journalService.getUserJournals(user.id);
    return NextResponse.json({
      success: true,
      journals,
    });
  } catch (error: any) {
    console.error('Error in GET /api/journal:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { ticker, thesis, entryReason, riskReason, target, stopLoss, transactionId } = body;

    if (!ticker || !thesis) {
      return NextResponse.json(
        { success: false, error: 'Ticker dan Tesis wajib diisi' },
        { status: 400 }
      );
    }

    const journal = await journalService.createJournal({
      userId: user.id,
      ticker,
      thesis,
      entryReason,
      riskReason,
      target: target ? parseFloat(target) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      transactionId,
    });

    return NextResponse.json({
      success: true,
      journal,
    });
  } catch (error: any) {
    console.error('Error in POST /api/journal:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create journal' },
      { status: 500 }
    );
  }
}
