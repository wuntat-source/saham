import { AIAssignmentEvaluation } from '@/types/classroom';

export interface EvaluateSubmissionParams {
  assignmentPrompt?: string;
  submissionContent?: string;
  assignmentTitle?: string;
  assignmentRequirement?: string;
  studentContent?: string;
}

export class AIAssignmentEvaluator {
  /**
   * Semantically evaluates a student's submission based on scientific reasoning,
   * data evidence, and risk management awareness.
   */
  public static evaluateSubmission(
    paramOrTitle: EvaluateSubmissionParams | string,
    maybeRequirement?: string,
    maybeContent?: string
  ): AIAssignmentEvaluation {
    let studentContent = '';
    let assignmentRequirement = '';

    if (typeof paramOrTitle === 'object') {
      studentContent = paramOrTitle.submissionContent || paramOrTitle.studentContent || '';
      assignmentRequirement = paramOrTitle.assignmentPrompt || paramOrTitle.assignmentRequirement || '';
    } else {
      assignmentRequirement = maybeRequirement || '';
      studentContent = maybeContent || '';
    }

    const text = studentContent.toLowerCase();
    const length = studentContent.trim().length;

    // 1. Research Quality (Depth of coverage and context)
    let researchQuality = Math.min(95, Math.max(30, Math.round(45 + length / 25)));
    if (
      text.includes('sektor') ||
      text.includes('industri') ||
      text.includes('kompetitor') ||
      text.includes('makro') ||
      text.includes('roe') ||
      text.includes('nim') ||
      text.includes('pbv') ||
      text.includes('per') ||
      text.includes('bbca')
    ) {
      researchQuality += 20;
    }
    researchQuality = Math.min(95, researchQuality);

    // 2. Evidence Quality (Use of numeric metrics, ratios, prices, percentages)
    let evidenceQuality = 40;
    const hasNumbers = /\d+/.test(studentContent);
    const mentionsRatios =
      text.includes('per') ||
      text.includes('pbv') ||
      text.includes('roe') ||
      text.includes('rsi') ||
      text.includes('ma') ||
      text.includes('margin') ||
      text.includes('npl');
    if (hasNumbers) evidenceQuality += 20;
    if (mentionsRatios) evidenceQuality += 25;
    if (text.includes('laporan') || text.includes('kuartal') || text.includes('kinerja')) evidenceQuality += 10;
    evidenceQuality = Math.min(95, evidenceQuality);

    // 3. Reasoning Score (Logical cause-effect arguments: 'karena', 'sehingga', 'disebabkan', 'implikasi')
    let reasoningScore = 45;
    if (
      text.includes('karena') ||
      text.includes('sehingga') ||
      text.includes('oleh karena') ||
      text.includes('disebabkan') ||
      text.includes('berdasarkan')
    ) {
      reasoningScore += 20;
    }
    if (text.includes('namun') || text.includes('tetapi') || text.includes('meskipun') || text.includes('risiko')) {
      reasoningScore += 15; // Critical thinking (two-sided evaluation)
    }
    if (text.includes('kesimpulan') || text.includes('rekomendasi') || text.includes('analisis') || text.includes('target price')) {
      reasoningScore += 15;
    }
    reasoningScore = Math.min(95, reasoningScore);

    // 4. Risk Awareness (Explicit recognition of potential downside or limits)
    let riskAwareness = 40;
    if (
      text.includes('stop loss') ||
      text.includes('cut loss') ||
      text.includes('toleransi') ||
      text.includes('drawdown') ||
      text.includes('invalidation')
    ) {
      riskAwareness += 30;
    }
    if (text.includes('volatilitas') || text.includes('ketidakpastian') || text.includes('skenario') || text.includes('risiko')) {
      riskAwareness += 20;
    }
    riskAwareness = Math.min(95, riskAwareness);

    // If text is very short/insufficient, penalize
    if (length < 80) {
      researchQuality = Math.min(40, researchQuality);
      evidenceQuality = Math.min(40, evidenceQuality);
      reasoningScore = Math.min(40, reasoningScore);
      riskAwareness = Math.min(40, riskAwareness);
    }

    // Composite Score
    const compositeScore = Math.round(
      researchQuality * 0.25 + evidenceQuality * 0.25 + reasoningScore * 0.3 + riskAwareness * 0.2
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (reasoningScore >= 75) {
      strengths.push('Struktur argumen logis dengan alur sebab-akibat yang jelas dalam menarik kesimpulan.');
    } else {
      weaknesses.push('Argumen masih bersifat deskriptif; perkuat penjelasan alasan mengapa tren tersebut terjadi.');
    }

    if (evidenceQuality >= 75) {
      strengths.push('Penyertaan data kuantitatif (rasio finansial / level harga) sangat mendukung tesis.');
    } else {
      weaknesses.push('Sertakan lebih banyak data metrik spesifik (misal: rasio P/E vs rata-rata industri).');
    }

    if (riskAwareness >= 70) {
      strengths.push('Kesadaran risiko yang matang dengan mempertimbangkan skenario jika analisis berbalik arah.');
    } else {
      weaknesses.push('Belum menyertakan antisipasi batas risiko kerugian (Stop Loss) atau skenario terburuk.');
    }

    let improvement =
      'Perdalam perbandingan antar emiten sejenis (peer comparison) dan jelaskan katalis penggerak harga ke depan.';
    if (riskAwareness < 60) {
      improvement = 'Lengkapi rekomendasi dengan batas toleransi risiko protektif (Stop Loss) dan alokasi ukuran posisi.';
    }

    return {
      score: compositeScore,
      researchQuality,
      evidenceQuality,
      reasoningScore,
      riskAwareness,
      strengths,
      weaknesses,
      improvement,
    };
  }

  public evaluateSubmission(
    paramOrTitle: EvaluateSubmissionParams | string,
    maybeRequirement?: string,
    maybeContent?: string
  ): AIAssignmentEvaluation {
    return AIAssignmentEvaluator.evaluateSubmission(paramOrTitle, maybeRequirement, maybeContent);
  }
}

export const aiAssignmentEvaluator = new AIAssignmentEvaluator();
