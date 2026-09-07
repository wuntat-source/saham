import { NextRequest, NextResponse } from 'next/server';
import { ConsensusLensEngine } from '@/modules/investment-lens/consensus/consensus-lens.engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const { searchParams } = new URL(req.url);

    // Optional custom weights from query params (e.g. ?w_inst=20&w_growth=30)
    const customWeights: Record<string, number> = {};
    const wInst = searchParams.get('w_institutional');
    const wLong = searchParams.get('w_long_term');
    const wGrowth = searchParams.get('w_growth');
    const wMacro = searchParams.get('w_macro');
    const wEarn = searchParams.get('w_earnings');
    const wComp = searchParams.get('w_compounder');

    if (wInst) customWeights['institutional'] = parseFloat(wInst);
    if (wLong) customWeights['long-term'] = parseFloat(wLong);
    if (wGrowth) customWeights['growth'] = parseFloat(wGrowth);
    if (wMacro) customWeights['macro'] = parseFloat(wMacro);
    if (wEarn) customWeights['earnings'] = parseFloat(wEarn);
    if (wComp) customWeights['compounder'] = parseFloat(wComp);

    const evaluation = await ConsensusLensEngine.evaluateStock(
      ticker,
      Object.keys(customWeights).length > 0 ? customWeights : undefined
    );

    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      comparison: {
        scores: evaluation.consensus.scores,
        radarData: evaluation.consensus.scores.map((s) => ({
          lens: s.name,
          score: s.score,
          fullMark: 100,
        })),
        strongestLens: evaluation.consensus.strongestLens,
        weakestLens: evaluation.consensus.weakestLens,
        disagreements: evaluation.consensus.disagreements,
        consensusScore: evaluation.consensus.consensusScore,
        safetyStatus: evaluation.consensus.safetyStatus,
      },
    });
  } catch (error: any) {
    console.error('Error in lens comparison route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
