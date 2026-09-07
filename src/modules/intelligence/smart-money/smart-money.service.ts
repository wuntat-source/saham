import { SmartMoneyData, SmartMoneyScoreResult, SmartMoneyStatus } from '@/types/intelligence';

export class SmartMoneyService {
  /**
   * Evaluates institutional order flow, foreign flow trends, and accumulation/distribution dynamics.
   * Uses professional terminology. Never fabricates broker activity or alleges manipulation.
   */
  public evaluate(data?: Partial<SmartMoneyData>): SmartMoneyScoreResult {
    if (!data || !data.dataAvailable) {
      return {
        score: 50,
        confidence: 25,
        status: 'DATA NOT AVAILABLE',
        metrics: {
          foreignNetFlow1D: null,
          foreignNetFlow5D: null,
          foreignNetFlow20D: null,
          institutionalSharePct: null,
          topBrokerConcentration: null,
          volumePriceDivergence: false,
          dataAvailable: false,
        },
        summary: 'Data arus modal institusi / smart money flow belum tersedia untuk emiten ini.',
      };
    }

    const net1D = data.foreignNetFlow1D ?? 0;
    const net5D = data.foreignNetFlow5D ?? 0;
    const net20D = data.foreignNetFlow20D ?? 0;
    const concentration = data.topBrokerConcentration ?? 50;

    let flowScore = 50;
    let status: SmartMoneyStatus = 'NEUTRAL';

    // Positive foreign inflow over multiple horizons indicates accumulation
    if (net5D > 10_000_000_000 && net20D > 50_000_000_000) {
      if (concentration > 65) {
        status = 'ACCUMULATION';
        flowScore = 92;
      } else {
        status = 'RE-ACCUMULATION';
        flowScore = 80;
      }
    } else if (net5D > 0 && net20D > 0) {
      status = 'RE-ACCUMULATION';
      flowScore = 72;
    } else if (net5D < -10_000_000_000 && net20D < -50_000_000_000) {
      status = 'DISTRIBUTION';
      flowScore = 25;
    } else if (net5D < 0 && net20D < 0) {
      status = 'DISTRIBUTION';
      flowScore = 38;
    } else {
      status = 'NEUTRAL';
      flowScore = 55;
    }

    const confidence = 85;

    let summary = 'Aktivitas transaksi institusi berada pada level netral tanpa dominasi signifikan.';
    if (status === 'ACCUMULATION') {
      summary = 'Terdeteksi akumulasi terstruktur oleh institusi dengan konsentrasi beli yang kuat.';
    } else if (status === 'RE-ACCUMULATION') {
      summary = 'Arus modal masuk positif bertahap dari investor institusi/asing dalam 5-20 hari bursa.';
    } else if (status === 'DISTRIBUTION') {
      summary = 'Terjadi distribusi modal keluar oleh pelaku pasar institusi secara bertahap.';
    }

    return {
      score: flowScore,
      confidence,
      status,
      metrics: {
        foreignNetFlow1D: data.foreignNetFlow1D ?? null,
        foreignNetFlow5D: data.foreignNetFlow5D ?? null,
        foreignNetFlow20D: data.foreignNetFlow20D ?? null,
        institutionalSharePct: data.institutionalSharePct ?? null,
        topBrokerConcentration: data.topBrokerConcentration ?? null,
        volumePriceDivergence: data.volumePriceDivergence ?? false,
        dataAvailable: true,
      },
      summary,
    };
  }
}

export const smartMoneyService = new SmartMoneyService();
