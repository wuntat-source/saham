import { NormalizedStockData } from '../data/common-data-engine';
import {
  MacroCatalystAnalysisResult,
  EducationalSafetyStatus,
  MacroSensitivityScenario,
  CaseScenario,
} from '@/types/lens';

export class MacroCatalystLensEngine {
  /**
   * Evaluates macro sensitivities and upcoming catalytic events for the stock.
   */
  static analyze(data: NormalizedStockData): MacroCatalystAnalysisResult {
    const isBanking = data.sector === 'Financials';
    const isCommodity = data.sector === 'Energy' || data.sector === 'Basic Materials';
    const isConsumer = data.sector === 'Consumer Non-Cyclicals' || data.sector === 'Consumer Cyclicals';

    // 1. Identify Dominant Macro Variables
    const dominantMacroVariables = [
      {
        variable: 'Suku Bunga Acuan (BI-Rate)',
        direction: isBanking ? ('TAILWIND' as const) : ('HEADWIND' as const),
        importance: isBanking ? ('CRITICAL' as const) : ('HIGH' as const),
        note: isBanking
          ? `Suku bunga stabil di level ${data.biRatePct}% menjaga Net Interest Margin (NIM) perbankan tetap sehat.`
          : `Suku bunga tinggi dapat meningkatkan beban bunga pinjaman emiten non-finansial.`,
      },
      {
        variable: 'Nilai Tukar Rupiah (USD/IDR)',
        direction: isCommodity ? ('TAILWIND' as const) : isConsumer ? ('HEADWIND' as const) : ('NEUTRAL' as const),
        importance: isCommodity || isConsumer ? ('HIGH' as const) : ('MODERATE' as const),
        note: isCommodity
          ? `Pelemahan Rupiah ke Rp${data.usdIdr.toLocaleString()} memberikan keuntungan pendapatan berbasis Dolar AS.`
          : isConsumer
          ? `Kenaikan USD/IDR meningkatkan biaya bahan baku impor.`
          : `Sensitivitas valas terkendali dengan lindung nilai alami (*natural hedging*).`,
      },
      {
        variable: 'Pertumbuhan PDB Domestik & Inflasi',
        direction: 'TAILWIND' as const,
        importance: 'HIGH' as const,
        note: `Inflasi terkendali di ${data.inflationPct}% menopang daya beli masyarakat dan permintaan kredit/produk.`,
      },
    ];

    // 2. Sensitivity Scenarios
    const baseNetProfit = data.netIncome;
    const sensitivities: MacroSensitivityScenario[] = [
      {
        variable: 'Pertumbuhan Permintaan (+10% Revenue)',
        shockDescription: 'Skenario ekspansi ekonomi di atas ekspektasi konsensus',
        revenueImpactPct: 10.0,
        operatingProfitImpactPct: 14.5,
        netProfitImpactPct: 15.2,
        epsImpactPct: 15.2,
        impliedFairValue: Math.round(data.dcfFairValue * 1.15),
      },
      {
        variable: 'Penurunan Permintaan (-10% Revenue)',
        shockDescription: 'Skenario perlambatan konsumsi dan siklus sektoral',
        revenueImpactPct: -10.0,
        operatingProfitImpactPct: -15.0,
        netProfitImpactPct: -15.8,
        epsImpactPct: -15.8,
        impliedFairValue: Math.round(data.dcfFairValue * 0.85),
      },
      {
        variable: 'Ekspansi Margin Operasional (+200 bps)',
        shockDescription: 'Efisiensi biaya dan penurunan harga input/bahan baku',
        revenueImpactPct: 0.0,
        operatingProfitImpactPct: 12.0,
        netProfitImpactPct: 11.5,
        epsImpactPct: 11.5,
        impliedFairValue: Math.round(data.dcfFairValue * 1.12),
      },
      {
        variable: 'Kenaikan Suku Bunga BI (+100 bps)',
        shockDescription: 'Pengetatan likuiditas dan kenaikan cost of funds',
        revenueImpactPct: isBanking ? 3.5 : -1.5,
        operatingProfitImpactPct: isBanking ? 6.0 : -4.5,
        netProfitImpactPct: isBanking ? 5.5 : -5.0,
        epsImpactPct: isBanking ? 5.5 : -5.0,
        impliedFairValue: isBanking ? Math.round(data.dcfFairValue * 1.05) : Math.round(data.dcfFairValue * 0.94),
      },
    ];

    // 3. Catalysts (3-12 Months)
    const catalystsNext3To12Months = [
      {
        title: 'Rilis Kinerja Laporan Keuangan Tahunan (FY Audited)',
        timeframe: '1–3 Bulan',
        expectedImpact: 'HIGH' as const,
        type: 'EARNINGS',
      },
      {
        title: `Rapat Umum Pemegang Saham (RUPS) & Keputusan Dividen (${data.dividendYield}% Yield)`,
        timeframe: '2–4 Bulan',
        expectedImpact: 'HIGH' as const,
        type: 'DIVIDEND',
      },
      {
        title: 'Penyesuaian Kebijakan Suku Bunga Bank Indonesia & The Fed',
        timeframe: '3–6 Bulan',
        expectedImpact: 'MEDIUM' as const,
        type: 'MACRO',
      },
      {
        title: 'Rebalancing Indeks LQ45 / MSCI Global Standard',
        timeframe: '6–12 Bulan',
        expectedImpact: 'MEDIUM' as const,
        type: 'FLOW',
      },
    ];

    // Macro Score Calculation
    let macroScore = 70;
    if (data.marketRegime === 'BULLISH') macroScore += 15;
    else if (data.marketRegime === 'BEARISH') macroScore -= 20;

    if (data.sentimentScore > 70) macroScore += 10;
    macroScore = Math.min(95, Math.max(30, macroScore));

    const confidence = 85;

    let safetyStatus: EducationalSafetyStatus = 'WATCH';
    if (macroScore >= 80) safetyStatus = 'ATTRACTIVE SETUP';
    else if (macroScore >= 70) safetyStatus = 'POSITIVE BIAS';
    else if (macroScore < 50) safetyStatus = 'HIGH RISK';

    // Scenarios
    const baseFairValue = Math.round(data.dcfFairValue);
    const bullFairValue = Math.round(data.dcfFairValue * 1.18);
    const bearFairValue = Math.round(data.currentPrice * 0.84);

    const scenarios: CaseScenario[] = [
      {
        name: 'Bull Case',
        probabilityPct: 30,
        fairValue: bullFairValue,
        impliedUpsidePct: Number((((bullFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1)),
        description: 'Pertumbuhan PDB >5.2%, inflasi terkendali, dan arus dana asing (foreign inflow) mengalir deras ke BEI.',
      },
      {
        name: 'Base Case',
        probabilityPct: 50,
        fairValue: baseFairValue,
        impliedUpsidePct: Number((((baseFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1)),
        description: 'Rezim pasar stabil, kebijakan moneter akomodatif dengan pertumbuhan laba sektoral 8–12% YoY.',
      },
      {
        name: 'Bear Case',
        probabilityPct: 20,
        fairValue: bearFairValue,
        impliedUpsidePct: Number((((bearFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1)),
        description: 'Volatilitas global meningkat, depresiasi Rupiah menekan margin, dan perlambatan permintaan domestik.',
      },
    ];

    const thesis = `Analisis Top-Down Makro menunjukkan bahwa ${data.ticker} berada pada posisi sektor ${data.sector} yang ${isBanking || isCommodity ? 'diuntungkan' : 'resilien'} terhadap kondisi suku bunga acuan ${data.biRatePct}% dan inflasi ${data.inflationPct}%. Didukung kalender katalis dividen dan rilis laporan kinerja, saham ini memiliki katalis positif dalam rentang 3–12 bulan ke depan.`;

    const transparency = [
      {
        fact: `Rezim Pasar saat ini: ${data.marketRegime} dengan BI Rate ${data.biRatePct}% dan Kurs Rp${data.usdIdr.toLocaleString()}.`,
        calculation: `Uji sensitivitas laba bersih berkisar antara -15.8% (Bear) hingga +15.2% (Bull).`,
        interpretation: `Profil bisnis emiten memiliki ketahanan yang baik terhadap guncangan makro moderat.`,
        aiOpinion: `Mendukung alokasi taktis memanfaatkan momentum katalis dividen dan laporan keuangan.`,
      },
    ];

    const educationalGuide = {
      whatDoesThisMean: `Lensa Macro + Catalyst menguji bagaimana faktor 'luar' (suku bunga, kurs dolar, inflasi, perang dagang) serta 'peristiwa pemicu' (katalis dividen, rilis laba) memengaruhi harga saham.`,
      whatShouldILearn: `Pelajari hubungan suku bunga BI dengan sektor perbankan vs properti, dan bagaimana mengantisipasi rilis laporan keuangan tanpa terjebak rumor (*Buy on Rumor, Sell on News*).`,
    };

    return {
      ticker: data.ticker,
      companyName: data.companyName,
      currentPrice: data.currentPrice,
      score: macroScore,
      confidence,
      safetyStatus,
      dataQuality: data.dataQuality,
      dominantMacroVariables,
      sensitivities,
      scenarios,
      catalystsNext3To12Months,
      thesis,
      transparency,
      educationalGuide,
    };
  }
}
