import { NextRequest, NextResponse } from 'next/server';
import { mentorService } from '@/modules/learning/mentor/mentor.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const messages = await mentorService.getChatHistory(user.id);
    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error('Error in GET /api/ai-mentor:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
