export interface TradingJournalItem {
  id: string;
  userId: string;
  transactionId?: string | null;
  ticker: string;
  thesis: string;
  entryReason?: string | null;
  riskReason?: string | null;
  target?: number | null;
  stopLoss?: number | null;
  marketRegime?: string | null;
  createdAt: string;
  review?: TradeReviewItem | null;
}

export interface TradeReviewItem {
  id: string;
  journalId: string;
  userId: string;
  decisionQuality: number; // 0-100
  entryQuality: number; // 0-100
  riskManagement: number; // 0-100
  timing: number; // 0-100
  thesisQuality: number; // 0-100
  outcomeScore: number; // 0-100
  whatWell: string;
  whatImprove: string;
  whatHappened: string;
  keyLesson: string;
  createdAt: string;
}

export interface StudentSkillsMatrix {
  fundamentalScore: number; // 0-100
  technicalScore: number; // 0-100
  valuationScore: number; // 0-100
  riskManagementScore: number; // 0-100
  portfolioScore: number; // 0-100
  psychologyScore: number; // 0-100
  literacyScore: number; // 0-100
  researchScore: number; // 0-100
  decisionScore: number; // 0-100
  learningScore: number; // 0-100 (weighted multi-factor)
  updatedAt: string;
}

export interface StudentLearningProgress {
  xp: number;
  level: number;
  xpToNextLevel: number;
  streakDays: number;
  completedLessons: number;
  completedAssignments: number;
  journalCount: number;
  badges: Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: string;
  }>;
}

export type ObservableBehavior =
  | 'OVERTRADING'
  | 'CONCENTRATION'
  | 'EXCESSIVE_RISK'
  | 'REVENGE_TRADING'
  | 'LACK_OF_THESIS'
  | 'POOR_DIVERSIFICATION'
  | 'GOOD_RISK_DISCIPLINE'
  | 'CONSISTENT_PROCESS';

export interface BehaviorPatternItem {
  type: ObservableBehavior;
  name: string;
  status: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
  description: string;
  recommendation: string;
  frequency: number;
}

export interface StudentWeeklyReport {
  studentName: string;
  reportPeriod: string;
  overallLearningScore: number; // 0-100
  weeklySummaryProse?: string;
  strengths: string[];
  weaknesses: string[];
  tradingBehaviors: BehaviorPatternItem[];
  learningProgressSummary: {
    tradesExecuted: number;
    journalsWritten: number;
    journalCompletionRatePct: number;
    completedAssignments: number;
    xpEarnedThisWeek: number;
  };
  recommendedTopic: string;
  recommendedExercise: string;
  generatedAt: string;
}

export interface AssignmentItem {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  deadline: string;
  stockUniverse: string;
  requiredOutput: string;
  createdAt: string;
  submissionCount?: number;
  mySubmission?: {
    id: string;
    content: string;
    grade?: number | null;
    feedback?: string | null;
    submittedAt: string;
  } | null;
}

export interface ChallengeItem {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  type: 'PORTFOLIO' | 'FUNDAMENTAL' | 'TECHNICAL' | 'RISK' | 'RESEARCH';
  description: string;
  startDate: string;
  endDate: string;
  rewardXp: number;
}

export interface MentorChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
