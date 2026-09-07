import { NextRequest, NextResponse } from 'next/server';
import { strategyService } from '@/modules/quant/strategy/strategy.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('strategyId') || undefined;

    const backtests = await strategyService.getBacktests(strategyId);
    return NextResponse.json({ success: true, backtests });
  } catch (error: any) {
    console.error('Error in GET /api/backtests:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch backtests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      strategyId,
      strategyRules,
      startDate,
      endDate,
      initialCapital,
      buyFeePct,
      sellFeePct,
      slippagePct,
      universe,
      walkForward,
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const report = await strategyService.executeBacktest({
      strategyId,
      strategyRules,
      startDate,
      endDate,
      initialCapital: initialCapital ? parseFloat(initialCapital) : 100_000_000,
      buyFeePct: buyFeePct !== undefined ? parseFloat(buyFeePct) : 0.15,
      sellFeePct: sellFeePct !== undefined ? parseFloat(sellFeePct) : 0.25,
      slippagePct: slippagePct !== undefined ? parseFloat(slippagePct) : 0.1,
      universe: universe || 'LQ45',
      walkForward: walkForward ?? true,
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error in POST /api/backtests:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute backtest' },
      { status: 500 }
    );
  }
}
