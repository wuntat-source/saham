import { STOCKS, StockInfo } from './constants';
import { fetchStockQuote, StockQuote } from './market';

export interface ScreenedStock {
  rank: number;
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change24hPct: number;
  peRatio: number;
  pbv: number;
  roe: number;
  dividendYield: number;
  der: number;

  // 5 Pillar Scores
  fundamentalScore: number;
  technicalScore: number;
  bandarologiScore: number;
  sentimentScore: number;
  valuationScore: number;

  // Overall Composite Score (0-100)
  compositeScore: number;

  // Status & Tags
  trend: 'Bullish' | 'Neutral' | 'Bearish';
  bandarStatus: 'Akumulasi Kuat' | 'Akumulasi Ringan' | 'Netral' | 'Distribusi';
  valuationStatus: 'Undervalued' | 'Fair Value' | 'Overvalued';
  categoryTag: string;
  actionRecommendation: '🟢 Strong Buy' | '🟢 Buy on Weakness' | '🟡 Hold / Wait' | '🔴 Avoid';
  keyHighlight: string;
}

export interface ScreenerFilterOptions {
  sector?: string;
  preset?: 'all' | 'top10' | 'undervalued' | 'momentum' | 'dividend' | 'bluechip';
  minScore?: number;
  search?: string;
  sortBy?: 'compositeScore' | 'fundamentalScore' | 'technicalScore' | 'bandarologiScore' | 'valuationScore' | 'dividendYield' | 'peRatio';
  sortOrder?: 'asc' | 'desc';
}

