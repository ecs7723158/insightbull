import React from 'react';
import { GridStep, SpiderConfig } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Anchor, CheckCircle2, Info } from 'lucide-react';

interface SpiderLadderVisualizerProps {
  steps: GridStep[];
  config: SpiderConfig;
}

export const SpiderLadderVisualizer: React.FC<SpiderLadderVisualizerProps> = ({ steps, config }) => {
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-lg bg-white/95 dark:bg-slate-900/95 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <span>🕸️ 蛛網階梯買賣圖譜 (Spider Grid Ladder)</span>
              <Badge variant="outline" className="border-pink-300 text-pink-600 bg-pink-50 dark:bg-pink-950/40">
                階距: {config.stepPercentage}%
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              標的: <strong className="text-slate-700 dark:text-slate-200">{config.symbol}</strong> │ 基準價: <strong>${config.basePrice}</strong> │ 模式: {config.mode === 'fixed_amount' ? '定額買進 / 定量賣出' : '定量買進 / 定量賣出'}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>獲利賣出階梯</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>定額買進階梯</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">階梯階數</th>
                <th className="py-3 px-4 font-semibold">觸發條件</th>
                <th className="py-3 px-4 font-semibold">目標價格</th>
                <th className="py-3 px-4 font-semibold">下單股數</th>
                <th className="py-3 px-4 font-semibold">預估總金額</th>
                <th className="py-3 px-4 font-semibold">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {steps.map((step) => {
                const isBase = step.type === 'BASE';
                const isSell = step.type === 'SELL';
                const isBuy = step.type === 'BUY';

                let rowBg = 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40';
                if (isBase) rowBg = 'bg-amber-50/50 dark:bg-amber-950/20 font-bold';
                else if (isSell) rowBg = 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10';
                else if (isBuy) rowBg = 'hover:bg-rose-50/40 dark:hover:bg-rose-950/10';

                return (
                  <tr key={step.step} className={`transition-colors ${rowBg}`}>
                    <td className="py-3 px-4 font-medium flex items-center space-x-1.5">
                      {isBase ? (
                        <span className="p-1 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                          <Anchor className="w-3.5 h-3.5" />
                        </span>
                      ) : isSell ? (
                        <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span>
                        {isBase ? '基準開倉 (第 0 階)' : isSell ? `賣出階梯 +${step.step}` : `買進階梯 ${step.step}`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {step.triggerCondition}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      <span className={isBase ? 'text-amber-600' : isSell ? 'text-emerald-600' : 'text-rose-600'}>
                        ${step.price.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-200">
                      {step.shares.toLocaleString()} 股
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-200">
                      ${step.totalCost.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      {isBase ? (
                        <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0">
                          已建底倉
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-300 text-[10px] px-2 py-0">
                          掛單待撮合
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mathematical Symmetry Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-2">
          <Info className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
          <div>
            <strong>Alex Huang 數學對稱原理：</strong>
            跌下來的階梯乘以 $(1-x)$，漲回去乘以 $(1+x)$。在微小 $x$ 下，$(1+x)(1-x) = 1 - x^2 \approx 1$。
            因此腰斬（跌約 7 階）與翻倍（漲約 7 階）的次數近乎完全相同，破除「跌 50% 要漲 100% 回不來」的百分比直覺陷阱！
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
