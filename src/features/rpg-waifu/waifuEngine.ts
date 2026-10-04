import { EmotionState, EmotionLevel, RPGStats, SkillItem, DailyQuest, DailyFortune } from './types';
import { audio } from './audioService';

const STORAGE_KEY_RPG = 'insightbull_hikari_rpg_v1';

export const SKILL_TREE: SkillItem[] = [
  {
    id: 'spider_web',
    name: '🕸️ 蛛網織造 (Spider Weaving)',
    icon: '🕸️',
    description: '深入領悟 Alex Huang 蛛網定額買進與震盪捕獲心法，震盪盤時獲得好感度雙倍！',
    requiredLevel: 1,
    unlocked: true,
    effect: '震盪網格成交時經驗值 +50%',
  },
  {
    id: 'hedge_barrier',
    name: '🛡️ 避險結界 (Hedge Barrier)',
    icon: '🛡️',
    description: '當大盤跳空下跌時自動啟動警示結界，提醒使用選擇權或保留現金部位防禦。',
    requiredLevel: 2,
    unlocked: false,
    effect: '急跌跳空時觸發守護語音並提供避險策略建議',
  },
  {
    id: 'finbert_telepathy',
    name: '🔮 讀心術 (FinBERT Mind Reading)',
    icon: '🔮',
    description: '結合 FinBERT 深度神經網路精準感知市場新聞情緒，一眼看穿主力意圖。',
    requiredLevel: 3,
    unlocked: false,
    effect: '解鎖情緒與價格背離警示雷達',
  },
  {
    id: 'sage_thesis',
    name: '📊 賢者之眼 (Sage Thesis Vision)',
    icon: '📊',
    description: '調用 FIN/MKT ThesisCard 與籌碼面千張大戶指標，建構無懈可擊的投資論點卡。',
    requiredLevel: 5,
    unlocked: false,
    effect: '一鍵導出完整台美股情資論點卡',
  },
];

export const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: 'q1',
    title: '早晨摸摸小光（簽到與問候）',
    rewardExp: 30,
    rewardCoins: 50,
    completed: false,
    actionHint: '點擊小光立繪與她互動',
  },
  {
    id: 'q2',
    title: '檢視一次台股籌碼與三大法人買賣超',
    rewardExp: 50,
    rewardCoins: 100,
    completed: false,
    actionHint: '前往台股情報面板查看個股',
  },
  {
    id: 'q3',
    title: '執行一次 7上7下 蛛網策略模擬',
    rewardExp: 80,
    rewardCoins: 150,
    completed: false,
    actionHint: '在蛛網策略頁面點擊模擬運行',
  },
  {
    id: 'q4',
    title: '研讀 Alex Huang 蛛網策略教學精要',
    rewardExp: 40,
    rewardCoins: 80,
    completed: false,
    actionHint: '閱讀蛛網策略頁面的核心教學',
  }
];

export function getEmotionState(score: number, contextMsg?: string): EmotionState {
  // Score clamped 0 - 100
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped >= 85) {
    return {
      level: 'ecstatic',
      score: clamped,
      title: '💖 欣喜若狂 (Super Bull)',
      badge: '✨ 大賺起飛中',
      color: 'from-pink-500 via-rose-500 to-amber-400',
      bgGlow: 'rgba(244, 63, 94, 0.25)',
      avatarUrl: '/waifu/hikari_happy.jpg',
      quote: contextMsg || '哇啊啊！Master 太厲害啦！整個市場都在為我們放煙火～今天一定要請我吃草莓聖代喔！🍓✨',
      japaneseQuote: 'ご主人様、すごーい！市場が私たちのために輝いてるよ～！',
    };
  } else if (clamped >= 65) {
    return {
      level: 'sweet',
      score: clamped,
      title: '🌸 甜美安心 (Mild Bull)',
      badge: '🌿 穩健向陽',
      color: 'from-emerald-400 via-teal-500 to-blue-500',
      bgGlow: 'rgba(16, 185, 129, 0.2)',
      avatarUrl: '/waifu/hikari_playful.jpg',
      quote: contextMsg || '看到綠油油的獲利與紅通通的盤面，好安心呀～有 Master 在，小光一點都不擔心！',
      japaneseQuote: '安定していて安心だね。ご主人様と一緒なら心強いよ！',
    };
  } else if (clamped >= 45) {
    return {
      level: 'playful',
      score: clamped,
      title: '✨ 俏皮期待 (Sideways Volatility)',
      badge: '🕸️ 蛛網捕獲熱區',
      color: 'from-violet-500 via-purple-500 to-pink-500',
      bgGlow: 'rgba(139, 92, 246, 0.25)',
      avatarUrl: '/waifu/hikari_playful.jpg',
      quote: contextMsg || '嘻嘻～上下洗盤正是蛛網策略的本命舞台！「7上7下」每一階都在替我們賺便當錢呢～！',
      japaneseQuote: 'レンジ相場こそクモの巣戦略の出番！７往復全部いただきだよ～！',
    };
  } else if (clamped >= 25) {
    return {
      level: 'tsundere',
      score: clamped,
      title: '⚡ 傲嬌緊張 (Market Dip / Consolidation)',
      badge: '🔥 定額分批蓄力',
      color: 'from-amber-500 via-orange-500 to-red-500',
      bgGlow: 'rgba(245, 158, 11, 0.25)',
      avatarUrl: '/waifu/hikari_tsundere.jpg',
      quote: contextMsg || '哼！回檔震盪而已，慌張什麼呀？笨蛋 Master！跌下來的階梯算好了沒？定額加碼單快掛上啦！',
      japaneseQuote: 'べ、別に心配なんかしてないんだからね！ちゃんと定額で買い下がってよ、バカ！',
    };
  } else {
    return {
      level: 'worried',
      score: clamped,
      title: '🌧️ 委屈抱抱 (Deep Bear / Panic)',
      badge: '🛡️ 啟動避險結界',
      color: 'from-indigo-600 via-blue-600 to-slate-700',
      bgGlow: 'rgba(59, 130, 246, 0.3)',
      avatarUrl: '/waifu/hikari_worried.jpg',
      quote: contextMsg || '嗚嗚...大盤連續跳空大跌好恐怖... Master 快抱抱我！千萬不要硬扛，記得用選擇權或現金額度避險喔！',
      japaneseQuote: '急落怖いよ…ぎゅってして…！オプションヘッジと現金比率を絶対守ってね！',
    };
  }
}

