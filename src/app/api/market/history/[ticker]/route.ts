import { NextResponse } from 'next/server';
import { getHistoricalCandles } from '@/lib/market';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') as '1D' | '1W' | '1M' | '1Y') || '1D';

    const candles = getHistoricalCandles(ticker, range);
    return NextResponse.json({ ticker, range, candles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
