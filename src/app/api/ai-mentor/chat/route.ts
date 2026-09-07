import { NextRequest, NextResponse } from 'next/server';
import { mentorService } from '@/modules/learning/mentor/mentor.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const response = await mentorService.processChat(user.id, message.trim());
    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error: any) {
    console.error('Error in POST /api/ai-mentor/chat:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process mentor chat' },
      { status: 500 }
    );
  }
}
