import { NextResponse } from 'next/server';
import { sectorService } from '@/modules/intelligence/advanced/sector/sector.service';

export async function GET() {
  try {
    const overview = await sectorService.getSectorsOverview();
    return NextResponse.json({
      success: true,
      ...overview,
    });
  } catch (error: any) {
    console.error('Error in /api/sectors:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch sectors overview' },
      { status: 500 }
    );
  }
}
