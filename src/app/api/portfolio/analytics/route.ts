import { NextRequest, NextResponse } from 'next/server';
import { portfolioHealthService } from '@/modules/intelligence/advanced/portfolio-health/portfolio-health.service';
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

    const analytics = await portfolioHealthService.getPortfolioHealth(user.id);
    return NextResponse.json({
      success: true,
      ...analytics,
    });
  } catch (error: any) {
    console.error('Error in /api/portfolio/analytics:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate portfolio analytics' },
      { status: 500 }
    );
  }
}
