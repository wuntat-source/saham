import { NextRequest, NextResponse } from 'next/server';
import { screenerService } from '@/modules/intelligence/screener/screener.service';
import { TrendSignal, ValuationStatus, RiskLevel } from '@/types/intelligence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const sector = searchParams.get('sector') || undefined;
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined;
    const maxScore = searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : undefined;
    const signal = (searchParams.get('signal') as TrendSignal) || undefined;
    const valuation = (searchParams.get('valuation') as ValuationStatus) || undefined;
    const risk = (searchParams.get('risk') as RiskLevel) || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'score';
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    const result = await screenerService.screenStocks({
      search,
      sector,
      minScore,
      maxScore,
      signal,
      valuation,
      risk,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error in /api/screener:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to screen stocks' },
      { status: 500 }
    );
  }
}
