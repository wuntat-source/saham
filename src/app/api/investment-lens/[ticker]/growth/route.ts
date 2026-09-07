import { NextRequest, NextResponse } from 'next/server';
import { CommonDataEngine } from '@/modules/investment-lens/data/common-data-engine';
import { FundamentalGrowthLensEngine } from '@/modules/investment-lens/lenses/fundamental-growth-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const data = await CommonDataEngine.getNormalizedData(ticker);
    const result = FundamentalGrowthLensEngine.analyze(data);

    return NextResponse.json({
      success: true,
      lens: 'FUNDAMENTAL_GROWTH',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in growth lens route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
