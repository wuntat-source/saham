import { NextResponse } from 'next/server';
import { catalystService } from '@/modules/intelligence/advanced/catalyst/catalyst.service';

export async function GET() {
  try {
    const timeline = await catalystService.getCatalystsTimeline();
    return NextResponse.json({
      success: true,
      ...timeline,
    });
  } catch (error: any) {
    console.error('Error in /api/radar/catalysts:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch catalysts' },
      { status: 500 }
    );
  }
}
