import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditService } from '@/modules/classroom/governance/audit.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Platform-wide counts
    const totalUsers = await prisma.user.count();
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } });
    const classCount = await prisma.class.count();
    const tradeCount = await prisma.transaction.count();
    const journalCount = await prisma.tradingJournal.count();
    const strategyCount = await prisma.strategy.count();
    const certificateCount = await prisma.certificate.count();

    // AI Telemetry
    const aiTelemetry = await AuditService.getAITelemetry();

    // Recent Audit Logs
    const recentAuditLogs = await AuditService.getRecentLogs(25);

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        studentCount,
        teacherCount,
        classCount,
        tradeCount,
        journalCount,
        strategyCount,
        certificateCount,
      },
      aiTelemetry,
      recentAuditLogs,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard metrics:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
