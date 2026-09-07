import { NextRequest, NextResponse } from 'next/server';
import { journalService } from '@/modules/learning/journal/journal.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const journal = await journalService.getJournalById(id);
    if (!journal) {
      return NextResponse.json({ success: false, error: 'Journal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      journal,
    });
  } catch (error: any) {
    console.error('Error in /api/journal/[id]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch journal' },
      { status: 500 }
    );
  }
}
