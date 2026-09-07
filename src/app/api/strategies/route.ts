import { NextRequest, NextResponse } from 'next/server';
import { strategyService } from '@/modules/quant/strategy/strategy.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    let userId = sessionToken;

    if (!userId) {
      // Fallback to demo user if unauthenticated
      const demoUser = await prisma.user.findFirst();
      userId = demoUser?.id || 'demo-user';
    }

    const strategies = await strategyService.getStrategies(userId);
    return NextResponse.json({ success: true, strategies });
  } catch (error: any) {
    console.error('Error in GET /api/strategies:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch strategies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    let userId = sessionToken;

    if (!userId) {
      const demoUser = await prisma.user.findFirst();
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, rules, universe, timeframe } = body;

    if (!name || !rules) {
      return NextResponse.json(
        { success: false, error: 'Name and rules are required' },
        { status: 400 }
      );
    }

    const strategy = await strategyService.createStrategy({
      userId,
      name,
      description: description || '',
      rules,
      universe,
      timeframe,
    });

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    console.error('Error in POST /api/strategies:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create strategy' },
      { status: 500 }
    );
  }
}
