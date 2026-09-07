import { NextRequest, NextResponse } from 'next/server';
import { strategyService } from '@/modules/quant/strategy/strategy.service';
import { strategyReviewService } from '@/modules/quant/ai-review/strategy-review.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await strategyService.getBacktestById(id);

    if (!report) {
      return NextResponse.json({ success: false, error: 'Backtest not found' }, { status: 404 });
    }

    const strat = await strategyService.getStrategyById(report.strategyId);
    if (!strat) {
      return NextResponse.json({ success: false, error: 'Strategy not found' }, { status: 404 });
    }

    const aiReview = strategyReviewService.generateReview(report, strat.rules);

    return NextResponse.json({ success: true, aiReview });
  } catch (error: any) {
    console.error('Error in POST /api/backtests/[id]/review:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to review backtest' },
      { status: 500 }
    );
  }
}
