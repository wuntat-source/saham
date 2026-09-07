import { CatalystItem, CatalystsByTimeline } from '@/types/advanced-intelligence';
import { STOCKS } from '@/lib/constants';

const SEED_CATALYSTS: Array<Omit<CatalystItem, 'id' | 'companyName' | 'timeframe'>> = [
  {
    ticker: 'BBCA',
    eventType: 'EARNINGS',
    title: 'Rilis Laporan Keuangan Kuartal Berjalan & Paparan Kinerja',
    description: 'Manajemen memaparkan pertumbuhan kredit wholesale, consumer, dan margin bunga bersih (NIM).',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // TODAY
    expectedImpact: 'HIGH_POSITIVE',
    confidence: 94,
    source: 'Keterbukaan Informasi BEI (IDX)',
  },
  {
    ticker: 'BBRI',
    eventType: 'DIVIDEND',
    title: 'Cum Date Dividen Tunai Interim / Final Tahun Buku Berjalan',
    description: 'Pembagian dividen tunai dengan estimasi dividend yield kompetitif ~6.5%.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // THIS WEEK
    expectedImpact: 'HIGH_POSITIVE',
    confidence: 96,
    source: 'Kustodian Sentral Efek Indonesia (KSEI)',
  },
  {
    ticker: 'ADRO',
    eventType: 'RUPS',
    title: 'Rapat Umum Pemegang Saham Luar Biasa (RUPSLB) & Hilirisasi',
    description: 'Persetujuan rencana spin-off unit batubara termal dan akselerasi proyek smelter aluminium hijau.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(), // THIS WEEK
    expectedImpact: 'HIGH_POSITIVE',
    confidence: 90,
    source: 'Pengumuman Resmi Emiten di IDX',
  },
  {
    ticker: 'TLKM',
    eventType: 'EXPANSION',
    title: 'Peluncuran Infraco & Kerjasama Strategis Hyperscale Data Center',
    description: 'Ekspansi jaringan kabel laut dan komersialisasi kapasitas data center regional.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // NEXT 30 DAYS
    expectedImpact: 'MODERATE_POSITIVE',
    confidence: 88,
    source: 'Press Release Resmi Telkom Indonesia',
  },
  {
    ticker: 'ASII',
    eventType: 'CONTRACT',
    title: 'Penandatanganan Kerjasama Ekosistem Kendaraan Listrik (EV) & Baterai',
    description: 'Kemitraan strategis perakitan kendaraan ramah lingkungan dan jaringan charging station nasional.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(), // NEXT 30 DAYS
    expectedImpact: 'MODERATE_POSITIVE',
    confidence: 85,
    source: 'IDX Corporate Action Notice',
  },
  {
    ticker: 'AMMN',
    eventType: 'INDEX_REBALANCE',
    title: 'Efektif Inklusi Rebalancing Indeks Global MSCI & FTSE',
    description: 'Potensi capital inflow terukur dari dana pasif dan reksadana indeks global.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(), // NEXT 30 DAYS
    expectedImpact: 'HIGH_POSITIVE',
    confidence: 92,
    source: 'MSCI Index Rebalance Announcement',
  },
  {
    ticker: 'BMRI',
    eventType: 'BUYBACK',
    title: 'Realisasi Program Pembelian Kembali Saham (Share Buyback)',
    description: 'Program buyback untuk alokasi insentif kinerja jangka panjang dan stabilisasi harga pasar.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 26).toISOString(), // NEXT 30 DAYS
    expectedImpact: 'MODERATE_POSITIVE',
    confidence: 87,
    source: 'Keterbukaan Informasi BEI',
  },
];

export class CatalystService {
  /**
   * Fetches all upcoming catalysts segmented by TODAY, THIS WEEK, and NEXT 30 DAYS.
   */
  public async getCatalystsTimeline(): Promise<CatalystsByTimeline> {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    const allCatalysts: CatalystItem[] = SEED_CATALYSTS.map((c, index) => {
      const stock = STOCKS.find((s) => s.ticker === c.ticker);
      const eventTime = new Date(c.eventDate).getTime();
      const diffMs = eventTime - now;

      let timeframe: 'TODAY' | 'THIS_WEEK' | 'NEXT_30_DAYS' = 'NEXT_30_DAYS';
      if (diffMs <= oneDayMs) timeframe = 'TODAY';
      else if (diffMs <= oneWeekMs) timeframe = 'THIS_WEEK';

      return {
        id: `cat-${index + 1}`,
        ...c,
        companyName: stock?.name || `${c.ticker} Tbk`,
        timeframe,
      };
    });

    const today = allCatalysts.filter((c) => c.timeframe === 'TODAY');
    const thisWeek = allCatalysts.filter((c) => c.timeframe === 'THIS_WEEK');
    const next30Days = allCatalysts.filter((c) => c.timeframe === 'NEXT_30_DAYS');

    return {
      today,
      thisWeek,
      next30Days,
      total: allCatalysts.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async getCatalystsByTicker(ticker: string): Promise<CatalystItem[]> {
    const timeline = await this.getCatalystsTimeline();
    const all = [...timeline.today, ...timeline.thisWeek, ...timeline.next30Days];
    return all.filter((c) => c.ticker === ticker.toUpperCase());
  }
}

export const catalystService = new CatalystService();
