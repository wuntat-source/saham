export type OrderType = 'BUY' | 'SELL';
export type OrderMode = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface PlaceOrderRequest {
  stock_code: string;
  order_type: OrderType;
  order_mode?: OrderMode;
  lot_quantity: number;
  target_price?: number;
}

export interface TradeExecutionResult {
  success: boolean;
  order_id: string;
  transaction_id: string;
  stock_code: string;
  type: OrderType;
  price: number;
  lot_quantity: number;
  shares: number;
  total_amount: number;
  broker_fee: number;
  total_settlement: number;
  realized_pnl: number;
  remaining_cash: number;
}
