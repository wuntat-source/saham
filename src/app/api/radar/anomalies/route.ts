import { NextResponse } from 'next/server';
import { anomalyService } from '@/modules/intelligence/advanced/anomaly/anomaly.service';

export async function GET() {
  try {
    const anomalies = await anomalyService.getMarketAnomalies();
    return NextResponse.json({
      success: true,
      count: anomalies.length,
      anomalies,
    });
  } catch (error: any) {
    console.error('Error in /api/radar/anomalies:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}
