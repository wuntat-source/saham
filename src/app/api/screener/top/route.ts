import { NextResponse } from 'next/server';
import { screenerService } from '@/modules/intelligence/screener/screener.service';

export async function GET() {
  try {
    const top10 = await screenerService.getTop10();
    return NextResponse.json({
      success: true,
      count: top10.length,
      top10,
    });
  } catch (error: any) {
    console.error('Error in /api/screener/top:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch Top 10 stocks' },
      { status: 500 }
    );
  }
}
