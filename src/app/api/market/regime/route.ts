import { NextResponse } from 'next/server';
import { marketRegimeService } from '@/modules/intelligence/advanced/regime/regime.service';

export async function GET() {
  try {
    const regime = await marketRegimeService.getMarketRegime();
    return NextResponse.json({
      success: true,
      ...regime,
    });
  } catch (error: any) {
    console.error('Error in /api/market/regime:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch market regime' },
      { status: 500 }
    );
  }
}
