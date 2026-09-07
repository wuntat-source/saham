export interface HoldingItem {
  stock_code: string;
  name: string;
  sector: string;
  lots: number;
  total_shares: number;
  avg_buy_price: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

export interface PortfolioSummary {
  cash_balance: number;
  invested_value: number;
  market_value: number;
  total_equity: number;
  initial_balance: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  realized_pnl: number;
  return_percent: number;
  holdings: HoldingItem[];
}
