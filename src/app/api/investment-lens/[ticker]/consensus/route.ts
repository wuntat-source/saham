import { NextRequest, NextResponse } from 'next/server';
import { ConsensusLensEngine } from '@/modules/investment-lens/consensus/consensus-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const evaluation = await ConsensusLensEngine.evaluateStock(ticker);

    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      consensus: evaluation.consensus,
    });
  } catch (error: any) {
    console.error('Error in lens consensus route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
