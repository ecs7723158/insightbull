import React, { useState } from 'react';
import { SpiderConfig, IntradayRoundEvent } from '../types';
import { simulateSevenRounds } from '../spiderCalculations';
import { audio } from '@/features/rpg-waifu/audioService';
import { addExpAndAffection } from '@/features/rpg-waifu/waifuEngine';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Play, RotateCcw, Activity, CheckCircle2, TrendingUp, Sparkles, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface IntradaySevenRoundsSimProps {
  config: SpiderConfig;
  onWaifuReaction?: (quote: string) => void;
}

export const IntradaySevenRoundsSim: React.FC<IntradaySevenRoundsSimProps> = ({
  config,
  onWaifuReaction,
}) => {
  const events = simulateSevenRounds(config);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const totalRealizedProfit = events
    .slice(0, currentStep)
    .filter(e => e.type === 'SELL')
    .reduce((acc, curr) => acc + (curr.price - config.basePrice * (1 - config.stepPercentage / 100)) * curr.shares, 0);

  const handleNextStep = () => {
    if (currentStep >= events.length) return;
    const nextIdx = currentStep + 1;
    setCurrentStep(nextIdx);
    const event = events[nextIdx - 1];

    if (event.type === 'SELL') {
      audio.playCoinSound();
      addExpAndAffection(25, 30);
    } else {
      audio.playPokeSound();
    }

    if (onWaifuReaction) {
      onWaifuReaction(event.waifuReaction);
    }

    if (nextIdx === events.length) {
      audio.playLevelUpSound();
      toast.success('🏆 狂賀！單日 7上7下 蛛網收割傳奇達成！', {
        description: '共撮合 14 筆買賣單，流動性造市收益全數落袋！',
      });
    }
  };

  const handleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    let step = currentStep;
    const timer = setInterval(() => {
      if (step >= events.length) {
        clearInterval(timer);
        setIsPlaying(false);
        return;
      }
      step++;
      setCurrentStep(step);
      const ev = events[step - 1];
      if (ev.type === 'SELL') {
        audio.playCoinSound();
      }
      if (onWaifuReaction) onWaifuReaction(ev.waifuReaction);

      if (step === events.length) {
        audio.playLevelUpSound();
        clearInterval(timer);
        setIsPlaying(false);
        toast.success('🏆 7上7下 蛛網收割傳奇達成！');
      }
    }, 700);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    audio.playPokeSound();
  };

  return (
    <Card className="rounded-3xl border-purple-200/80 dark:border-purple-500/20 shadow-lg bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-3 border-b border-purple-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>實戰經典：2221 大甲單日實錄模擬</span>
            </div>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
              一天 7 上 7 下 Market Maker 流動性捕獲模擬
            </CardTitle>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleAutoPlay}
              className={`rounded-2xl text-xs font-bold px-4 ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
              }`}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              {isPlaying ? '暫停播放' : currentStep >= events.length ? '重新演練' : '自動播放 7上7下'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextStep}
              disabled={currentStep >= events.length || isPlaying}
              className="rounded-2xl text-xs font-semibold"
            >
              單步撮合 +1
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleReset}
              className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Progress & Realized Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-purple-100 dark:border-slate-700 shadow-sm">
          <div>
            <p className="text-[11px] text-slate-400">當前進度</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">
              {Math.min(7, Math.floor(currentStep / 2))} / 7 回合 ({currentStep} / 14 筆)
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">累積實現獲利</p>
            <p className="text-base font-extrabold text-emerald-600">
              +${Math.round(totalRealizedProfit).toLocaleString()} 元
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">提供市場流動性</p>
            <p className="text-base font-bold text-purple-600">
              {currentStep > 0 ? `${(currentStep * Math.round(config.allocationPerLevel / config.basePrice)).toLocaleString()} 股` : '0 股'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">角色身份狀態</p>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-semibold text-[11px]">
              {currentStep === 14 ? '👑 神級造市者' : '⚡ 造市撮合中'}
            </Badge>
          </div>
        </div>

        {/* Live Order Execution Ticker Stream */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {events.slice(0, currentStep).map((ev, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all animate-in fade-in slide-in-from-top-2 ${
                ev.type === 'SELL'
                  ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/50 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-slate-400 text-[11px]">{ev.time}</span>
                <Badge className={ev.type === 'SELL' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>
                  第 {ev.round} 輪 • {ev.type === 'SELL' ? '高檔定量賣出 📈' : '回檔定額買進 📉'}
                </Badge>
                <span className="font-mono font-bold">${ev.price.toFixed(2)}</span>
                <span className="text-slate-500 dark:text-slate-400">× {ev.shares} 股</span>
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {ev.waifuReaction}
                </span>
              </div>
            </div>
          ))}

          {currentStep === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              點擊「自動播放 7上7下」或「單步撮合」，體驗 Alex Huang 提出的日內震盪流動性造市過程！
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
