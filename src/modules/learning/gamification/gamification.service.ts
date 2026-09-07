import { prisma } from '@/lib/prisma';
import { StudentLearningProgress } from '@/types/learning';

const BADGE_DEFINITIONS: Record<string, { title: string; description: string }> = {
  FUNDAMENTAL_EXPLORER: {
    title: 'Fundamental Explorer',
    description: 'Menganalisis rasio profitabilitas, ROE, dan solvabilitas emiten secara mendalam.',
  },
  TECHNICAL_ANALYST: {
    title: 'Technical Analyst',
    description: 'Menguasai indikator tren MA, RSI, MACD, dan pola breakout grafik candlestick.',
  },
  RISK_MANAGER: {
    title: 'Risk Manager',
    description: 'Disiplin menentukan batas Stop Loss protektif pada setiap rencana transaksi virtual.',
  },
  PORTFOLIO_STRATEGIST: {
    title: 'Portfolio Strategist',
    description: 'Mencapai skor kesehatan portofolio di atas 80 dengan diversifikasi sektoral yang sehat.',
  },
  MARKET_RESEARCHER: {
    title: 'Market Researcher',
    description: 'Melakukan riset kalender katalis, laporan dividen, dan perbandingan relatif sektor.',
  },
  DIVERSIFICATION_MASTER: {
    title: 'Diversification Master',
    description: 'Mengalokasikan portofolio ke minimal 4 sektor industri dengan indeks HHI rendah.',
  },
  CONSISTENT_TRADER: {
    title: 'Consistent Trader',
    description: 'Menjaga streak menulis trading journal dan analisis pasar selama minimal 5 hari berturut-turut.',
  },
};

export class GamificationService {
  /**
   * Rewards XP to a student and handles level-up transitions.
   */
  public async rewardXp(userId: string, xpAmount: number, reason: string): Promise<{
    newXp: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    let progress = await prisma.learningProgress.findUnique({
      where: { user_id: userId },
    });

    if (!progress) {
      progress = await prisma.learningProgress.create({
        data: {
          user_id: userId,
          xp: 100,
          level: 1,
          streak_days: 1,
        },
      });
    }

    const currentXp = progress.xp + xpAmount;
    const currentLevel = progress.level;
    const newLevel = Math.max(1, Math.floor(currentXp / 250) + 1);
    const leveledUp = newLevel > currentLevel;

    await prisma.learningProgress.update({
      where: { user_id: userId },
      data: {
        xp: currentXp,
        level: newLevel,
        last_active_at: new Date(),
      },
    });

    // Automatically check and award badges if criteria are met
    if (newLevel >= 2) {
      await this.unlockBadge(userId, 'FUNDAMENTAL_EXPLORER');
    }
    if (newLevel >= 3) {
      await this.unlockBadge(userId, 'RISK_MANAGER');
    }

    return {
      newXp: currentXp,
      newLevel,
      leveledUp,
    };
  }

  public async unlockBadge(userId: string, badgeType: string): Promise<boolean> {
    const badgeDef = BADGE_DEFINITIONS[badgeType];
    if (!badgeDef) return false;

    try {
      const existing = await prisma.badge.findFirst({
        where: { user_id: userId, badge_type: badgeType },
      });
      if (existing) return false;

      await prisma.badge.create({
        data: {
          user_id: userId,
          badge_type: badgeType,
          title: badgeDef.title,
          description: badgeDef.description,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async getStudentProgress(userId: string): Promise<StudentLearningProgress> {
    let progress = await prisma.learningProgress.findUnique({
      where: { user_id: userId },
    });

    if (!progress) {
      progress = await prisma.learningProgress.create({
        data: {
          user_id: userId,
          xp: 200,
          level: 1,
          streak_days: 3,
        },
      });
    }

    const badges = await prisma.badge.findMany({
      where: { user_id: userId },
      orderBy: { unlocked_at: 'desc' },
    });

    // Ensure initial beginner badge exists
    if (badges.length === 0) {
      await this.unlockBadge(userId, 'FUNDAMENTAL_EXPLORER');
      badges.push({
        id: 'b1',
        user_id: userId,
        badge_type: 'FUNDAMENTAL_EXPLORER',
        title: BADGE_DEFINITIONS.FUNDAMENTAL_EXPLORER.title,
        description: BADGE_DEFINITIONS.FUNDAMENTAL_EXPLORER.description,
        unlocked_at: new Date(),
      });
    }

    const xpToNextLevel = (progress.level * 250) - progress.xp;

    return {
      xp: progress.xp,
      level: progress.level,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      streakDays: progress.streak_days,
      completedLessons: progress.completed_lessons,
      completedAssignments: progress.completed_assignments,
      journalCount: progress.journal_count,
      badges: badges.map((b) => ({
        type: b.badge_type,
        title: b.title,
        description: b.description,
        unlockedAt: b.unlocked_at.toISOString(),
      })),
    };
  }
}

export const gamificationService = new GamificationService();
