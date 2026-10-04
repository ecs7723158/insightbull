export type EmotionLevel = 'ecstatic' | 'sweet' | 'playful' | 'tsundere' | 'worried';

export interface EmotionState {
  level: EmotionLevel;
  score: number; // 0 - 100
  title: string;
  badge: string;
  color: string;
  bgGlow: string;
  avatarUrl: string;
  quote: string;
  japaneseQuote?: string;
}

export interface RPGStats {
  level: number;
  exp: number;
  maxExp: number;
  affection: number; // 0 - 1000
  title: string;
  streakDays: number;
  coins: number;
  lastDailyClaim?: string;
  unlockedSkills: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredLevel: number;
  unlocked: boolean;
  effect: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  rewardExp: number;
  rewardCoins: number;
  completed: boolean;
  actionHint: string;
}

export interface DailyFortune {
  date: string;
  luckLevel: '大吉' | '中吉' | '小吉' | '吉' | '特吉 (牛氣沖天)';
  luckyCode: string;
  luckyColor: string;
  verse: string;
  advice: string;
}
