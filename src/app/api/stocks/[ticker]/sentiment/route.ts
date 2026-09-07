import { NextRequest, NextResponse } from 'next/server';
import { screenerService } from '@/modules/intelligence/screener/screener.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const intelligence = await screenerService.getStockIntelligence(ticker);
    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      sentiment: intelligence.scores.sentiment,
    });
  } catch (error: any) {
    console.error('Error in /api/stocks/[ticker]/sentiment:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch sentiment metrics' },
      { status: 500 }
    );
  }
}
