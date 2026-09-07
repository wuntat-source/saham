import { NextRequest, NextResponse } from 'next/server';
import { ConsensusLensEngine } from '@/modules/investment-lens/consensus/consensus-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const evaluation = await ConsensusLensEngine.evaluateStock(ticker);

    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      ...evaluation,
    });
  } catch (error: any) {
    console.error('Error evaluating stock in /api/investment-lens/[ticker]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
