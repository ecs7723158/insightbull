import React, { useState } from 'react';
import { TaiwanStockQuote } from '../types';
import { TAIWAN_STOCKS_DATA } from '../mockTaiwanData';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { TrendingUp, TrendingDown, Users, Building2, BarChart2, Search, ArrowRight } from 'lucide-react';
import { audio } from '@/features/rpg-waifu/audioService';

interface TaiwanStockOverviewProps {
  selectedStock: TaiwanStockQuote;
  onSelectStock: (stock: TaiwanStockQuote) => void;
}

export const TaiwanStockOverview: React.FC<TaiwanStockOverviewProps> = ({
  selectedStock,
  onSelectStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = TAIWAN_STOCKS_DATA.filter(s =>
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.includes(searchTerm) ||
    s.industry.includes(searchTerm)
  );

  const handleStockClick = (stock: TaiwanStockQuote) => {
    audio.playPokeSound();
    onSelectStock(stock);
  };

  return (
    <div className="space-y-4">
      {/* Search and Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="搜尋代號、名稱、產業 (如 2330, 台積電)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>共收錄 <strong>{TAIWAN_STOCKS_DATA.length}</strong> 檔權值與實戰標的</span>
        </div>
      </div>

      {/* Stocks Table */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-lg bg-white/95 dark:bg-slate-900/95 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">代號 / 名稱</th>
                  <th className="py-3 px-4 font-semibold">最新成交價</th>
                  <th className="py-3 px-4 font-semibold">漲跌幅</th>
                  <th className="py-3 px-4 font-semibold">三大法人買賣超 (張)</th>
                  <th className="py-3 px-4 font-semibold">千張大戶持股 %</th>
                  <th className="py-3 px-4 font-semibold">月營收年增 (YoY)</th>
                  <th className="py-3 px-4 font-semibold">AI 情緒值</th>
                  <th className="py-3 px-4 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStocks.map((stock) => {
                  const isSelected = selectedStock.symbol === stock.symbol;
                  const isUp = stock.change >= 0;
                  const totalInstitutional = stock.foreignBuy + stock.trustBuy + stock.dealerBuy;

                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => handleStockClick(stock)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-pink-50/70 dark:bg-pink-950/20 font-semibold'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {stock.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                              {stock.symbol}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{stock.industry}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        ${stock.price.toFixed(1)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`flex items-center space-x-1 ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className={totalInstitutional >= 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            合計: {totalInstitutional > 0 ? '+' : ''}{totalInstitutional.toLocaleString()}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            外資 {stock.foreignBuy > 0 ? '+' : ''}{stock.foreignBuy} │ 投信 {stock.trustBuy > 0 ? '+' : ''}{stock.trustBuy}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {stock.superConcentration}%
                          </span>
                          {stock.superConcentration >= 70 && (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-[10px] px-1.5 py-0 border-none">
                              高集中
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={stock.monthlyRevenueYoY >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {stock.monthlyRevenueYoY > 0 ? '+' : ''}{stock.monthlyRevenueYoY}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-pink-600">
                            {stock.sentimentScore}
                          </span>
                          <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                              style={{ width: `${stock.sentimentScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-xl"
                        >
                          <span>查看論點卡</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
