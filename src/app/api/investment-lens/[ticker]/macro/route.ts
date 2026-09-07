import { NextRequest, NextResponse } from 'next/server';
import { CommonDataEngine } from '@/modules/investment-lens/data/common-data-engine';
import { MacroCatalystLensEngine } from '@/modules/investment-lens/lenses/macro-catalyst-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const data = await CommonDataEngine.getNormalizedData(ticker);
    const result = MacroCatalystLensEngine.analyze(data);

    return NextResponse.json({
      success: true,
      lens: 'MACRO_CATALYST',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in macro lens route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
