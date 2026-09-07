import { NextRequest, NextResponse } from 'next/server';
import { strategyService } from '@/modules/quant/strategy/strategy.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const strategy = await strategyService.getStrategyById(id);

    if (!strategy) {
      return NextResponse.json({ success: false, error: 'Strategy not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    console.error('Error in GET /api/strategies/[id]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch strategy' },
      { status: 500 }
    );
  }
}
