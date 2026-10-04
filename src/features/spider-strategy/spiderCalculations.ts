import { SpiderConfig, GridStep, IntradayRoundEvent } from './types';

/**
 * Calculates Spider Grid Ladder prices and allocations
 * Ref: Alex Huang 2017-08 "蛛網策略有沒有效？"
 * Downward steps: P_0 * (1 - r)^k
 * Upward steps: P_0 * (1 + r)^k
 */
export function generateSpiderLadder(config: SpiderConfig): GridStep[] {
  const steps: GridStep[] = [];
  const r = config.stepPercentage / 100;
  const P0 = config.basePrice;

  // 1. Base step
  steps.push({
    step: 0,
    type: 'BASE',
    price: P0,
    shares: Math.round(config.allocationPerLevel / P0),
    totalCost: config.allocationPerLevel,
    triggerCondition: '基準開倉位階',
    status: 'FILLED',
  });

  // 2. Downward Buy Steps (每跌一階定額買進)
  let currentDownPrice = P0;
  for (let i = 1; i <= config.gridLevels; i++) {
    currentDownPrice = currentDownPrice * (1 - r);
    const roundedPrice = Math.round(currentDownPrice * 100) / 100;
    
    // Fixed amount means buying more shares when cheaper
    const shares = config.mode === 'fixed_amount' 
      ? Math.round(config.allocationPerLevel / roundedPrice)
      : Math.round(config.allocationPerLevel / P0);

    steps.push({
      step: -i,
      type: 'BUY',
      price: roundedPrice,
      shares,
      totalCost: Math.round(shares * roundedPrice),
      triggerCondition: `回檔 -${Math.round((1 - Math.pow(1 - r, i)) * 100)}% (第 ${i} 階跌幅買進)`,
      status: 'PENDING',
    });
  }

  // 3. Upward Sell Steps (每漲一階定量賣出)
  let currentUpPrice = P0;
  for (let i = 1; i <= config.gridLevels; i++) {
    currentUpPrice = currentUpPrice * (1 + r);
    const roundedPrice = Math.round(currentUpPrice * 100) / 100;

    // Fixed quantity selling to secure profit without running out too fast
    const baseShares = Math.round(config.allocationPerLevel / P0);

    steps.push({
      step: i,
      type: 'SELL',
      price: roundedPrice,
      shares: baseShares,
      totalCost: Math.round(baseShares * roundedPrice),
      triggerCondition: `上漲 +${Math.round((Math.pow(1 + r, i) - 1) * 100)}% (第 ${i} 階高檔獲利出清)`,
      status: 'PENDING',
    });
  }

  // Sort by price descending
  return steps.sort((a, b) => b.price - a.price);
}

/**
 * Simulates Alex Huang's legendary "7上7下" Intraday Market Maker volatility harvest
 * Based on 2221 大甲 case study: 14 total fills (7 buys, 7 sells) in a single volatile day.
 */
export function simulateSevenRounds(config: SpiderConfig): IntradayRoundEvent[] {
  const events: IntradayRoundEvent[] = [];
  const r = config.stepPercentage / 100;
  const P0 = config.basePrice;
  const buyPrice = Math.round(P0 * (1 - r) * 100) / 100;
  const sellPrice = Math.round(P0 * (1 + r) * 100) / 100;
  const sharesPerTrade = Math.round(config.allocationPerLevel / P0);

  const profitPerRound = Math.round((sellPrice - buyPrice) * sharesPerTrade);
  let cumulativeProfit = 0;

  const waifuQuotes = [
    '第 1 回合捕獲！觸發下網買進、反彈定量賣出，開門紅！🌸',
    '第 2 回合完成！主力上下洗盤，剛好全進了小光的蛛網～✨',
    '第 3 回合順利落袋！「我是 Market Maker，提供流動性！」💰',
    '第 4 回合達成！午盤繼續震盪，便當錢直接升級牛排大餐！🥩',
    '第 5 回合！Master 果然神機妙算，急跌緩漲的節奏抓得真好！💖',
    '第 6 回合連勝！7上7下傳奇即將達成，小光心跳加速～⚡',
    '🎉 第 7 回合圓滿達成！單日 7 買 7 賣共 14 次撮合，蛛網策略大獲全勝！🏆',
  ];

  const timeSlots = [
    '09:18:24', '09:45:10', '10:22:35', '11:05:40',
    '11:48:15', '12:30:50', '13:14:02'
  ];

  for (let round = 1; round <= 7; round++) {
    cumulativeProfit += profitPerRound;

    events.push({
      round,
      time: timeSlots[round - 1],
      type: 'BUY',
      price: buyPrice,
      shares: sharesPerTrade,
      cashFlow: -(buyPrice * sharesPerTrade),
      cumulativeProfit: cumulativeProfit - profitPerRound,
      waifuReaction: `下探 ${buyPrice} 觸發定額掛單買進`,
    });

    events.push({
      round,
      time: timeSlots[round - 1].replace(/:\d\d$/, ':55'),
      type: 'SELL',
      price: sellPrice,
      shares: sharesPerTrade,
      cashFlow: sellPrice * sharesPerTrade,
      cumulativeProfit,
      waifuReaction: waifuQuotes[round - 1],
    });
  }

  return events;
}