export function loadRPGStats(): RPGStats {
  if (typeof window === 'undefined') {
    return {
      level: 1,
      exp: 40,
      maxExp: 100,
      affection: 180,
      title: '🌱 新手市場冒險者',
      streakDays: 3,
      coins: 250,
      unlockedSkills: ['spider_web'],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_RPG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load RPG stats from localStorage', e);
  }

  const initial: RPGStats = {
    level: 1,
    exp: 40,
    maxExp: 100,
    affection: 180,
    title: '🌱 新手市場冒險者',
    streakDays: 3,
    coins: 250,
    unlockedSkills: ['spider_web'],
  };
  saveRPGStats(initial);
  return initial;
}

export function saveRPGStats(stats: RPGStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_RPG, JSON.stringify(stats));
  }
}

export function addExpAndAffection(expAmount: number, affectionAmount: number): { stats: RPGStats; leveledUp: boolean } {
  const current = loadRPGStats();
  let exp = current.exp + expAmount;
  let level = current.level;
  let maxExp = current.maxExp;
  let leveledUp = false;

  while (exp >= maxExp) {
    exp -= maxExp;
    level += 1;
    maxExp = Math.round(maxExp * 1.45);
    leveledUp = true;
  }

  const affection = Math.min(1000, current.affection + affectionAmount);

  // Update title based on level
  let title = current.title;
  if (level >= 10) title = '👑 傳奇蛛網操盤神尊';
  else if (level >= 7) title = '🔮 智謀天后之星';
  else if (level >= 5) title = '🕸️ 蛛網織造先鋒';
  else if (level >= 3) title = '📈 牛熊御風使者';
  else if (level >= 2) title = '🌸 靈動行情守護者';

  const updated: RPGStats = {
    ...current,
    level,
    exp,
    maxExp,
    affection,
    title,
    coins: current.coins + (leveledUp ? 200 : 20),
  };

  saveRPGStats(updated);

  if (leveledUp) {
    audio.playLevelUpSound();
  } else {
    audio.playCoinSound();
  }

  return { stats: updated, leveledUp };
}

export function getTodayFortune(): DailyFortune {
  const todayStr = new Date().toISOString().split('T')[0];
  const fortunes: DailyFortune[] = [
    {
      date: todayStr,
      luckLevel: '特吉 (牛氣沖天)',
      luckyCode: '2330.TW (台積電) / NVDA',
      luckyColor: '櫻花粉 🌸 & 財神金 🪙',
      verse: '晨曦初照蛛絲亮，七縱七橫引玉泉。',
      advice: '多頭動能旺盛，震盪回踩階梯即是定額加碼的最佳甜蜜點！',
    },
    {
      date: todayStr,
      luckLevel: '大吉',
      luckyCode: '2454.TW (聯發科) / TSM',
      luckyColor: '紫羅蘭 🔮 & 科技藍 💻',
      verse: '莫道浮雲遮望眼，法人籌碼暗伏藏。',
      advice: '千張大戶持股集中，適合布建 5% 間距的蛛網階梯，輕鬆享受日內波動獲利。',
    },
    {
      date: todayStr,
      luckLevel: '中吉',
      luckyCode: '0050.TW (元大台灣50) / SPY',
      luckyColor: '薄荷綠 🌿',
      verse: '風定波平潮漸起，定量階梯緩推移。',
      advice: '指數型標的穩健，嚴格執行定額買進與定量賣出，無懼跳空波動。',
    }
  ];

  // Pick deterministic fortune based on day
  const charCodeSum = todayStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return fortunes[charCodeSum % fortunes.length];
}
