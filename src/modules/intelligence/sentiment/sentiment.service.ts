import { SentimentArticleItem, SentimentScoreResult } from '@/types/intelligence';

export class SentimentService {
  /**
   * Aggregates news articles and sentiment data into a deterministic score (0-100).
   * Retains sources and timestamps for all referenced articles.
   */
  public evaluate(articles: SentimentArticleItem[]): SentimentScoreResult {
    if (!articles || articles.length === 0) {
      return {
        score: 50,
        confidence: 40,
        sentimentLabel: 'NEUTRAL',
        articles: [],
        summary: 'Belum ada liputan berita atau rilis media terkini yang signifikan.',
      };
    }

    const totalWeight = articles.length;
    const avgScore = Math.round(articles.reduce((acc, a) => acc + a.score, 0) / totalWeight);
    const score = Math.max(0, Math.min(100, avgScore));

    // Confidence scales with article count and recency
    const confidence = Math.min(95, Math.max(50, 50 + articles.length * 10));

    let sentimentLabel: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'NEUTRAL';
    if (score >= 68) sentimentLabel = 'BULLISH';
    else if (score <= 42) sentimentLabel = 'BEARISH';

    let summary = 'Sentimen publik dan media massa berada di zona netral berimbang.';
    if (sentimentLabel === 'BULLISH') {
      summary = `Pemberitaan media condong sangat positif didukung rilis kinerja dan sentimen sektor yang optimis.`;
    } else if (sentimentLabel === 'BEARISH') {
      summary = `Terdapat sentimen kehati-hatian atau pemberitaan negatif terkait dinamika industri terkini.`;
    }

    return {
      score,
      confidence,
      sentimentLabel,
      articles,
      summary,
    };
  }
}

export const sentimentService = new SentimentService();
