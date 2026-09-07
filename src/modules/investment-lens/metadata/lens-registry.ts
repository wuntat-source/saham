import { LensMetadata, LensType } from '@/types/lens';

export const LENS_REGISTRY: LensMetadata[] = [
  {
    type: 'INSTITUTIONAL',
    slug: 'institutional',
    name: 'Institutional / Risk-Adjusted',
    iconName: 'Building2',
    horizon: 'Medium–Long Term (1–3 Years)',
    primaryFocus: 'Quality + Growth + Risk-Adjusted Valuation',
    keyMetrics: ['ROE & ROIC', 'Balance Sheet (DER)', 'FCF Yield', 'Downside Risk & Beta', 'Catalysts'],
    riskProfile: 'Balanced & Risk-Preserving',
    description:
      'Evaluates the asset from an institutional framework focusing on capital allocation efficiency, cash flow generation, and downside invalidation boundaries.',
    route: '/investment-lens/institutional',
  },
  {
    type: 'LONG_TERM_QUALITY',
    slug: 'long-term',
    name: 'Long-Term Quality & Valuation',
    iconName: 'Landmark',
    horizon: '5–10 Years (Multi-Year Compounding)',
    primaryFocus: 'Sustainable Value Creation + Moat Durability',
    keyMetrics: ['5-Year ROIC Avg', 'Economic Moat Width', 'FCF Conversion Rate', 'Dividend Sustainability', 'Fair Value DCF'],
    riskProfile: 'Conservative & Business-Centric',
    description:
      'Prioritizes fundamental business quality and moat durability over short-term volatility, asking if the business can compound shareholder wealth over a decade.',
    route: '/investment-lens/long-term',
  },
  {
    type: 'FUNDAMENTAL_GROWTH',
    slug: 'growth',
    name: 'Fundamental Growth',
    iconName: 'TrendingUp',
    horizon: 'Medium Term (1–2 Years)',
    primaryFocus: 'Earnings Acceleration + Market Expectation Beat',
    keyMetrics: ['Revenue Growth YoY', 'EPS Acceleration', 'Margin Expansion (NPM)', 'GARP Multiple (PEG)', 'Addressable TAM'],
    riskProfile: 'Growth-Seeking (GARP Focused)',
    description:
      'Identifies companies exhibiting superior earnings acceleration and market share gains that may surpass consensus market expectations.',
    route: '/investment-lens/growth',
  },
  {
    type: 'MACRO_CATALYST',
    slug: 'macro',
    name: 'Macro + Fundamental + Catalyst',
    iconName: 'Globe',
    horizon: 'Tactical (3–12 Months)',
    primaryFocus: 'Top-Down Macro Sensitivities + Sector Tailwinds',
    keyMetrics: ['BI Rate Sensitivity', 'USD/IDR FX Exposure', 'Commodity Linkage', 'Inflation Pass-Through', '3–12M Catalysts'],
    riskProfile: 'Adaptive & Cycle-Aware',
    description:
      'Tests how macroeconomic regime shifts (interest rates, currency, inflation) shock company earnings and maps upcoming catalytic triggers.',
    route: '/investment-lens/macro',
  },
  {
    type: 'EARNINGS_EXPECTATIONS',
    slug: 'earnings',
    name: 'Earnings & Market Expectations',
    iconName: 'Briefcase',
    horizon: 'Quarterly / Tactical',
    primaryFocus: 'Business Reality vs Consensus Expectations',
    keyMetrics: ['Earnings Surprise History', 'Guidance Revision Bias', 'Beat / Miss Probabilities', 'Market Sentiment Skew'],
    riskProfile: 'Event-Driven & Asymmetry-Focused',
    description:
      'Compares actual operational performance against market consensus to identify positive surprise setups or expectation risk traps.',
    route: '/investment-lens/earnings',
  },
  {
    type: 'QUALITY_COMPOUNDER',
    slug: 'compounder',
    name: 'Quality Compounder',
    iconName: 'Zap',
    horizon: 'Long Term (5+ Years)',
    primaryFocus: 'High Reinvestment Rate + High ROIC Flywheel',
    keyMetrics: ['ROIC Quality', 'Reinvestment Rate (%)', '5-Year Total Return Model', 'Pricing Power', 'TAM Expansion'],
    riskProfile: 'Long-Term Capital Compounding',
    description:
      'Deconstructs the 5-Year Shareholder Return Model (Fundamental growth + Dividend yield ± Multiple re-rating) to identify long-term compounders.',
    route: '/investment-lens/compounder',
  },
];

export function getLensMetadata(typeOrSlug: string): LensMetadata | undefined {
  const query = typeOrSlug.toLowerCase();
  return LENS_REGISTRY.find(
    (l) => l.type.toLowerCase() === query || l.slug.toLowerCase() === query
  );
}
