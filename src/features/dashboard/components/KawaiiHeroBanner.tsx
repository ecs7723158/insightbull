import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Heart, Grid, Building2, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { audio } from '@/features/rpg-waifu/audioService';

interface KawaiiHeroBannerProps {
  score?: number;
  message?: string;
}

export const KawaiiHeroBanner: React.FC<KawaiiHeroBannerProps> = ({
  score = 82,
  message = 'Master，今日台股與美股熱門標的蛛網階梯已就緒！市場震盪時記得「定額買進、定量賣出」喔～🌸',
}) => {
  const handlePoke = () => {
    audio.playPokeSound();
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-6 sm:p-7 text-white shadow-xl">
      {/* Background Decorative Glow */}
      <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div 
            onClick={handlePoke}
            className="cursor-pointer shrink-0 transition-transform active:scale-95 hover:scale-105"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white/30 backdrop-blur-md shadow-lg">
              <img
                src="/waifu/hikari_happy.jpg"
                alt="Hikari Trading Waifu"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Texts */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Badge className="bg-white/20 text-white border-none font-bold text-[11px] px-2.5 py-0.5 backdrop-blur-sm">
                AI 女友 • 小光即時情緒
              </Badge>
              <span className="text-xs bg-pink-400/40 text-pink-100 px-2 py-0.5 rounded-full font-bold">
                💖 {score} 分 (狂熱牛市)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              「{message}」
            </h2>
            <p className="text-xs text-pink-100 mt-1">
              結合 FinBERT 深度輿情、Alex Huang 蛛網造市策略與 TWSE 台股籌碼情資
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link to="/rpg-waifu" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto bg-white text-pink-600 hover:bg-pink-50 rounded-2xl font-bold text-xs shadow-md h-9 px-4"
            >
              <Heart className="w-3.5 h-3.5 mr-1.5 fill-pink-500 text-pink-500" />
              女友冒險專區
            </Button>
          </Link>

          <Link to="/spider-strategy" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto border-white/40 text-white hover:bg-white/20 rounded-2xl font-bold text-xs h-9 px-3.5"
            >
              <Grid className="w-3.5 h-3.5 mr-1.5" />
              蛛網 7上7下模擬
            </Button>
          </Link>

          <Link to="/taiwan-stock" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto border-white/40 text-white hover:bg-white/20 rounded-2xl font-bold text-xs h-9 px-3.5"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              台股籌碼論點
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
