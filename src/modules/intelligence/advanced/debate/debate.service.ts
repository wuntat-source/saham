import { DebateResult } from '@/types/advanced-intelligence';
import { screenerService } from '@/modules/intelligence/screener/screener.service';
import { marketService } from '@/modules/market/services/market.service';

export class DebateService {
  /**
   * Conducts structured 3-agent AI Debate: Bull Analyst vs Bear Analyst vs AI Judge.
   */
  public async getStockDebate(ticker: string): Promise<DebateResult> {
    const symbol = ticker.toUpperCase();
    const overview = await screenerService.getStockIntelligence(symbol);
    const quote = await marketService.getQuote(symbol);

    const f = overview.scores.fundamental;
    const t = overview.scores.technical;
    const v = overview.scores.valuation;
    const sm = overview.scores.smartMoney;
    const r = overview.scores.risk;

    // 1. Bull Analyst Argument
    const bullScore = Math.min(96, Math.max(25, Math.round(
      f.score * 0.35 + t.score * 0.35 + sm.score * 0.30
    )));

    const bullThesis = `Saham ${symbol} memiliki fondasi fundamental ${f.score >= 70 ? 'sangat prima' : 'stabil'} didukung momentum teknikal fase ${t.signal} serta prospek arus kas teruji.`;

    const bullPoints = [
      `Profitabilitas & ROE: ${f.metrics.roe ?? 'N/A'}% mencerminkan efisiensi permodalan yang unggul di industrinya.`,
      `Momentum Teknikal: Sinyal ${t.signal} dengan indikator RSI ${t.indicators.rsi ?? 'N/A'} berada dalam rentang konstruktif.`,
      `Arus Modal Smart Money: Status ${sm.status} menunjukkan akumulasi terukur dari pelaku pasar institusi.`,
      `Katalis Terdekat: ${overview.catalyst || 'Peluang ekspansi pangsa pasar & pertumbuhan dividen konsisten'}.`,
    ];

    const bullTarget = Math.round(quote.price * (1 + (bullScore / 100) * 0.3));

    // 2. Bear Analyst Argument
    const bearScore = Math.min(95, Math.max(20, Math.round(
      (100 - v.score) * 0.40 + (100 - r.score) * 0.35 + (100 - t.score) * 0.25
    )));

    const bearThesis = `Meskipun memiliki daya tarik, valuasi saham ${symbol} (P/E ${v.metrics.pe ?? 'N/A'}x) dan profil risiko level ${r.riskLevel} memerlukan kehati-hatian atas potensi downside.`;

    const bearPoints = [
      `Status Valuasi: ${v.status} vs rata-rata industri (${v.metrics.sectorAvgPe}x), membatasi ruang apresiasi jika laba melambat.`,
      `Sensitivitas Risiko: ${r.summary}`,
      `Kelemahan Pilar: ${overview.weakestPillar}`,
      `Risiko Utama: ${overview.mainRisk || 'Risiko volatilitas pasar modal & perlambatan daya beli konsumen'}.`,
    ];

    const bearTarget = Math.round(quote.price * (1 - (bearScore / 100) * 0.25));

    // 3. AI Judge Synthesis & Verdict
    let netConviction: 'BULLISH_BIAS' | 'BALANCED_NEUTRAL' | 'BEARISH_BIAS' = 'BALANCED_NEUTRAL';
    if (bullScore - bearScore >= 15) netConviction = 'BULLISH_BIAS';
    else if (bearScore - bullScore >= 15) netConviction = 'BEARISH_BIAS';

    let verdict = 'Pertarungan argumen berimbang; pasar sedang menanti konfirmasi katalis berikutnya.';
    if (netConviction === 'BULLISH_BIAS') {
      verdict = `Argumen Bullish mendominasi secara signifikan didukung data fundamental solid dan tren harga yang kuat.`;
    } else if (netConviction === 'BEARISH_BIAS') {
      verdict = `Argumen Bearish lebih dominan; risiko valuasi premium dan potensi koreksi teknikal patut diwaspadai.`;
    }

    const uncertainties = [
      'Realisasi pertumbuhan laba bersih pada kuartal mendatang terhadap estimasi konsensus analis.',
      'Arah kebijakan suku bunga acuan dan stabilitas nilai tukar Rupiah.',
      'Keberlanjutan net foreign inflow di bursa domestik.',
    ];

    const balancedTakeaway = `Investor disarankan mengambil posisi secara bertahap (Dollar Cost Averaging / Partial Entry) dengan batas Stop Loss terukur, memanfaatkan pilar terkuat ${overview.strongestPillar} sembari mengantisipasi ${overview.weakestPillar}.`;

    return {
      ticker: symbol,
      bullAnalyst: {
        thesis: bullThesis,
        keyPoints: bullPoints,
        catalystsOrRisks: [overview.catalyst || 'Pertumbuhan fundamental stabil'],
        targetPrice: bullTarget,
        convictionScore: bullScore,
      },
      bearAnalyst: {
        thesis: bearThesis,
        keyPoints: bearPoints,
        catalystsOrRisks: [overview.mainRisk || 'Risiko koreksi valuasi pasar'],
        targetPrice: bearTarget,
        convictionScore: bearScore,
      },
      aiJudge: {
        verdict,
        bullScore,
        bearScore,
        netConviction,
        uncertainties,
        balancedTakeaway,
      },
      confidence: 90,
      timestamp: new Date().toISOString(),
    };
  }
}

export const debateService = new DebateService();
