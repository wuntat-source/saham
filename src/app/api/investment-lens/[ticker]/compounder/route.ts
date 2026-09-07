import { NextRequest, NextResponse } from 'next/server';
import { CommonDataEngine } from '@/modules/investment-lens/data/common-data-engine';
import { QualityCompounderLensEngine } from '@/modules/investment-lens/lenses/quality-compounder-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const data = await CommonDataEngine.getNormalizedData(ticker);
    const result = QualityCompounderLensEngine.analyze(data);

    return NextResponse.json({
      success: true,
      lens: 'QUALITY_COMPOUNDER',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in quality compounder lens route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
