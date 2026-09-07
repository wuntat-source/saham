import { NextRequest, NextResponse } from 'next/server';
import { CategoryLeaderboardService } from '@/modules/classroom/leaderboard/category-leaderboard.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId') || undefined;

    const leaderboards = await CategoryLeaderboardService.getMultiCategoryLeaderboards(classId);

    return NextResponse.json({ success: true, leaderboards });
  } catch (error: any) {
    console.error('Error fetching multi-category leaderboard:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
