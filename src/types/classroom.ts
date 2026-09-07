export type StudentLearningSegment =
  | 'ANALYST'
  | 'TRADER'
  | 'RISK_TAKER'
  | 'CONSERVATIVE'
  | 'OVERTRADER'
  | 'BEGINNER'
  | 'CONSISTENT_LEARNER';

export interface StudentSegmentProfile {
  segment: StudentLearningSegment;
  label: string;
  badgeColor: string;
  description: string;
  pedagogicalAdvice: string;
}

export interface CommonMistakeItem {
  id: string;
  title: string;
  description: string;
  affectedStudentCount: number;
  affectedPercentage: number; // e.g. 32%
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  remediation: string;
}

export interface ClassroomAnalyticsSummary {
  classId: string;
  className: string;
  invitationCode: string;
  studentCount: number;
  avgLearningScore: number;
  avgAnalysisScore: number;
  avgRiskScore: number;
  avgRoi: number;
  avgDrawdown: number;
  journalComplianceRate: number; // %
  assignmentCompletionRate: number; // %
  skillDistribution: {
    fundamental: number;
    technical: number;
    valuation: number;
    smartMoney: number;
    riskManagement: number;
    sentiment: number;
    discipline: number;
    portfolio: number;
    quantitative: number;
  };
  segmentDistribution: Record<StudentLearningSegment, number>;
  commonMistakes: CommonMistakeItem[];
  studentsAtRisk: Array<{
    studentId: string;
    studentName: string;
    reason: string;
    severity: 'CAUTION' | 'WARNING';
  }>;
}

export interface StudentAnalyticsDetail {
  studentId: string;
  studentName: string;
  email: string;
  segment: StudentSegmentProfile;
  learningScore: number;
  skills: {
    fundamental: number;
    technical: number;
    valuation: number;
    smartMoney: number;
    riskManagement: number;
    sentiment: number;
    discipline: number;
    portfolio: number;
    quantitative: number;
  };
  wallet: {
    cashBalance: number;
    totalEquity: number;
    roi: number;
  };
  riskMetrics: {
    stopLossCompliancePct: number;
    maxDrawdown: number;
    tradesCount: number;
  };
  journalMetrics: {
    written: number;
    reviewed: number;
    complianceRate: number;
  };
  assignments: Array<{
    assignmentId: string;
    title: string;
    submitted: boolean;
    grade?: number | null;
    aiScore?: number | null;
    submittedAt?: string;
  }>;
  aiFeedback: {
    strengths: string[];
    weaknesses: string[];
    teacherIntervention: string;
  };
}

export interface CategoryLeaderboard {
  category:
    | 'OVERALL_CHAMPION'
    | 'BEST_ANALYST'
    | 'BEST_RISK_MANAGER'
    | 'BEST_LEARNER'
    | 'MOST_CONSISTENT'
    | 'BEST_RESEARCHER';
  label: string;
  description: string;
  rankings: Array<{
    rank: number;
    studentId: string;
    studentName: string;
    score: number;
    metricLabel: string;
    segmentLabel?: string;
  }>;
}

export interface AIAssignmentEvaluation {
  score: number; // 0-100
  researchQuality: number; // 0-100
  evidenceQuality: number; // 0-100
  reasoningScore: number; // 0-100
  riskAwareness: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  improvement: string;
}

export interface LearningStage {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  xpRequired: number;
  unlocked: boolean;
  completed: boolean;
  modules: Array<{
    id: string;
    title: string;
    duration: string;
    completed: boolean;
  }>;
}

export interface CertificateItem {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  category: string;
  grade: 'DISTINCTION' | 'MERIT' | 'PASS';
  credentialCode: string;
  issuedAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}

export interface AIGovernanceTelemetry {
  totalCalls: number;
  totalTokens: number;
  avgLatencyMs: number;
  activePromptVersion: string;
  activeModelVersion: string;
  engineBreakdown: Record<string, number>;
}

export interface StudentLeaderboardRow {
  rank: number;
  student_id: string;
  student_name: string;
  email: string;
  cash_balance: number;
  portfolio_value: number;
  total_equity: number;
  initial_balance: number;
  roi_percent: number;
  realized_pnl: number;
  holdings_count: number;
}
