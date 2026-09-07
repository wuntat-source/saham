import { NextResponse } from 'next/server';
import { fetchStockQuote, generateOrderBook } from '@/lib/market';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const quote = await fetchStockQuote(ticker);
    const orderBook = generateOrderBook(quote.price, ticker.toUpperCase());
    return NextResponse.json({ orderBook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
