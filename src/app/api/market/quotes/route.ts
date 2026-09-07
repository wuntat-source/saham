import { NextResponse } from 'next/server';
import { getAllQuotes } from '@/lib/market';

export async function GET() {
  try {
    const quotes = await getAllQuotes();
    return NextResponse.json({ quotes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
