import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LearningPathService } from '@/modules/classroom/path/learning-path.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let userXp = 450; // default for guest/preview

    if (user) {
      const [journals, submissions, transactions, skill] = await Promise.all([
        prisma.tradingJournal.findMany({ where: { user_id: user.userId } }),
        prisma.assignmentSubmission.findMany({ where: { student_id: user.userId } }),
        prisma.transaction.findMany({ where: { user_id: user.userId } }),
        prisma.studentSkill.findFirst({ where: { user_id: user.userId } }),
      ]);

      const activityXp =
        journals.length * 50 +
        submissions.length * 100 +
        transactions.length * 20;

      const skillXp = skill ? skill.learning_score * 10 : 300;
      userXp = Math.max(userXp, activityXp + skillXp);
    }

    const stages = LearningPathService.getProgress(userXp);
    const activeStage = LearningPathService.getCurrentActiveStage(userXp);

    return NextResponse.json({
      success: true,
      userXp,
      activeStage,
      stages,
    });
  } catch (error: any) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
