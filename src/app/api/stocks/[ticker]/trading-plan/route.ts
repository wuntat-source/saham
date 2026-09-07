import { NextRequest, NextResponse } from 'next/server';
import { tradingPlanService } from '@/modules/intelligence/advanced/trading-plan/trading-plan.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const plan = await tradingPlanService.getTradingPlan(ticker);
    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      plan,
    });
  } catch (error: any) {
    console.error('Error in /api/stocks/[ticker]/trading-plan:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch trading plan' },
      { status: 500 }
    );
  }
}
