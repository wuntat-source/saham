import { NextRequest, NextResponse } from 'next/server';
import { CommonDataEngine } from '@/modules/investment-lens/data/common-data-engine';
import { LongTermQualityLensEngine } from '@/modules/investment-lens/lenses/long-term-quality-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const data = await CommonDataEngine.getNormalizedData(ticker);
    const result = LongTermQualityLensEngine.analyze(data);

    return NextResponse.json({
      success: true,
      lens: 'LONG_TERM_QUALITY',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in long-term lens route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
