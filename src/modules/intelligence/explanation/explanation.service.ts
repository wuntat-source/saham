import { ExplainScoreResponse, StockIntelligenceOverview } from '@/types/intelligence';

export class ExplanationService {
  /**
   * Generates transparent, deterministic, evidence-based AI explanations
   * adhering to DATA -> CALCULATION -> INTERPRETATION pipeline.
   */
  public explain(overview: StockIntelligenceOverview, pillar: string): ExplainScoreResponse {
    const { ticker, scores, overallScore, confidenceScore } = overview;

    let targetScore = overallScore;
    let targetConfidence = confidenceScore;
    let evidence: string[] = [];
    let calculation = '';
    let interpretation = '';
    let riskFactors: string[] = [];

    switch (pillar) {
      case 'fundamental': {
        const f = scores.fundamental;
        targetScore = f.score;
        targetConfidence = f.confidence;
        evidence = [
          `Laba Bersih (Net Profit): ${f.metrics.netProfit ? 'Rp' + (f.metrics.netProfit / 1e12).toFixed(2) + ' Triliun' : 'N/A'}`,
          `Pertumbuhan Pendapatan (YoY): ${f.metrics.revenueGrowth !== null ? f.metrics.revenueGrowth + '%' : 'N/A'}`,
          `Return on Equity (ROE): ${f.metrics.roe !== null ? f.metrics.roe + '%' : 'N/A'}`,
          `Net Profit Margin: ${f.metrics.netMargin !== null ? f.metrics.netMargin + '%' : 'N/A'}`,
          `Debt to Equity (DER): ${f.metrics.debtToEquity !== null ? f.metrics.debtToEquity + 'x' : 'N/A'}`,
          `Arus Kas Operasional (OCF): ${f.metrics.operatingCashFlow ? 'Rp' + (f.metrics.operatingCashFlow / 1e12).toFixed(2) + ' Triliun' : 'N/A'}`,
        ];
        calculation = `Skor dihitung dari agregasi bobot Profitabilitas (25%), Pertumbuhan (20%), Solvabilitas/Leverage (15%), Kualitas Arus Kas (15%), ROE (15%), dan Kualitas Laba (10%).`;
        interpretation = `Kinerja fundamental saham ${ticker} dinilai ${f.score >= 70 ? 'sangat prima dan stabil' : f.score >= 50 ? 'moderat' : 'memerlukan perhatian khusus'}, dengan ROE ${f.metrics.roe ?? 'N/A'}% dan margin laba bersih ${f.metrics.netMargin ?? 'N/A'}%.`;
        riskFactors = [
          f.metrics.debtToEquity && f.metrics.debtToEquity > 2.0 ? 'Leverage hutang berada di atas batas kenyamanan industri' : 'Sensitivitas terhadap siklus ekonomi makro',
          f.missingFields.length > 0 ? `Terdapat ${f.missingFields.length} metrik yang belum terisi penuh pada laporan periode ini` : 'Potensi volatilitas harga bahan baku atau beban operasional',
        ];
        break;
      }

      case 'technical': {
        const t = scores.technical;
        targetScore = t.score;
        targetConfidence = t.confidence;
        const ind = t.indicators;
        evidence = [
          `Harga Saat Ini: Rp${ind.price.toLocaleString('id-ID')}`,
          `Moving Averages: SMA20 (Rp${ind.sma20?.toLocaleString('id-ID') ?? 'N/A'}), SMA50 (Rp${ind.sma50?.toLocaleString('id-ID') ?? 'N/A'}), SMA200 (Rp${ind.sma200?.toLocaleString('id-ID') ?? 'N/A'})`,
          `RSI (14-period): ${ind.rsi ?? 'N/A'}`,
          `MACD: Line ${ind.macd.line ?? 'N/A'}, Signal ${ind.macd.signal ?? 'N/A'}, Histogram ${ind.macd.histogram ?? 'N/A'}`,
          `Bollinger Bands: Upper Rp${ind.bollingerBands.upper?.toLocaleString('id-ID') ?? 'N/A'}, Lower Rp${ind.bollingerBands.lower?.toLocaleString('id-ID') ?? 'N/A'}`,
          `Sinyal Tren: ${t.signal}`,
        ];
        calculation = `Skor teknikal mengombinasikan Alignment Tren (40%), Indikator Momentum RSI/MACD (30%), Volatilitas Bollinger/ADX (15%), dan Konfirmasi Volume OBV (15%).`;
        interpretation = `Struktur teknikal saat ini menunjukkan fase ${t.signal}. Momentum harga ${ind.rsi && ind.rsi > 70 ? 'mendekati area jenuh beli (overbought)' : ind.rsi && ind.rsi < 30 ? 'berada di area jenuh jual (oversold)' : 'bergerak dalam rentang sehat'}.`;
        riskFactors = [
          ind.rsi && ind.rsi > 75 ? 'RSI tinggi mengindikasikan potensi koreksi teknikal jangka pendek' : 'Potensi false breakout jika volume perdagangan menyusut',
          'Risiko volatilitas pasar menyeluruh yang memengaruhi support harga',
        ];
        break;
      }

      case 'valuation': {
        const v = scores.valuation;
        targetScore = v.score;
        targetConfidence = v.confidence;
        evidence = [
          `Price to Earnings (P/E): ${v.metrics.pe !== null ? v.metrics.pe + 'x' : 'N/A'} (Rata-rata Sektor: ${v.metrics.sectorAvgPe}x)`,
          `Price to Book Value (PBV): ${v.metrics.pbv !== null ? v.metrics.pbv + 'x' : 'N/A'} (Rata-rata Sektor: ${v.metrics.sectorAvgPbv}x)`,
          `Dividend Yield: ${v.metrics.dividendYield !== null ? v.metrics.dividendYield + '%' : 'N/A'}`,
          `Free Cash Flow Yield: ${v.metrics.fcfYield !== null ? v.metrics.fcfYield + '%' : 'N/A'}`,
          `Status Valuasi: ${v.status}`,
        ];
        calculation = `Evaluasi komparatif rasio P/E (35%), PBV (25%), Dividend Yield (20%), dan FCF Yield (20%) terhadap benchmark sektor.`;
        interpretation = `Saham ${ticker} dinilai berstatus ${v.status}. Valuasi P/E ${v.metrics.pe ?? 'N/A'}x memberikan gambaran pricing relatif terhadap laba historis dan proyeksi pertumbuhan emiten.`;
        riskFactors = [
          v.status === 'OVERVALUED' ? 'Valuasi premium menuntut realisasi pertumbuhan laba yang sangat tinggi' : 'Value trap risk jika penurunan valuasi disebabkan oleh penurunan fundamental permanen',
        ];
        break;
      }

      case 'smartMoney': {
        const sm = scores.smartMoney;
        targetScore = sm.score;
        targetConfidence = sm.confidence;
        evidence = [
          `Status Aliran Dana: ${sm.status}`,
          `Foreign Net Flow (1 Hari): ${sm.metrics.foreignNetFlow1D ? 'Rp' + (sm.metrics.foreignNetFlow1D / 1e9).toFixed(2) + ' Miliar' : 'N/A'}`,
          `Foreign Net Flow (5 Hari): ${sm.metrics.foreignNetFlow5D ? 'Rp' + (sm.metrics.foreignNetFlow5D / 1e9).toFixed(2) + ' Miliar' : 'N/A'}`,
          `Foreign Net Flow (20 Hari): ${sm.metrics.foreignNetFlow20D ? 'Rp' + (sm.metrics.foreignNetFlow20D / 1e9).toFixed(2) + ' Miliar' : 'N/A'}`,
          `Konsentrasi Broker Teratas: ${sm.metrics.topBrokerConcentration ? sm.metrics.topBrokerConcentration + '%' : 'N/A'}`,
        ];
        calculation = `Menganalisis tren net inflow/outflow multi-periode asing dan konsentrasi volume transaksi institusi tanpa fabrikasi.`;
        interpretation = `Dinamika aliran modal pasar institusi menunjukkan status ${sm.status}. ${sm.summary}`;
        riskFactors = [
          'Arus modal asing dapat berbalik arah dengan cepat merespons sentimen global',
          'Likuiditas pasar sekunder yang fluktuatif',
        ];
        break;
      }

      case 'sentiment': {
        const s = scores.sentiment;
        targetScore = s.score;
        targetConfidence = s.confidence;
        evidence = [
          `Label Sentimen: ${s.sentimentLabel}`,
          `Jumlah Berita Dianalisis: ${s.articles.length} artikel terverifikasi`,
          ...s.articles.slice(0, 3).map((a) => `[${a.source}] ${a.headline} (${a.sentiment.toUpperCase()})`),
        ];
        calculation = `Agregasi terbobot dari skor polaritas artikel media resmi terpercaya dan pengumuman keterbukaan informasi.`;
        interpretation = `Sentimen pasar terkini terhadap ${ticker} berada pada kondisi ${s.sentimentLabel}. Pemberitaan mencerminkan persepsi optimisme maupun tantangan operasional.`;
        riskFactors = [
          'Pemberitaan eksternal dan rumor pasar yang berpotensi memicu volatilitas harga sesaat',
        ];
        break;
      }

      case 'risk': {
        const r = scores.risk;
        targetScore = r.score;
        targetConfidence = r.confidence;
        evidence = [
          `Tingkat Risiko (Risk Level): ${r.riskLevel}`,
          `Volatilitas Historis (30 Hari): ${r.metrics.volatility30D}%`,
          `Maksimum Drawdown (1 Tahun): -${r.metrics.maxDrawdown1Y}%`,
          `Omset Transaksi Harian Rata-rata: Rp${(r.metrics.liquidityDailyTurnover / 1e9).toFixed(1)} Miliar`,
          `Beta terhadap IHSG: ${r.metrics.beta ?? 1.0}`,
        ];
        calculation = `Perhitungan matematis berbasis Volatilitas Historis (30%), Ketahanan Drawdown (25%), Likuiditas Transaksi (25%), dan Rasio Solvabilitas (20%). Skor tinggi menandakan aset lebih aman.`;
        interpretation = `Saham ${ticker} memiliki profil risiko ${r.riskLevel}. Karakteristik volatilitas dan likuiditas perdagangan mendukung kestabilan transaksi virtual.`;
        riskFactors = [
          `Potensi koreksi maksimum historis hingga ${r.metrics.maxDrawdown1Y}%`,
          'Perubahan regulasi sektor atau suku bunga acuan Bank Indonesia',
        ];
        break;
      }

      default: {
        // Overall score explanation
        evidence = [
          `AI Composite Score: ${overallScore}/100`,
          `Confidence Score: ${confidenceScore}%`,
          `Data Quality Score: ${overview.dataQualityScore}%`,
          `Pilar Terkuat: ${overview.strongestPillar}`,
          `Pilar Terlemah: ${overview.weakestPillar}`,
          `Katalis Utama: ${overview.catalyst}`,
          `Risiko Utama: ${overview.mainRisk}`,
        ];
        calculation = `Skor AI EduTradeX dihitung menggunakan rumus tertimbang deterministik: Fundamental 20% + Teknikal 20% + Valuasi 15% + Risk 15% + Smart Money 10% + Sentimen 10% + Data Quality 5% + Market Regime 5% = 100%.`;
        interpretation = `Saham ${ticker} (${overview.companyName}) memperoleh total skor AI ${overallScore}/100 dengan tingkat kepercayaan ${confidenceScore}%. Profil saham didorong oleh ${overview.strongestPillar}, namun perlu mempertimbangkan ${overview.weakestPillar}.`;
        riskFactors = [
          overview.mainRisk || 'Risiko volatilitas pasar modal Indonesia',
          'Pastikan diversifikasi portofolio dan manajemen alokasi lot yang disiplin',
        ];
      }
    }

    return {
      ticker,
      pillar,
      score: targetScore,
      confidence: targetConfidence,
      evidence,
      calculation,
      interpretation,
      riskFactors,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const explanationService = new ExplanationService();
