export interface TaiwanStockQuote {
  symbol: string;
  name: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number; // 張數
  high: number;
  low: number;
  open: number;
  peRatio: number;
  dividendYield: number; // %
  foreignBuy: number; // 外資買賣超 (張)
  trustBuy: number; // 投信買賣超 (張)
  dealerBuy: number; // 自營商買賣超 (張)
  superConcentration: number; // 千張大戶持股比例 %
  retailConcentration: number; // 散戶持股比例 %
  monthlyRevenueYoY: number; // 月營收年增率 %
  sentimentScore: number; // 0 - 100
}

export interface ScenarioDefinition {
  label: string;
  triggers: string[];
  thesis_implication: string;
}

export interface ThesisCardData {
  schema_version: string;
  ticker: string;
  company: string;
  market: 'TW' | 'US';
  as_of: string;
  business_one_liner: string;
  why_might_work: string[];
  why_might_fail: string[];
  kill_criteria: string[];
  next_update_triggers: string[];
  valuation_framework: {
    method: string;
    assumptions: string[];
    uncertainty: 'low' | 'medium' | 'high';
  };
  scenarios: {
    bull: ScenarioDefinition;
    base: ScenarioDefinition;
    bear: ScenarioDefinition;
  };
  status: 'DONE' | 'PARTIAL' | 'NEED-INFO';
  disclaimer: string;
  position_policy: string;
}
