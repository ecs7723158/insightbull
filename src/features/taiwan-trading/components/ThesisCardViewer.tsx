import React from 'react';
import { ThesisCardData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle2, XCircle, AlertOctagon, TrendingUp, Compass, ShieldAlert, FileText, Info } from 'lucide-react';

interface ThesisCardViewerProps {
  card: ThesisCardData;
}

export const ThesisCardViewer: React.FC<ThesisCardViewerProps> = ({ card }) => {
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl bg-white/95 dark:bg-slate-900/95 overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <Badge className="bg-blue-500 text-white text-[11px] font-mono">
                FIN / MKT ThesisCard {card.schema_version}
              </Badge>
              <Badge variant="outline" className="text-blue-300 border-blue-400/30 text-[11px]">
                Market: {card.market}
              </Badge>
              <Badge className="bg-emerald-600 text-white text-[11px]">
                {card.status}
              </Badge>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-white">
              {card.company} ({card.ticker})
            </CardTitle>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              {card.business_one_liner}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <p>基準日期: {card.as_of}</p>
            <p className="text-[11px] text-pink-300 mt-1">使用者自決；FIN 不下單</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 text-xs sm:text-sm">
        {/* Why Might Work vs Why Might Fail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Why Might Work */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2.5">
            <div className="flex items-center space-x-2 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>核心多頭論點 (Why Might Work)</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {card.why_might_work.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>

          {/* Why Might Fail */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2.5">
            <div className="flex items-center space-x-2 font-bold text-rose-800 dark:text-rose-300">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>潛在失效風險 (Why Might Fail)</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {card.why_might_fail.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scenarios: Bull / Base / Bear */}
        <div className="space-y-3">
          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>三種情境推演 (Bull / Base / Bear Scenarios)</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Bull */}
            <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-pink-700 dark:text-pink-300 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-pink-600" />
                  <span>多頭情境 (Bull)</span>
                </span>
                <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0">
                  {card.scenarios.bull.label}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.scenarios.bull.thesis_implication}
              </p>
              <div className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                觸發: {card.scenarios.bull.triggers.join('; ')}
              </div>
            </div>

            {/* Base */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>基準情境 (Base)</span>
                </span>
                <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">
                  {card.scenarios.base.label}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.scenarios.base.thesis_implication}
              </p>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                觸發: {card.scenarios.base.triggers.join('; ')}
              </div>
            </div>

            {/* Bear */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-300 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>保守防守 (Bear)</span>
                </span>
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                  {card.scenarios.bear.label}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.scenarios.bear.thesis_implication}
              </p>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                觸發: {card.scenarios.bear.triggers.join('; ')}
              </div>
            </div>
          </div>
        </div>

        {/* Kill Criteria & Valuation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Kill Criteria */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>終止條件 / 停損警示 (Kill Criteria)</span>
            </p>
            <ul className="space-y-1 list-disc list-inside text-xs text-slate-600 dark:text-slate-300">
              {card.kill_criteria.map((kc, idx) => (
                <li key={idx}>{kc}</li>
              ))}
            </ul>
          </div>

          {/* Valuation Framework */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="font-bold text-xs text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>評價模型 (Valuation Framework)</span>
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              方法: {card.valuation_framework.method} (不確定性: {card.valuation_framework.uncertainty})
            </p>
            <ul className="space-y-1 list-disc list-inside text-xs text-slate-600 dark:text-slate-300">
              {card.valuation_framework.assumptions.map((asmp, idx) => (
                <li key={idx}>{asmp}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer / Policy Footer */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{card.disclaimer}</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{card.position_policy}</span>
        </div>
      </CardContent>
    </Card>
  );
};
