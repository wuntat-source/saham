import { prisma } from '@/lib/prisma';
import { AssignmentItem, ChallengeItem } from '@/types/learning';

export class TeacherLearningService {
  /**
   * Teacher creates a new homework or analysis assignment.
   */
  public async createAssignment(params: {
    classId: string;
    teacherId: string;
    title: string;
    description: string;
    deadline: string;
    stockUniverse?: string;
    requiredOutput: string;
  }): Promise<AssignmentItem> {
    const assignment = await prisma.assignment.create({
      data: {
        class_id: params.classId,
        teacher_id: params.teacherId,
        title: params.title,
        description: params.description,
        deadline: new Date(params.deadline),
        stock_universe: params.stockUniverse || 'LQ45 / Kompas100',
        required_output: params.requiredOutput,
      },
    });

    return {
      id: assignment.id,
      classId: assignment.class_id,
      teacherId: assignment.teacher_id,
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline.toISOString(),
      stockUniverse: assignment.stock_universe,
      requiredOutput: assignment.required_output,
      createdAt: assignment.created_at.toISOString(),
    };
  }

  public async getAssignments(classId?: string, studentId?: string): Promise<AssignmentItem[]> {
    const assignments = await prisma.assignment.findMany({
      where: classId ? { class_id: classId } : {},
      orderBy: { created_at: 'desc' },
      include: {
        submissions: true,
      },
    });

    return assignments.map((a) => {
      const mySub = studentId ? a.submissions.find((s) => s.student_id === studentId) : null;
      return {
        id: a.id,
        classId: a.class_id,
        teacherId: a.teacher_id,
        title: a.title,
        description: a.description,
        deadline: a.deadline.toISOString(),
        stockUniverse: a.stock_universe,
        requiredOutput: a.required_output,
        createdAt: a.created_at.toISOString(),
        submissionCount: a.submissions.length,
        mySubmission: mySub
          ? {
              id: mySub.id,
              content: mySub.content,
              grade: mySub.grade,
              feedback: mySub.feedback,
              submittedAt: mySub.submitted_at.toISOString(),
            }
          : null,
      };
    });
  }

  public async submitAssignment(params: {
    assignmentId: string;
    studentId: string;
    content: string;
  }) {
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignment_id: params.assignmentId,
        student_id: params.studentId,
        content: params.content,
      },
    });

    return submission;
  }

  public async createChallenge(params: {
    classId: string;
    teacherId: string;
    title: string;
    type: 'PORTFOLIO' | 'FUNDAMENTAL' | 'TECHNICAL' | 'RISK' | 'RESEARCH';
    description: string;
    endDate: string;
    rewardXp?: number;
  }): Promise<ChallengeItem> {
    const challenge = await prisma.challenge.create({
      data: {
        class_id: params.classId,
        teacher_id: params.teacherId,
        title: params.title,
        type: params.type,
        description: params.description,
        end_date: new Date(params.endDate),
        reward_xp: params.rewardXp || 250,
      },
    });

    return {
      id: challenge.id,
      classId: challenge.class_id,
      teacherId: challenge.teacher_id,
      title: challenge.title,
      type: challenge.type as any,
      description: challenge.description,
      startDate: challenge.start_date.toISOString(),
      endDate: challenge.end_date.toISOString(),
      rewardXp: challenge.reward_xp,
    };
  }

  public async getChallenges(classId?: string): Promise<ChallengeItem[]> {
    const challenges = await prisma.challenge.findMany({
      where: classId ? { class_id: classId } : {},
      orderBy: { start_date: 'desc' },
    });

    if (challenges.length === 0) {
      // Seed default sample challenge
      return [
        {
          id: 'ch-default-1',
          classId: classId || 'c1',
          teacherId: 't1',
          title: 'Tantangan Portofolio Risiko Terukur (Max Drawdown < 5%)',
          type: 'RISK',
          description: 'Bangun portofolio dengan 3-5 saham berbeda dan pertahankan batas risiko Stop Loss disiplin selama 1 minggu.',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          rewardXp: 300,
        },
      ];
    }

    return challenges.map((c) => ({
      id: c.id,
      classId: c.class_id,
      teacherId: c.teacher_id,
      title: c.title,
      type: c.type as any,
      description: c.description,
      startDate: c.start_date.toISOString(),
      endDate: c.end_date.toISOString(),
      rewardXp: c.reward_xp,
    }));
  }
}

export const teacherLearningService = new TeacherLearningService();
