import { NextRequest, NextResponse } from 'next/server';
import { CommonDataEngine } from '@/modules/investment-lens/data/common-data-engine';
import { EarningsExpectationsLensEngine } from '@/modules/investment-lens/lenses/earnings-expectations-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const data = await CommonDataEngine.getNormalizedData(ticker);
    const result = EarningsExpectationsLensEngine.analyze(data);

    return NextResponse.json({
      success: true,
      lens: 'EARNINGS_EXPECTATIONS',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in earnings expectations lens route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
