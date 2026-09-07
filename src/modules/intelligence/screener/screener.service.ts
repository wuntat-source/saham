import { prisma } from '@/lib/prisma';
import { STOCKS } from '@/lib/constants';
import { fundamentalService } from '../fundamental/fundamental.service';
import { technicalService } from '../technical/technical.service';
import { valuationService } from '../valuation/valuation.service';
import { smartMoneyService } from '../smart-money/smart-money.service';
import { sentimentService } from '../sentiment/sentiment.service';
import { riskService } from '../risk/risk.service';
import { scoringService } from '../scoring/scoring.service';
import { explanationService } from '../explanation/explanation.service';
import { marketService } from '@/modules/market/services/market.service';
import {
  ScreenerFilterParams,
  ScreenerItem,
  StockIntelligenceOverview,
  ExplainScoreResponse,
  OHLCV,
} from '@/types/intelligence';

// Comprehensive baseline metrics database for 24 IDX Stocks
const STOCK_INTELLIGENCE_SEEDS: Record<string, {
  fundamental: any;
  valuation: any;
  smartMoney: any;
  sentiment: any[];
  risk: any;
}> = {
  BBCA: {
    fundamental: { revenue: 104_000_000_000_000, revenueGrowth: 11.2, netProfit: 54_800_000_000_000, eps: 445, epsGrowth: 12.8, roe: 23.4, roa: 3.8, roic: 21.0, debt: 0, cash: 120_000_000_000_000, operatingCashFlow: 62_000_000_000_000, freeCashFlow: 58_000_000_000_000, debtToEquity: 0.12, netMargin: 52.7 },
    valuation: { pe: 22.4, forwardPe: 20.1, pbv: 4.8, evEbitda: 18.2, psr: 11.5, peg: 1.75, dividendYield: 2.8, fcfYield: 4.6, sectorAvgPe: 13.5, sectorAvgPbv: 1.8 },
    smartMoney: { foreignNetFlow1D: 120_000_000_000, foreignNetFlow5D: 450_000_000_000, foreignNetFlow20D: 1_200_000_000_000, topBrokerConcentration: 72, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'BCA Bukukan Laba Bersih Rekor Rp54,8 Triliun Ditopang Pertumbuhan Kredit Korporasi & Konsumer', summary: 'Kinerja perbankan solid dengan NPL terjaga di 1.9%', source: 'Bisnis.com', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 92 },
      { id: '2', headline: 'Transaksi Digital BCA Mobile & MyBCA Melonjak 28% YoY', summary: 'CASA tetap mendominasi di atas 80% dari total DPK', source: 'Kontan', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 88 },
    ],
    risk: { volatility30D: 14.2, maxDrawdown1Y: 8.5, liquidityDailyTurnover: 450_000_000_000, debtToEquity: 0.12, beta: 0.85, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  BBRI: {
    fundamental: { revenue: 198_000_000_000_000, revenueGrowth: 9.8, netProfit: 60_400_000_000_000, eps: 398, epsGrowth: 8.4, roe: 20.1, roa: 3.2, roic: 18.5, debt: 0, cash: 180_000_000_000_000, operatingCashFlow: 75_000_000_000_000, freeCashFlow: 68_000_000_000_000, debtToEquity: 0.18, netMargin: 30.5 },
    valuation: { pe: 12.8, forwardPe: 11.5, pbv: 2.3, evEbitda: 10.4, psr: 3.8, peg: 1.45, dividendYield: 6.8, fcfYield: 8.2, sectorAvgPe: 13.5, sectorAvgPbv: 1.8 },
    smartMoney: { foreignNetFlow1D: 85_000_000_000, foreignNetFlow5D: 280_000_000_000, foreignNetFlow20D: 890_000_000_000, topBrokerConcentration: 68, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'BRI Bagikan Dividen Jumbo dengan Payout Ratio 80% ke Pemegang Saham', summary: 'Yield dividen menarik di kisaran 6-7%', source: 'CNBC Indonesia', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 90 },
      { id: '2', headline: 'Holding Ultra Mikro BRI (Pegadaian & PNM) Bukukan Pertumbuhan Nasabah Solid', summary: 'Pemberdayaan segmen mikro semakin ekspansif', source: 'Investor Daily', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 85 },
    ],
    risk: { volatility30D: 18.5, maxDrawdown1Y: 14.2, liquidityDailyTurnover: 520_000_000_000, debtToEquity: 0.18, beta: 1.05, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  BMRI: {
    fundamental: { revenue: 165_000_000_000_000, revenueGrowth: 14.2, netProfit: 55_100_000_000_000, eps: 590, epsGrowth: 16.2, roe: 22.8, roa: 2.9, roic: 19.5, debt: 0, cash: 150_000_000_000_000, operatingCashFlow: 65_000_000_000_000, freeCashFlow: 59_000_000_000_000, debtToEquity: 0.15, netMargin: 33.4 },
    valuation: { pe: 10.9, forwardPe: 9.8, pbv: 2.1, evEbitda: 9.1, psr: 3.7, peg: 0.72, dividendYield: 5.5, fcfYield: 9.1, sectorAvgPe: 13.5, sectorAvgPbv: 1.8 },
    smartMoney: { foreignNetFlow1D: 95_000_000_000, foreignNetFlow5D: 340_000_000_000, foreignNetFlow20D: 950_000_000_000, topBrokerConcentration: 70, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'Bank Mandiri Bukukan Pertumbuhan Kredit Korporasi dan Wholesale Tertinggi', summary: 'Livin by Mandiri capai 28 juta pengguna aktif', source: 'Bisnis.com', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 94 },
    ],
    risk: { volatility30D: 16.8, maxDrawdown1Y: 11.0, liquidityDailyTurnover: 410_000_000_000, debtToEquity: 0.15, beta: 0.98, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  BBNI: {
    fundamental: { revenue: 82_000_000_000_000, revenueGrowth: 8.5, netProfit: 21_500_000_000_000, eps: 575, epsGrowth: 10.1, roe: 15.6, roa: 2.1, roic: 14.0, debt: 0, cash: 75_000_000_000_000, operatingCashFlow: 28_000_000_000_000, freeCashFlow: 24_000_000_000_000, debtToEquity: 0.22, netMargin: 26.2 },
    valuation: { pe: 9.4, forwardPe: 8.5, pbv: 1.25, evEbitda: 7.8, psr: 2.4, peg: 0.92, dividendYield: 5.2, fcfYield: 11.2, sectorAvgPe: 13.5, sectorAvgPbv: 1.8 },
    smartMoney: { foreignNetFlow1D: 35_000_000_000, foreignNetFlow5D: 120_000_000_000, foreignNetFlow20D: 310_000_000_000, topBrokerConcentration: 64, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'Transformasi Digital Wondr by BNI Perkuat CASA dan Efisiensi Operasional', summary: 'Kualitas aset membaik dengan cost of credit menurun', source: 'Kontan', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 86 },
    ],
    risk: { volatility30D: 19.2, maxDrawdown1Y: 15.8, liquidityDailyTurnover: 210_000_000_000, debtToEquity: 0.22, beta: 1.08, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  TLKM: {
    fundamental: { revenue: 152_000_000_000_000, revenueGrowth: 4.2, netProfit: 24_500_000_000_000, eps: 247, epsGrowth: 3.5, roe: 17.5, roa: 8.5, roic: 15.2, debt: 52_000_000_000_000, cash: 32_000_000_000_000, operatingCashFlow: 54_000_000_000_000, freeCashFlow: 28_000_000_000_000, debtToEquity: 0.58, netMargin: 16.1 },
    valuation: { pe: 13.2, forwardPe: 12.0, pbv: 2.2, evEbitda: 5.4, psr: 1.95, peg: 1.65, dividendYield: 5.6, fcfYield: 8.8, sectorAvgPe: 15.0, sectorAvgPbv: 2.5 },
    smartMoney: { foreignNetFlow1D: -15_000_000_000, foreignNetFlow5D: 45_000_000_000, foreignNetFlow20D: 180_000_000_000, topBrokerConcentration: 58, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'Telkom Fokus Integrasi Fixed Mobile Convergence (FMC) dan Bisnis Data Center', summary: 'Infraco dan data center diproyeksikan jadi katalis jangka panjang', source: 'Bisnis.com', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 82 },
    ],
    risk: { volatility30D: 15.4, maxDrawdown1Y: 18.2, liquidityDailyTurnover: 290_000_000_000, debtToEquity: 0.58, beta: 0.78, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  ASII: {
    fundamental: { revenue: 315_000_000_000_000, revenueGrowth: 5.1, netProfit: 33_800_000_000_000, eps: 835, epsGrowth: 4.2, roe: 16.8, roa: 7.9, roic: 14.8, debt: 48_000_000_000_000, cash: 52_000_000_000_000, operatingCashFlow: 45_000_000_000_000, freeCashFlow: 31_000_000_000_000, debtToEquity: 0.35, netMargin: 10.7 },
    valuation: { pe: 7.2, forwardPe: 6.8, pbv: 1.05, evEbitda: 4.8, psr: 0.65, peg: 1.15, dividendYield: 8.2, fcfYield: 14.2, sectorAvgPe: 12.0, sectorAvgPbv: 1.5 },
    smartMoney: { foreignNetFlow1D: 25_000_000_000, foreignNetFlow5D: 110_000_000_000, foreignNetFlow20D: 340_000_000_000, topBrokerConcentration: 62, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'Astra Catat Penjualan Otomotif Stabil Serta Kinerja Solid Sektor Alat Berat & Tambang', summary: 'Dividen yield tinggi menjadi daya tarik utama investor', source: 'Investor Daily', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 84 },
    ],
    risk: { volatility30D: 17.1, maxDrawdown1Y: 16.5, liquidityDailyTurnover: 220_000_000_000, debtToEquity: 0.35, beta: 0.92, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  ICBP: {
    fundamental: { revenue: 71_000_000_000_000, revenueGrowth: 6.8, netProfit: 9_200_000_000_000, eps: 788, epsGrowth: 11.5, roe: 21.5, roa: 7.8, roic: 16.8, debt: 42_000_000_000_000, cash: 18_000_000_000_000, operatingCashFlow: 14_500_000_000_000, freeCashFlow: 10_200_000_000_000, debtToEquity: 0.82, netMargin: 12.9 },
    valuation: { pe: 15.6, forwardPe: 13.9, pbv: 2.8, evEbitda: 9.8, psr: 1.88, peg: 1.35, dividendYield: 3.5, fcfYield: 6.8, sectorAvgPe: 18.0, sectorAvgPbv: 3.2 },
    smartMoney: { foreignNetFlow1D: 18_000_000_000, foreignNetFlow5D: 75_000_000_000, foreignNetFlow20D: 240_000_000_000, topBrokerConcentration: 66, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'Ekspansi Pasar Global Indomie dan Pinehill Timur Tengah Dorong Laba ICBP', summary: 'Margin produk mie instan terjaga stabil', source: 'CNBC Indonesia', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 89 },
    ],
    risk: { volatility30D: 13.8, maxDrawdown1Y: 9.2, liquidityDailyTurnover: 120_000_000_000, debtToEquity: 0.82, beta: 0.65, eventRisk: 'LOW', concentrationRisk: 'LOW' },
  },
  ADRO: {
    fundamental: { revenue: 98_000_000_000_000, revenueGrowth: -8.2, netProfit: 25_200_000_000_000, eps: 785, epsGrowth: -12.4, roe: 24.5, roa: 14.2, roic: 22.1, debt: 15_000_000_000_000, cash: 45_000_000_000_000, operatingCashFlow: 32_000_000_000_000, freeCashFlow: 26_000_000_000_000, debtToEquity: 0.22, netMargin: 25.7 },
    valuation: { pe: 4.8, forwardPe: 5.2, pbv: 1.15, evEbitda: 2.8, psr: 1.2, peg: 0.65, dividendYield: 14.5, fcfYield: 22.0, sectorAvgPe: 7.5, sectorAvgPbv: 1.4 },
    smartMoney: { foreignNetFlow1D: 30_000_000_000, foreignNetFlow5D: 140_000_000_000, foreignNetFlow20D: 410_000_000_000, topBrokerConcentration: 69, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'Adaro Siapkan Dividen Jumbo Spesial dan Akselerasi Proyek Hilirisasi Aluminium Hijau', summary: 'Kas berlimpah memperkuat struktur neraca dan transformasi energi', source: 'Bisnis.com', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 91 },
    ],
    risk: { volatility30D: 24.5, maxDrawdown1Y: 19.8, liquidityDailyTurnover: 280_000_000_000, debtToEquity: 0.22, beta: 1.18, eventRisk: 'MEDIUM', concentrationRisk: 'MEDIUM' },
  },
  GOTO: {
    fundamental: { revenue: 15_800_000_000_000, revenueGrowth: 18.5, netProfit: -4_200_000_000_000, eps: -3.8, epsGrowth: 45.0, roe: -8.5, roa: -4.2, roic: -7.1, debt: 8_500_000_000_000, cash: 21_000_000_000_000, operatingCashFlow: 850_000_000_000, freeCashFlow: 210_000_000_000, debtToEquity: 0.28, netMargin: -26.5 },
    valuation: { pe: -4.2, forwardPe: -8.5, pbv: 1.85, evEbitda: -12.5, psr: 4.2, peg: 2.8, dividendYield: 0.0, fcfYield: 0.3, sectorAvgPe: 25.0, sectorAvgPbv: 2.5 },
    smartMoney: { foreignNetFlow1D: -8_000_000_000, foreignNetFlow5D: -35_000_000_000, foreignNetFlow20D: -85_000_000_000, topBrokerConcentration: 52, dataAvailable: true },
    sentiment: [
      { id: '1', headline: 'GoTo Capai Adjusted EBITDA Positif dan Perkuat Kolaborasi E-Commerce dengan TikTok', summary: 'Unit on-demand services mencatat efisiensi biaya', source: 'Katadata', publishedAt: new Date().toISOString(), sentiment: 'neutral', score: 65 },
    ],
    risk: { volatility30D: 38.5, maxDrawdown1Y: 42.0, liquidityDailyTurnover: 180_000_000_000, debtToEquity: 0.28, beta: 1.65, eventRisk: 'HIGH', concentrationRisk: 'MEDIUM' },
  },
};

export class ScreenerService {
  /**
   * Generates intelligence overview for a single ticker.
   */
  public async getStockIntelligence(ticker: string): Promise<StockIntelligenceOverview> {
    const symbol = ticker.toUpperCase();
    const stockMeta = STOCKS.find((s) => s.ticker === symbol) || {
      ticker: symbol,
      name: `${symbol} Tbk`,
      sector: 'General',
      basePrice: 1000,
      marketCap: '50 T',
      peRatio: 15.0,
      yahooSymbol: `${symbol}.JK`,
      description: 'Emiten Terdaftar di Bursa Efek Indonesia',
    };

    // 1. Get real quote and historical candles
    const quote = await marketService.getQuote(symbol);
    const candles = await marketService.getHistoricalDaily(symbol, 90);

    // 2. Fetch seed baseline or generate default deterministic baseline
    const seed = STOCK_INTELLIGENCE_SEEDS[symbol] || {
      fundamental: {
        revenue: 45_000_000_000_000,
        revenueGrowth: 7.5,
        netProfit: 5_200_000_000_000,
        eps: 180,
        epsGrowth: 8.0,
        roe: 14.5,
        roa: 5.2,
        roic: 12.0,
        debt: 12_000_000_000_000,
        cash: 15_000_000_000_000,
        operatingCashFlow: 7_800_000_000_000,
        freeCashFlow: 4_500_000_000_000,
        debtToEquity: 0.65,
        netMargin: 11.5,
      },
      valuation: {
        pe: stockMeta.peRatio,
        forwardPe: stockMeta.peRatio * 0.92,
        pbv: 1.8,
        evEbitda: 8.5,
        psr: 1.6,
        peg: 1.2,
        dividendYield: 3.8,
        fcfYield: 5.5,
        sectorAvgPe: 15.0,
        sectorAvgPbv: 2.0,
      },
      smartMoney: {
        foreignNetFlow1D: 15_000_000_000,
        foreignNetFlow5D: 65_000_000_000,
        foreignNetFlow20D: 210_000_000_000,
        topBrokerConcentration: 62,
        dataAvailable: true,
      },
      sentiment: [
        {
          id: '1',
          headline: `Kinerja Operasional Emiten ${symbol} Tumbuh Positif di Kuartal Berjalan`,
          summary: 'Manajemen optimistis mencapai target akhir tahun',
          source: 'IDX Channel',
          publishedAt: new Date().toISOString(),
          sentiment: 'positive',
          score: 80,
        },
      ],
      risk: {
        volatility30D: 21.0,
        maxDrawdown1Y: 15.0,
        liquidityDailyTurnover: 85_000_000_000,
        debtToEquity: 0.65,
        beta: 1.02,
        eventRisk: 'LOW',
        concentrationRisk: 'LOW',
      },
    };

    // 3. Execute all deterministic engines
    const fundamentalRes = fundamentalService.evaluate(seed.fundamental);
    const technicalRes = technicalService.evaluate(candles as OHLCV[]);
    const valuationRes = valuationService.evaluate(seed.valuation, stockMeta.sector);
    const smartMoneyRes = smartMoneyService.evaluate(seed.smartMoney);
    const sentimentRes = sentimentService.evaluate(seed.sentiment);
    const riskRes = riskService.evaluate(seed.risk);

    // 4. Compute composite overall score
    const overview = scoringService.computeOverall({
      ticker: symbol,
      companyName: stockMeta.name,
      sector: stockMeta.sector,
      industry: stockMeta.sector,
      marketCap: typeof stockMeta.marketCap === 'string' ? parseFloat(stockMeta.marketCap.replace(/[^0-9.]/g, '')) * 1e12 : 50e12,
      currentPrice: quote.price,
      changePercent: quote.change_percent,
      fundamental: fundamentalRes,
      technical: technicalRes,
      valuation: valuationRes,
      smartMoney: smartMoneyRes,
      sentiment: sentimentRes,
      risk: riskRes,
    });

    return overview;
  }

  /**
   * Generates Top 10 ranked stocks with detailed catalysts, risks, and confidence ratings.
   */
  public async getTop10(): Promise<ScreenerItem[]> {
    const list = await this.getAllRankedStocks();
    return list.slice(0, 10);
  }

  /**
   * Filters and sorts stocks based on screener criteria.
   */
  public async screenStocks(params: ScreenerFilterParams): Promise<{
    items: ScreenerItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const all = await this.getAllRankedStocks();

    let filtered = all.filter((item) => {
      if (params.search) {
        const query = params.search.toLowerCase();
        const matchesTicker = item.ticker.toLowerCase().includes(query);
        const matchesName = item.companyName.toLowerCase().includes(query);
        if (!matchesTicker && !matchesName) return false;
      }

      if (params.sector && params.sector !== 'ALL' && item.sector !== params.sector) {
        return false;
      }

      if (params.minScore !== undefined && item.overallScore < params.minScore) {
        return false;
      }

      if (params.maxScore !== undefined && item.overallScore > params.maxScore) {
        return false;
      }

      if (params.signal && params.signal !== ('ALL' as any) && item.signal !== params.signal) {
        return false;
      }

      if (params.valuation && params.valuation !== ('ALL' as any) && item.valuationStatus !== params.valuation) {
        return false;
      }

      if (params.risk && params.risk !== ('ALL' as any) && item.riskLevel !== params.risk) {
        return false;
      }

      return true;
    });

    // Sorting
    const sortBy = params.sortBy || 'rank';
    const sortOrder = params.sortOrder || 'asc';

    filtered.sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case 'score':
          diff = b.overallScore - a.overallScore;
          break;
        case 'rank':
          diff = a.rank - b.rank;
          break;
        case 'fundamental':
          diff = b.fundamentalScore - a.fundamentalScore;
          break;
        case 'technical':
          diff = b.technicalScore - a.technicalScore;
          break;
        case 'valuation':
          diff = b.valuationScore - a.valuationScore;
          break;
        case 'price':
          diff = b.price - a.price;
          break;
        case 'changePercent':
          diff = b.changePercent - a.changePercent;
          break;
        default:
          diff = a.rank - b.rank;
      }
      return sortOrder === 'desc' ? -diff : diff;
    });

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const items = filtered.slice(startIdx, startIdx + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Evaluates all 24+ stocks and assigns global ranks.
   */
  public async getAllRankedStocks(): Promise<ScreenerItem[]> {
    const promises = STOCKS.map((s) => this.getStockIntelligence(s.ticker));
    const overviews = await Promise.all(promises);

    // Sort descending by overallScore, then by confidenceScore
    overviews.sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      return b.confidenceScore - a.confidenceScore;
    });

    return overviews.map((item, index) => {
      const stockMeta = STOCKS.find((s) => s.ticker === item.ticker);
      return {
        rank: index + 1,
        ticker: item.ticker,
        companyName: item.companyName,
        sector: item.sector,
        price: item.currentPrice,
        changePercent: item.changePercent,
        marketCap: stockMeta?.marketCap || '50 T',
        overallScore: item.overallScore,
        confidenceScore: item.confidenceScore,
        fundamentalScore: item.scores.fundamental.score,
        technicalScore: item.scores.technical.score,
        valuationScore: item.scores.valuation.score,
        smartMoneyScore: item.scores.smartMoney.score,
        sentimentScore: item.scores.sentiment.score,
        riskScore: item.scores.risk.score,
        signal: item.scores.technical.signal,
        valuationStatus: item.scores.valuation.status,
        riskLevel: item.scores.risk.riskLevel,
        strongestPillar: item.strongestPillar || 'Fundamental',
        weakestPillar: item.weakestPillar || 'Valuasi',
        catalyst: item.catalyst,
        mainRisk: item.mainRisk,
      };
    });
  }

  /**
   * Explain a specific score pillar for a given ticker.
   */
  public async explainScore(ticker: string, pillar: string): Promise<ExplainScoreResponse> {
    const overview = await this.getStockIntelligence(ticker);
    return explanationService.explain(overview, pillar);
  }
}

export const screenerService = new ScreenerService();
