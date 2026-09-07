import { NextResponse } from 'next/server';
import { LENS_REGISTRY } from '@/modules/investment-lens/metadata/lens-registry';

export async function GET() {
  try {
    const popularStocks = [
      { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Financials' },
      { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Financials' },
      { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Infrastructure' },
      { ticker: 'ASII', name: 'Astra International Tbk', sector: 'Industrials' },
      { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', sector: 'Energy' },
      { ticker: 'UNVR', name: 'Unilever Indonesia Tbk', sector: 'Consumer Non-Cyclicals' },
    ];

    return NextResponse.json({
      success: true,
      lenses: LENS_REGISTRY,
      popularStocks,
      educationalNote:
        'AI Investment Lens provides educational perspectives inspired by distinct professional investment frameworks. Not financial advice.',
    });
  } catch (error: any) {
    console.error('Error in /api/investment-lens:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
