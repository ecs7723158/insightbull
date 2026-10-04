import React, { useState } from 'react';
import UserLayout from '@/shared/components/layouts/UserLayout';
import { SpiderConfig } from '../types';
import { generateSpiderLadder } from '../spiderCalculations';
import { SpiderLadderVisualizer } from '../components/SpiderLadderVisualizer';
import { IntradaySevenRoundsSim } from '../components/IntradaySevenRoundsSim';
import { SpiderTutorialNotes } from '../components/SpiderTutorialNotes';
import { SpiderCalculator } from '../components/SpiderCalculator';
import { HikariAvatar } from '@/features/rpg-waifu/components/HikariAvatar';
import { getEmotionState } from '@/features/rpg-waifu/waifuEngine';
import { Badge } from '@/shared/components/ui/badge';
import { Sparkles, Grid } from 'lucide-react';

export const SpiderStrategyPage: React.FC = () => {
  const [config, setConfig] = useState<SpiderConfig>({
    symbol: '2330.TW (台積電)',
    basePrice: 1020,
    stepPercentage: 5,
    gridLevels: 6,
    allocationPerLevel: 100000,
    mode: 'fixed_amount',
    hedgeWithOptions: true,
  });

  const [waifuQuote, setWaifuQuote] = useState<string>(
    '嘻嘻～蛛網策略啟動！當前基準價 $' + config.basePrice + '，小光已經幫你算好對稱階梯囉！'
  );

  const steps = generateSpiderLadder(config);
  const emotion = getEmotionState(68, waifuQuote);

  return (
    <UserLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Grid className="w-3.5 h-3.5" />
                <span>Alex Huang 2017 經典策略 • 程式交易專題</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                🕸️ 蛛網策略教學與造市模擬 (Spider Grid Strategy)
              </h1>
              <p className="mt-2 text-purple-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                源自黃逢徵《套利Step by Step》，透過「定額買進、定量賣出」與數學對稱階梯，在震盪盤中以造市者（Market Maker）之姿捕獲單日 7上7下 的流動性溢價。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-xs text-purple-200">階距對稱性</p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  (1+x)(1-x) ≈ 1
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-xs text-purple-200">造市勝率</p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  59.7%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Companion Avatar Reaction */}
        <HikariAvatar
          emotion={emotion}
          compact={true}
        />

        {/* Spider Configurator */}
        <SpiderCalculator
          config={config}
          onChange={(newConf) => {
            setConfig(newConf);
            setWaifuQuote(`已更新標的為 ${newConf.symbol}，基準價設為 $${newConf.basePrice}！`);
          }}
        />

        {/* Seven Rounds Intraday Simulation */}
        <IntradaySevenRoundsSim
          config={config}
          onWaifuReaction={(quote) => setWaifuQuote(quote)}
        />

        {/* Spider Ladder Visualizer */}
        <SpiderLadderVisualizer
          steps={steps}
          config={config}
        />

        {/* Pedagogical Breakdown Notes */}
        <SpiderTutorialNotes />
      </div>
    </UserLayout>
  );
};
