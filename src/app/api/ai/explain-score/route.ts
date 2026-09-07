import { NextRequest, NextResponse } from 'next/server';
import { screenerService } from '@/modules/intelligence/screener/screener.service';
import { ExplainScoreRequest } from '@/types/intelligence';

export async function POST(request: NextRequest) {
  try {
    const body: ExplainScoreRequest = await request.json();
    const { ticker, pillar } = body;

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    const explanation = await screenerService.explainScore(ticker, pillar || 'overall');

    return NextResponse.json({
      success: true,
      ...explanation,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/explain-score:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate score explanation' },
      { status: 500 }
    );
  }
}
