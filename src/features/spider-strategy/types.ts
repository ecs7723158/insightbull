export interface SpiderConfig {
  symbol: string;
  basePrice: number;
  stepPercentage: number; // e.g. 10 (for 10%) or 5 (for 5%)
  gridLevels: number; // number of steps up/down, e.g. 6
  allocationPerLevel: number; // TWD or USD per ladder buy
  mode: 'fixed_amount' | 'fixed_quantity';
  hedgeWithOptions: boolean;
}

export interface GridStep {
  step: number; // 0 is base, negative is buy below, positive is sell above
  type: 'BUY' | 'BASE' | 'SELL';
  price: number;
  shares: number;
  totalCost: number;
  triggerCondition: string;
  status: 'PENDING' | 'FILLED' | 'CLOSED';
}

export interface IntradayRoundEvent {
  round: number;
  time: string;
  type: 'BUY' | 'SELL';
  price: number;
  shares: number;
  cashFlow: number;
  cumulativeProfit: number;
  waifuReaction: string;
}

export interface BacktestSummary {
  testedStocks: number;
  winRate: number; // e.g. 59.7%
  avgGain: number;
  avgLoss: number;
  topRunawayRisk: string; // "大立光 (3008) 軋空現象"
  mitigationRule: string;
}
