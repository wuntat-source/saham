import { NextRequest, NextResponse } from 'next/server';
import { strategyService } from '@/modules/quant/strategy/strategy.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyIds } = body;

    if (!strategyIds || !Array.isArray(strategyIds) || strategyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Array of strategyIds is required' },
        { status: 400 }
      );
    }

    const comparison = await strategyService.compareStrategies(strategyIds);
    return NextResponse.json({ success: true, comparison });
  } catch (error: any) {
    console.error('Error in POST /api/backtests/compare:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to compare strategies' },
      { status: 500 }
    );
  }
}
