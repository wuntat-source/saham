import { NextResponse } from 'next/server';
import { generateComprehensiveAnalysis } from '@/lib/stock-analysis';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const analysis = await generateComprehensiveAnalysis(ticker);
    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghasilkan analisis saham.' }, { status: 500 });
  }
}
