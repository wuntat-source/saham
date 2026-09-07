import { NextRequest, NextResponse } from 'next/server';
import { scenarioService } from '@/modules/intelligence/advanced/scenario/scenario.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const scenarios = await scenarioService.getStockScenarios(ticker);
    return NextResponse.json({
      success: true,
      ...scenarios,
    });
  } catch (error: any) {
    console.error('Error in /api/stocks/[ticker]/scenarios:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
