import { NextResponse } from 'next/server';
import { radarService } from '@/modules/intelligence/advanced/radar/radar.service';

export async function GET() {
  try {
    const radarData = await radarService.getRadarHubData();
    return NextResponse.json({
      success: true,
      ...radarData,
    });
  } catch (error: any) {
    console.error('Error in /api/radar:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch radar data' },
      { status: 500 }
    );
  }
}
