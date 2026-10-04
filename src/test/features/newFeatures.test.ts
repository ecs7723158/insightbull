import { describe, it, expect } from 'vitest';
import { getEmotionState, addExpAndAffection, getTodayFortune } from '@/features/rpg-waifu/waifuEngine';
import { generateSpiderLadder, simulateSevenRounds } from '@/features/spider-strategy/spiderCalculations';
import { SpiderConfig } from '@/features/spider-strategy/types';
import { TAIWAN_STOCKS_DATA, DEMO_THESIS_CARD_2330 } from '@/features/taiwan-trading/mockTaiwanData';

describe('Anime RPG Girlfriend Waifu Engine', () => {
  it('correctly maps emotion score to 5 distinct levels', () => {
    expect(getEmotionState(92).level).toBe('ecstatic');
    expect(getEmotionState(75).level).toBe('sweet');
    expect(getEmotionState(55).level).toBe('playful');
    expect(getEmotionState(35).level).toBe('tsundere');
    expect(getEmotionState(15).level).toBe('worried');
  });

  it('provides matching avatar URLs and badges', () => {
    const ecstatic = getEmotionState(95);
    expect(ecstatic.avatarUrl).toContain('hikari_happy.jpg');

    const tsundere = getEmotionState(30);
    expect(tsundere.avatarUrl).toContain('hikari_tsundere.jpg');

    const worried = getEmotionState(10);
    expect(worried.avatarUrl).toContain('hikari_worried.jpg');
  });

  it('accumulates EXP and triggers level up correctly', () => {
    const { stats, leveledUp } = addExpAndAffection(150, 50);
    expect(stats.level).toBeGreaterThanOrEqual(1);
    expect(stats.affection).toBeGreaterThanOrEqual(180);
    expect(stats.coins).toBeGreaterThan(0);
  });

  it('generates a valid daily fortune omikuji', () => {
    const fortune = getTodayFortune();
    expect(fortune.luckLevel).toBeDefined();
    expect(fortune.luckyCode).toBeDefined();
    expect(fortune.verse.length).toBeGreaterThan(5);
    expect(fortune.advice.length).toBeGreaterThan(5);
  });
});

describe('Alex Huang Spider Grid Strategy Calculations', () => {
  const config: SpiderConfig = {
    symbol: '2330.TW',
    basePrice: 1000,
    stepPercentage: 10,
    gridLevels: 3,
    allocationPerLevel: 100000,
    mode: 'fixed_amount',
    hedgeWithOptions: true,
  };

  it('generates correct ladder steps and symmetry', () => {
    const steps = generateSpiderLadder(config);
    // 1 base + 3 down + 3 up = 7 steps
    expect(steps.length).toBe(7);

    const base = steps.find(s => s.type === 'BASE');
    expect(base?.price).toBe(1000);

    const firstBuy = steps.find(s => s.step === -1);
    expect(firstBuy?.price).toBe(900); // 1000 * 0.9

    const firstSell = steps.find(s => s.step === 1);
    expect(firstSell?.price).toBe(1100); // 1000 * 1.1

    // Fixed amount buys more shares when cheaper
    const secondBuy = steps.find(s => s.step === -2);
    expect(secondBuy?.price).toBe(810); // 900 * 0.9
    expect(secondBuy!.shares).toBeGreaterThan(firstBuy!.shares);
  });

  it('simulates 7 rounds (14 executions) of intraday market making', () => {
    const events = simulateSevenRounds(config);
    expect(events.length).toBe(14);

    const buys = events.filter(e => e.type === 'BUY');
    const sells = events.filter(e => e.type === 'SELL');
    expect(buys.length).toBe(7);
    expect(sells.length).toBe(7);

    // Final cumulative profit should be strictly positive
    const finalEvent = events[events.length - 1];
    expect(finalEvent.cumulativeProfit).toBeGreaterThan(0);
  });
});

describe('Taiwan Stock & stock-ai-lab ThesisCard Architecture', () => {
  it('contains essential Taiwan blue chips with valid telemetry', () => {
    expect(TAIWAN_STOCKS_DATA.length).toBeGreaterThanOrEqual(5);
    const tsmc = TAIWAN_STOCKS_DATA.find(s => s.symbol === '2330.TW');
    expect(tsmc).toBeDefined();
    expect(tsmc!.superConcentration).toBeGreaterThan(80);
    expect(tsmc!.foreignBuy).toBeGreaterThan(0);
  });

  it('validates TSMC ThesisCard adhering to FIN schema standard', () => {
    const card = DEMO_THESIS_CARD_2330;
    expect(card.schema_version).toBe('v0.1.0');
    expect(card.ticker).toBe('2330.TW');
    expect(card.scenarios.bull).toBeDefined();
    expect(card.scenarios.base).toBeDefined();
    expect(card.scenarios.bear).toBeDefined();
    expect(card.kill_criteria.length).toBeGreaterThanOrEqual(1);
    expect(card.disclaimer).toContain('僅供研究與教育');
    expect(card.position_policy).toContain('FIN 不下令、不下單');
  });
});
