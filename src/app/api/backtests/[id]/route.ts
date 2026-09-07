import { NextRequest, NextResponse } from 'next/server';
import { strategyService } from '@/modules/quant/strategy/strategy.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await strategyService.getBacktestById(id);

    if (!report) {
      return NextResponse.json({ success: false, error: 'Backtest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error in GET /api/backtests/[id]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch backtest' },
      { status: 500 }
    );
  }
}
