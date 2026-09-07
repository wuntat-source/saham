import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIAssignmentEvaluator } from '@/modules/classroom/assignments/ai-evaluator.service';
import { AuditService } from '@/modules/classroom/governance/audit.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await req.json();
    const { submissionId, studentSubmission, assignmentPrompt } = body;

    let submissionText = studentSubmission;
    let rubricPrompt = assignmentPrompt;
    let targetSubmissionId = submissionId;

    if (submissionId && (!submissionText || !rubricPrompt)) {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: { assignment: true },
      });
      if (submission) {
        submissionText = submissionText || submission.content;
        rubricPrompt = rubricPrompt || submission.assignment.description || submission.assignment.title;
      }
    }

    if (!submissionText) {
      return NextResponse.json({ error: 'Submission content is required for AI evaluation' }, { status: 400 });
    }

    const evaluation = AIAssignmentEvaluator.evaluateSubmission({
      assignmentPrompt: rubricPrompt || 'Analyze stock fundamentals, valuation, and risks.',
      submissionContent: submissionText,
    });

    // If submission exists in DB, update with AI scores
    if (targetSubmissionId) {
      await prisma.assignmentSubmission.update({
        where: { id: targetSubmissionId },
        data: {
          ai_score: evaluation.score,
          ai_evaluation_json: JSON.stringify(evaluation),
          research_quality: evaluation.researchQuality,
          evidence_quality: evaluation.evidenceQuality,
          reasoning_score: evaluation.reasoningScore,
          risk_awareness: evaluation.riskAwareness,
          grade: evaluation.score,
          feedback: evaluation.improvement,
        },
      });
    }

    const latencyMs = Date.now() - startTime;
    await AuditService.logAIOperation({
      userId: user.userId,
      engineType: 'ASSIGNMENT_EVAL',
      promptVersion: 'v2.1',
      modelVersion: 'gemini-2.5-flash',
      inputTokens: Math.round(submissionText.length / 4),
      outputTokens: 250,
      latencyMs,
    });

    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    console.error('Error evaluating assignment submission:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
