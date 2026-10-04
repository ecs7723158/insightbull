import React, { useState } from 'react';
import { RPGStats, DailyQuest, DailyFortune, SkillItem } from '../types';
import { SKILL_TREE, DEFAULT_QUESTS, getTodayFortune, addExpAndAffection, saveRPGStats } from '../waifuEngine';
import { audio } from '../audioService';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Award, Zap, CheckCircle2, Circle, Flame, Sparkles, Coins, Scroll, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface RPGStatsCardProps {
  stats: RPGStats;
  onStatsChange: (newStats: RPGStats) => void;
}

export const RPGStatsCard: React.FC<RPGStatsCardProps> = ({ stats, onStatsChange }) => {
  const [quests, setQuests] = useState<DailyQuest[]>(DEFAULT_QUESTS);
  const fortune: DailyFortune = getTodayFortune();

  const handleCompleteQuest = (qId: string) => {
    const target = quests.find(q => q.id === qId);
    if (!target || target.completed) return;

    audio.playCoinSound();
    const updatedQuests = quests.map(q => q.id === qId ? { ...q, completed: true } : q);
    setQuests(updatedQuests);

    const { stats: newStats, leveledUp } = addExpAndAffection(target.rewardExp, 25);
    onStatsChange(newStats);

    toast.success(`🎯 完成任務「${target.title}」！`, {
      description: `獲得 +${target.rewardExp} EXP、+${target.rewardCoins} 金幣！`,
    });

    if (leveledUp) {
      toast.success(`🎉 小光等級提升到了 Lv.${newStats.level}！`);
    }
  };

  const expPercentage = Math.min(100, Math.round((stats.exp / stats.maxExp) * 100));
  const affectionPercentage = Math.min(100, Math.round((stats.affection / 1000) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* RPG Profile & Affection Panel */}
      <Card className="rounded-3xl border-pink-200/80 dark:border-pink-500/20 shadow-lg bg-gradient-to-br from-white via-pink-50/20 to-purple-50/20 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-pink-500" />
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                冒險者資質與女友親密度
              </CardTitle>
            </div>
            <Badge className="bg-pink-500 text-white font-bold px-2.5 py-0.5 text-xs">
              {stats.title}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Level and Coins */}
          <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-pink-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                Lv.{stats.level}
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">市場冒險等級</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {stats.exp} / {stats.maxExp} EXP ({expPercentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pr-2">
              <div className="flex items-center space-x-1.5 text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl font-bold text-xs">
                <Coins className="w-4 h-4" />
                <span>{stats.coins} 萌幣</span>
              </div>
              <div className="flex items-center space-x-1 text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 rounded-xl font-bold text-xs">
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.streakDays} 日連勝</span>
              </div>
            </div>
          </div>

          {/* EXP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium">升級進度</span>
              <span className="font-bold text-pink-600">{expPercentage}%</span>
            </div>
            <Progress value={expPercentage} className="h-2.5 bg-pink-100 dark:bg-slate-700" />
          </div>

          {/* Affection Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium flex items-center space-x-1">
                <span>小光心動好感度 (Affection)</span>
                <span className="text-rose-500">❤️</span>
              </span>
              <span className="font-bold text-rose-500">{stats.affection} / 1000</span>
            </div>
            <Progress value={affectionPercentage} className="h-2.5 bg-rose-100 dark:bg-slate-700" />
            <p className="text-[11px] text-slate-400">
              提示：每天與小光互動、執行蛛網回測或檢視台股情資皆可獲得好感度！
            </p>
          </div>

          {/* Skill Tree Quick View */}
          <div className="pt-2 border-t border-pink-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2.5 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>已解鎖守護技能</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_TREE.map(skill => {
                const isUnlocked = stats.level >= skill.requiredLevel;
                return (
                  <div
                    key={skill.id}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                      isUnlocked
                        ? 'bg-purple-50/70 border-purple-200 text-purple-900 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-200'
                        : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/40 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1">
                      <span>{skill.icon}</span>
                      <span className="truncate">{skill.name.split(' ')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {isUnlocked ? skill.effect : `需達 Lv.${skill.requiredLevel} 解鎖`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quests & Daily Fortune */}
      <div className="space-y-6">
        {/* Daily Fortune / Omikuji */}
        <Card className="rounded-3xl border-amber-200/80 dark:border-amber-500/20 shadow-lg bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scroll className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  今日小光神籤 (Daily Fortune)
                </CardTitle>
              </div>
              <Badge className="bg-amber-500 text-white font-bold px-2.5 py-0.5 text-xs">
                {fortune.luckLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-amber-100 dark:border-slate-700 shadow-sm text-center">
              <p className="text-amber-800 dark:text-amber-300 font-serif font-bold text-base tracking-wider">
                「{fortune.verse}」
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
                  🍀 幸運標的: {fortune.luckyCode}
                </span>
                <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-medium">
                  🎨 幸運色: {fortune.luckyColor}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-amber-100/60">
              💡 <strong>小光錦囊:</strong> {fortune.advice}
            </p>
          </CardContent>
        </Card>

        {/* Daily Quests */}
        <Card className="rounded-3xl border-blue-200/80 dark:border-blue-500/20 shadow-lg bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                每日成長任務 (Daily Quests)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {quests.map(q => (
              <div
                key={q.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  q.completed
                    ? 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-800/30'
                    : 'bg-white border-blue-100 hover:border-blue-300 dark:bg-slate-800/70 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {q.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs font-bold ${q.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {q.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      獎勵: +{q.rewardExp} EXP, +{q.rewardCoins} 幣
                    </p>
                  </div>
                </div>

                {!q.completed ? (
                  <Button
                    size="sm"
                    onClick={() => handleCompleteQuest(q.id)}
                    className="h-7 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-3 font-semibold shadow-sm"
                  >
                    領取
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-300">
                    已達成
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