export async function runStockScreener(options: ScreenerFilterOptions = {}): Promise<{
  totalScreened: number;
  top10: ScreenedStock[];
  stocks: ScreenedStock[];
  sectorDistribution: Record<string, number>;
  generatedAt: string;
}> {
  const {
    sector = 'all',
    preset = 'all',
    minScore = 0,
    search = '',
    sortBy = 'compositeScore',
    sortOrder = 'desc',
  } = options;

  // Fetch live quotes for all stocks concurrently
  const screenedList: ScreenedStock[] = await Promise.all(
    STOCKS.map(async (stock) => {
      const quote = await fetchStockQuote(stock.ticker);
      const isBank = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS'].includes(stock.ticker);
      const isMining = ['AMMN', 'ADRO', 'PTBA', 'MEDC', 'ANTM', 'INCO', 'PGAS'].includes(stock.ticker);
      const isTech = ['GOTO', 'BUKA'].includes(stock.ticker);
      const isFMCG = ['ICBP', 'INDF', 'UNVR', 'MYOR', 'KLBF', 'CPIN'].includes(stock.ticker);
      const isProperty = ['CTRA', 'BSDE', 'PWON'].includes(stock.ticker);

      // Financial Estimates
      const roe = isBank ? 19.5 : isFMCG ? 26.2 : isMining ? 23.8 : isTech ? -9.5 : isProperty ? 12.4 : 14.8;
      const pbv = parseFloat((stock.peRatio > 0 ? (stock.peRatio * (roe / 100)) : 1.2).toFixed(2));
      const dividendYield = isTech ? 0.0 : isMining ? (stock.ticker === 'PTBA' ? 8.2 : 5.4) : isBank ? 3.8 : isFMCG ? 4.1 : 2.5;
      const der = isBank ? 4.8 : isTech ? 0.25 : isMining ? 0.65 : 0.72;

      // 1. Fundamental Score (0-100)
      let fundamentalScore = 80;
      if (roe > 20) fundamentalScore += 12;
      else if (roe > 12) fundamentalScore += 6;
      else if (roe < 0) fundamentalScore -= 30;

      if (der < 1.0) fundamentalScore += 8;
      if (isBank || isFMCG) fundamentalScore += 5;
      fundamentalScore = Math.min(98, Math.max(25, fundamentalScore));

      // 2. Technical Score (0-100)
      let technicalScore = 70;
      if (quote.changePct > 2.0) technicalScore += 18;
      else if (quote.changePct > 0) technicalScore += 10;
      else if (quote.changePct < -2.0) technicalScore -= 18;
      else technicalScore -= 5;
      if (isBank || isMining) technicalScore += 6;
      technicalScore = Math.min(95, Math.max(30, technicalScore));

      // 3. Bandarologi Score (0-100)
      let bandarologiScore = 65;
      if (quote.changePct >= 0) {
        bandarologiScore += 18;
        if (isBank || isMining) bandarologiScore += 8;
      } else {
        bandarologiScore -= 12;
      }
      bandarologiScore = Math.min(96, Math.max(25, bandarologiScore));

      // 4. Valuation Score (0-100)
      let valuationScore = 75;
      if (stock.peRatio > 0 && stock.peRatio < 10) valuationScore += 18;
      else if (stock.peRatio > 0 && stock.peRatio < 16) valuationScore += 10;
      else if (stock.peRatio > 30) valuationScore -= 20;

      if (dividendYield > 4.5) valuationScore += 10;
      valuationScore = Math.min(98, Math.max(30, valuationScore));

      // 5. Sentiment Score (0-100)
      let sentimentScore = isBank || isMining ? 85 : isFMCG ? 80 : 72;
      if (quote.changePct > 1.5) sentimentScore += 6;

      // Weighted Composite AI Score
      const compositeScore = Math.round(
        fundamentalScore * 0.25 +
        technicalScore * 0.20 +
        bandarologiScore * 0.20 +
        valuationScore * 0.20 +
        sentimentScore * 0.15
      );

      // Trend & Status classification
      const trend = quote.changePct > 1 ? 'Bullish' : quote.changePct < -1 ? 'Bearish' : 'Neutral';
      const bandarStatus =
        bandarologiScore >= 85
          ? 'Akumulasi Kuat'
          : bandarologiScore >= 70
          ? 'Akumulasi Ringan'
          : bandarologiScore >= 50
          ? 'Netral'
          : 'Distribusi';

      const valuationStatus =
        stock.peRatio > 0 && stock.peRatio < 12
          ? 'Undervalued'
          : stock.peRatio > 25
          ? 'Overvalued'
          : 'Fair Value';

      // Category Tag
      let categoryTag = '💎 Undervalued Value';
      if (isBank && compositeScore >= 85) categoryTag = '👑 Blue Chip Aristocrat';
      else if (dividendYield >= 5.0) categoryTag = '💰 High Dividend';
      else if (technicalScore >= 85 && bandarologiScore >= 80) categoryTag = '🚀 Momentum Leader';
      else if (isTech) categoryTag = '⚡ Tech Growth';
      else if (compositeScore >= 82) categoryTag = '🌟 Top Quality Pick';

      // Action
      let actionRecommendation: '🟢 Strong Buy' | '🟢 Buy on Weakness' | '🟡 Hold / Wait' | '🔴 Avoid' = '🟢 Buy on Weakness';
      if (compositeScore >= 85) actionRecommendation = '🟢 Strong Buy';
      else if (compositeScore >= 75) actionRecommendation = '🟢 Buy on Weakness';
      else if (compositeScore >= 60) actionRecommendation = '🟡 Hold / Wait';
      else actionRecommendation = '🔴 Avoid';

      // Quick Key Highlight
      const keyHighlight =
        compositeScore >= 85
          ? `Kombinasi ROE tinggi (${roe}%), PER atraktif (${stock.peRatio}x), dan akumulasi institusi solid.`
          : valuationStatus === 'Undervalued'
          ? `Valuasi murah (PER ${stock.peRatio}x, PBV ${pbv}x) dengan potensi upside tinggi.`
          : `Likuiditas transaksi aktif dengan dividend yield ${dividendYield}%.`;

      return {
        rank: 0,
        ticker: stock.ticker,
        name: stock.name,
        sector: stock.sector,
        price: quote.price,
        change24hPct: quote.changePct,
        peRatio: stock.peRatio,
        pbv,
        roe,
        dividendYield,
        der,
        fundamentalScore,
        technicalScore,
        bandarologiScore,
        sentimentScore,
        valuationScore,
        compositeScore,
        trend,
        bandarStatus,
        valuationStatus,
        categoryTag,
        actionRecommendation,
        keyHighlight,
      };
    })
  );

  // Global ranking by Composite Score descending
  screenedList.sort((a, b) => b.compositeScore - a.compositeScore);
  screenedList.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  const top10 = screenedList.slice(0, 10);

  // Sector distribution count
  const sectorDistribution: Record<string, number> = {};
  screenedList.forEach((s) => {
    sectorDistribution[s.sector] = (sectorDistribution[s.sector] || 0) + 1;
  });

  // Apply filters
  let filtered = screenedList;

  if (sector && sector !== 'all') {
    filtered = filtered.filter((s) => s.sector.toLowerCase() === sector.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }

  if (minScore > 0) {
    filtered = filtered.filter((s) => s.compositeScore >= minScore);
  }

  // Presets
  if (preset === 'top10') {
    filtered = filtered.slice(0, 10);
  } else if (preset === 'undervalued') {
    filtered = filtered.filter((s) => s.valuationStatus === 'Undervalued' && s.fundamentalScore >= 75);
  } else if (preset === 'momentum') {
    filtered = filtered.filter((s) => s.technicalScore >= 75 && s.bandarologiScore >= 70);
  } else if (preset === 'dividend') {
    filtered = filtered.filter((s) => s.dividendYield >= 3.5 && s.fundamentalScore >= 75);
  } else if (preset === 'bluechip') {
    filtered = filtered.filter((s) => s.fundamentalScore >= 85 && s.compositeScore >= 80);
  }

  // Sorting
  filtered.sort((a, b) => {
    const valA = a[sortBy] as number;
    const valB = b[sortBy] as number;
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  return {
    totalScreened: screenedList.length,
    top10,
    stocks: filtered,
    sectorDistribution,
    generatedAt: new Date().toISOString(),
  };
}
