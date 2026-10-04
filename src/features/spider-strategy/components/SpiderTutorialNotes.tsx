import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, TrendingUp, Calculator } from 'lucide-react';

export const SpiderTutorialNotes: React.FC = () => {
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-lg bg-white/95 dark:bg-slate-900/95">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
            Alex Huang 蛛網策略教學精要與實戰心法
          </CardTitle>
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            源自 2017 經典長文解析
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5 text-xs">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>1. 破除百分比陷阱：對稱的數學本質</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              坊間常說「跌 50% 要漲 100% 才能回本，所以一定要停損」。Alex Huang 實證以階梯計算：
            </p>
            <div className="font-mono text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-700">
              跌階梯 (每次 ×0.9): 100 &gt; 90 &gt; 81 &gt; 73 &gt; 66 &gt; 59 &gt; 53 (7 階腰斬)<br />
              漲階梯 (每次 ×1.1): 53 &gt; 58 &gt; 64 &gt; 71 &gt; 78 &gt; 86 &gt; 94 &gt; 104 (7 階翻倍)
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              在極小 $x$ 下，(1 + x) × (1 - x) ≈ 1。腰斬與翻倍的階梯數幾乎完全相等！
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 flex items-center space-x-1.5 text-xs">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>2. 造市者原理：回測看不見的「7上7下」</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              用傳統日 K 棒（開高低收四價）無法看出日內震盪。2221 大甲實單曾創下單日震盪 7 次、共撮合 14 筆成交（7買7賣）！
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <strong>「我是 Market Maker，我提供了流動性」</strong>：過去的歷史報價中沒有這個成交，是因為有了你的雙向掛單，才創造出撮合機會。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center space-x-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>3. 台股 1008 檔大回測：飆股極端值成因</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              回測勝率高達 59.7%，但總期望值為負。核心原因是像大立光（3008）等飆股持續往上漲，無限制空出導致巨大帳面虧損。
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
              統計顯示：虧損最大的前 15 檔就佔了總虧損的 84%！剔除這些極端飆股後，期望值立刻翻正。實戰需採取「現股底倉賣完即換股」原則。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center space-x-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. 實戰防護：定額買進與選擇權避險</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <strong>定額買進 vs 定量賣出</strong>：股市急跌緩漲容易跳空，下跌時用定額買進（跌深買更多股）平衡成本；往上賣出時採定量賣出維持籌碼。
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <strong>避險絕不融資</strong>：只做現股持股，不用資券防斷頭。若擔心股災，以低隱含波動率的台指選擇權買權/賣權或保留充足緩衝資金避險。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
