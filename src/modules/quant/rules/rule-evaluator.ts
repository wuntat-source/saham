import { RuleCondition, StrategyRuleGroup, RuleOperator } from '@/types/quant';

export interface StockDataPoint {
  ticker: string;
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Indicators
  rsi_14?: number;
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  ema_12?: number;
  ema_26?: number;
  macd_line?: number;
  macd_signal?: number;
  volume_sma_20?: number;
  bb_upper?: number;
  bb_lower?: number;
  // Previous bar indicators for cross checks
  prev_price?: number;
  prev_sma_50?: number;
  prev_sma_20?: number;
  prev_rsi_14?: number;
  prev_macd_line?: number;
  prev_macd_signal?: number;
  // Intelligence Scores
  technical_score?: number;
  fundamental_score?: number;
  valuation_score?: number;
  smart_money_score?: number;
  sentiment_score?: number;
  risk_score?: number;
  overall_score?: number;
  relative_strength?: number;
  // Fundamental Ratios
  pe_ratio?: number;
  pbv_ratio?: number;
  roe?: number;
  npm?: number;
  der?: number;
  dividend_yield?: number;
}

export class RuleEvaluator {
  /**
   * Evaluates a single rule condition against the point-in-time stock data.
   */
  public evaluateCondition(condition: RuleCondition, data: StockDataPoint): boolean {
    const fieldValue = (data as any)[condition.field];
    if (fieldValue === undefined || fieldValue === null) {
      return false; // Point-in-time missing data fails safely
    }

    const targetValue = typeof condition.value === 'string' ? parseFloat(condition.value) : condition.value;

    switch (condition.operator) {
      case '>':
        return Number(fieldValue) > targetValue;
      case '<':
        return Number(fieldValue) < targetValue;
      case '>=':
        return Number(fieldValue) >= targetValue;
      case '<=':
        return Number(fieldValue) <= targetValue;
      case '==':
        return Number(fieldValue) === targetValue;
      case '!=':
        return Number(fieldValue) !== targetValue;
      case 'CROSSES_ABOVE': {
        const prevFieldKey = 'prev_' + condition.field;
        const prevValue = (data as any)[prevFieldKey] ?? fieldValue;
        return Number(prevValue) <= targetValue && Number(fieldValue) > targetValue;
      }
      case 'CROSSES_BELOW': {
        const prevFieldKey = 'prev_' + condition.field;
        const prevValue = (data as any)[prevFieldKey] ?? fieldValue;
        return Number(prevValue) >= targetValue && Number(fieldValue) < targetValue;
      }
      default:
        return false;
    }
  }

  /**
   * Evaluates a rule group (AND/OR of multiple conditions).
   */
  public evaluateGroup(group: StrategyRuleGroup, data: StockDataPoint): boolean {
    if (!group.conditions || group.conditions.length === 0) {
      return true; // Empty rule group matches by default
    }

    if (group.logicalOperator === 'OR') {
      return group.conditions.some((cond) => this.evaluateCondition(cond, data));
    }

    // Default: 'AND'
    return group.conditions.every((cond) => this.evaluateCondition(cond, data));
  }
}

export const ruleEvaluator = new RuleEvaluator();
