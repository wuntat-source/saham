import { NextResponse } from 'next/server';
import { fetchStockQuote } from '@/lib/market';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const quote = await fetchStockQuote(ticker);
    return NextResponse.json({ quote });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
