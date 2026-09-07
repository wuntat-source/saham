import { NextRequest, NextResponse } from 'next/server';
import { debateService } from '@/modules/intelligence/advanced/debate/debate.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    const debate = await debateService.getStockDebate(ticker);
    return NextResponse.json({
      success: true,
      ...debate,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/debate:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to conduct AI debate' },
      { status: 500 }
    );
  }
}
