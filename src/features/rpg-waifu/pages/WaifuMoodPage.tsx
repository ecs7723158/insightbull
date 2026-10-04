import React, { useState } from 'react';
import UserLayout from '@/shared/components/layouts/UserLayout';
import { HikariAvatar } from '../components/HikariAvatar';
import { RPGStatsCard } from '../components/RPGStatsCard';
import { getEmotionState, loadRPGStats, saveRPGStats } from '../waifuEngine';
import { EmotionState, RPGStats } from '../types';
import { audio } from '../audioService';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Slider } from '@/shared/components/ui/slider';
import { Badge } from '@/shared/components/ui/badge';
import { Sparkles, Heart, Activity, Sliders, ShieldAlert, TrendingUp, RefreshCw, Compass } from 'lucide-react';
import { toast } from 'sonner';

export const WaifuMoodPage: React.FC = () => {
  const [moodScore, setMoodScore] = useState<number>(75);
  const [stats, setStats] = useState<RPGStats>(loadRPGStats());
  const [customQuote, setCustomQuote] = useState<string | undefined>(undefined);

  const currentEmotion: EmotionState = getEmotionState(moodScore, customQuote);

  const handleScenarioTrigger = (score: number, quote: string, scenarioName: string) => {
    setMoodScore(score);
    setCustomQuote(quote);
    audio.playSparkleSound();
    audio.speak(quote);
    toast.info(`🎬 觸發情境：「${scenarioName}」`, {
      description: `小光情緒值調整為 ${score}！`,
    });
  };

  const handleReset = () => {
    setMoodScore(75);
    setCustomQuote(undefined);
    audio.playCoinSound();
  };

  return (
    <UserLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-8 text-white shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RPG 動漫交易伴侶系統 • 萌化觀盤核心</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                🌸 小光的情緒指數與冒險中心
              </h1>
              <p className="mt-2 text-pink-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                結合大盤走勢、FinBERT 輿情分析與 Alex Huang 蛛網策略執行狀態。以動態立繪、語音台詞與好感度養成，讓每次觀察台美股都充滿樂趣與陪伴！
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-xs text-pink-100">當前好感度</p>
                <p className="text-2xl font-extrabold text-white mt-0.5 flex items-center justify-center space-x-1">
                  <span>{stats.affection}</span>
                  <span className="text-sm">❤️</span>
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-xs text-pink-100">冒險階級</p>
                <p className="text-2xl font-extrabold text-white mt-0.5">
                  Lv.{stats.level}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Character Display & Dialogue */}
        <HikariAvatar
          emotion={currentEmotion}
          onAffectionChange={() => setStats(loadRPGStats())}
        />

        {/* Interactive Market Scenario Simulator & Slider */}
        <Card className="rounded-3xl border-purple-200/80 dark:border-purple-500/20 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  情境即時模擬器 (Market Emotion Simulator)
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-purple-600"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                重置預設
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emotion Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>手動微調情緒值 (0 恐慌熊市 ~ 100 狂歡牛市)</span>
                <span className="text-pink-600 font-bold text-sm">{moodScore} 分</span>
              </div>
              <Slider
                value={[moodScore]}
                onValueChange={(vals) => {
                  setMoodScore(vals[0]);
                  setCustomQuote(undefined);
                }}
                min={0}
                max={100}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>🌧️ 0 崩跌恐慌</span>
                <span>⚡ 25 傲嬌回檔</span>
                <span>✨ 50 震盪蛛網</span>
                <span>🌸 75 溫和多頭</span>
                <span>💖 100 狂熱牛市</span>
              </div>
            </div>

            {/* Quick Scenario Triggers */}
            <div className="space-y-2.5 pt-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ⚡ 快速觸發市場典型事件情境：
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScenarioTrigger(
                    95,
                    '台積電法說大超預期，帶動大盤暴漲 400 點！Master，我們的獲利突破天際啦！',
                    '牛市暴漲'
                  )}
                  className="rounded-2xl text-xs font-medium border-pink-200 hover:bg-pink-50 text-pink-700 dark:border-pink-800 dark:hover:bg-pink-950/40"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                  大盤暴漲 400 點 🚀
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScenarioTrigger(
                    55,
                    '大盤今日在區間震盪上下 150 點，蛛網策略共撮合 7 次買賣！每一筆手續費後都有獲利入袋～',
                    '蛛網 7上7下'
                  )}
                  className="rounded-2xl text-xs font-medium border-purple-200 hover:bg-purple-50 text-purple-700 dark:border-purple-800 dark:hover:bg-purple-950/40"
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                  蛛網 7上7下成交 🕸️
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScenarioTrigger(
                    35,
                    '哼！外資今天小賣百億回檔了啦！不過跌破第 2 階正好是定額攤平點，Master 你沒漏掛單吧？',
                    '主力洗盤'
                  )}
                  className="rounded-2xl text-xs font-medium border-amber-200 hover:bg-amber-50 text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/40"
                >
                  <Compass className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  回踩階梯洗盤 ⚡
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScenarioTrigger(
                    12,
                    '嗚嗚...國際黑天鵝引發跳空大跌！快檢查選擇權保護或減碼，Master 要緊緊保護好本金喔！',
                    '股災跳空'
                  )}
                  className="rounded-2xl text-xs font-medium border-blue-200 hover:bg-blue-50 text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/40"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  急跌跳空警示 🌧️
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RPG Stats & Quests & Daily Fortune */}
        <RPGStatsCard
          stats={stats}
          onStatsChange={(newStats) => setStats(newStats)}
        />
      </div>
    </UserLayout>
  );
};
