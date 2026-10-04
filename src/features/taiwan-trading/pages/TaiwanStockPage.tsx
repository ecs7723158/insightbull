import React, { useState } from 'react';
import UserLayout from '@/shared/components/layouts/UserLayout';
import { TAIWAN_STOCKS_DATA, DEMO_THESIS_CARD_2330 } from '../mockTaiwanData';
import { TaiwanStockQuote, ThesisCardData } from '../types';
import { TaiwanStockOverview } from '../components/TaiwanStockOverview';
import { ThesisCardViewer } from '../components/ThesisCardViewer';
import { HikariAvatar } from '@/features/rpg-waifu/components/HikariAvatar';
import { getEmotionState } from '@/features/rpg-waifu/waifuEngine';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { Building2, Layers, Grid, Sparkles, ExternalLink } from 'lucide-react';

export const TaiwanStockPage: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<TaiwanStockQuote>(TAIWAN_STOCKS_DATA[0]);

  // Create or adapt ThesisCard for the selected stock
  const currentCard: ThesisCardData = selectedStock.symbol === '2330.TW'
    ? DEMO_THESIS_CARD_2330
    : {
        ...DEMO_THESIS_CARD_2330,
        ticker: selectedStock.symbol,
        company: selectedStock.name,
        business_one_liner: `${selectedStock.name} 是台灣 ${selectedStock.industry} 代表性企業，市值與流動性俱佳。`,
        status: 'PARTIAL',
        why_might_work: [
          `三大法人累計買賣超正面，千張大戶持股比例達 ${selectedStock.superConcentration}%`,
          `月營收年增率 (YoY) 達 ${selectedStock.monthlyRevenueYoY}%，基本面動能強勁`,
          `本益比僅 ${selectedStock.peRatio} 倍，殖利率 ${selectedStock.dividendYield}%，評價具吸引力`
        ],
        why_might_fail: [
          `全球宏觀需求波動影響電子產業拉貨動能`,
          `原物料與研發資本支出增加可能壓縮營業利益率`
        ],
      };

  const waifuQuote = `Master 正在看 ${selectedStock.name} (${selectedStock.symbol}) 呢！千張大戶持股高達 ${selectedStock.superConcentration}%，很適合布建蛛網階梯喔！🌸`;
  const emotion = getEmotionState(selectedStock.sentimentScore, waifuQuote);

  return (
    <UserLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>台灣股票情報 • 籌碼集中度與三大法人工作台</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                🇹🇼 台股情資與 FIN/MKT 投資論點卡
              </h1>
              <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                整合 TWSE 日行情、TDCC 千張大戶週集保、三大法人買賣超，並以 stock-ai-lab 的 ThesisCard 標準 schema 自動建構多空情境推演。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/spider-strategy">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl shadow-lg font-bold text-xs h-11 px-5">
                  <Grid className="w-4 h-4 mr-1.5" />
                  為此標的布建蛛網策略
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Compact Companion Reaction */}
        <HikariAvatar
          emotion={emotion}
          compact={true}
        />

        {/* Taiwan Stock Quotes & Institutional Table */}
        <TaiwanStockOverview
          selectedStock={selectedStock}
          onSelectStock={(stk) => setSelectedStock(stk)}
        />

        {/* Active Stock ThesisCard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>{selectedStock.name} ({selectedStock.symbol}) 投資論點卡 (ThesisCard)</span>
            </h2>
            <Badge variant="outline" className="border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40">
              stock-ai-lab v0.1.0 規範
            </Badge>
          </div>

          <ThesisCardViewer card={currentCard} />
        </div>
      </div>
    </UserLayout>
  );
};
