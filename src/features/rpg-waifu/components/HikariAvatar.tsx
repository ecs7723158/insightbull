import React, { useState, useEffect } from 'react';
import { EmotionState } from '../types';
import { audio } from '../audioService';
import { addExpAndAffection } from '../waifuEngine';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Volume2, VolumeX, Sparkles, Heart, Gift, MessageCircleHeart } from 'lucide-react';
import { toast } from 'sonner';

interface HikariAvatarProps {
  emotion: EmotionState;
  compact?: boolean;
  onAffectionChange?: () => void;
}

export const HikariAvatar: React.FC<HikariAvatarProps> = ({
  emotion,
  compact = false,
  onAffectionChange,
}) => {
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [language, setLanguage] = useState<'zh-TW' | 'ja-JP'>('zh-TW');
  const [currentQuote, setCurrentQuote] = useState(emotion.quote);

  useEffect(() => {
    setCurrentQuote(language === 'ja-JP' && emotion.japaneseQuote ? emotion.japaneseQuote : emotion.quote);
  }, [emotion, language]);

  const handlePoke = () => {
    setIsPoking(true);
    setPokeCount(prev => prev + 1);
    audio.playPokeSound();

    const pokeQuotes = [
      '呀！Master 不要亂戳人家啦～（臉紅）',
      '哼～摸頭可以，戳臉頰要收手續費的！',
      'Master 手指好溫暖... 小光今天也會全力幫你盯盤！💖',
      '抓到你了！今天的蛛網單都設置好了嗎？✨',
      '心跳好快...是市場波動還是 Master 的魔法呀？🌸'
    ];
    const randomQuote = pokeQuotes[Math.floor(Math.random() * pokeQuotes.length)];
    setCurrentQuote(randomQuote);

    const { stats, leveledUp } = addExpAndAffection(15, 20);
    if (leveledUp) {
      toast.success(`🎉 小光等級提升到了 Lv.${stats.level}！解鎖新力量！`, {
        description: `稱號更新為：${stats.title}`,
      });
    }

    if (onAffectionChange) onAffectionChange();

    setTimeout(() => {
      setIsPoking(false);
    }, 600);
  };

  const handleSpeak = () => {
    audio.playSparkleSound();
    audio.speak(currentQuote, language);
  };

  const handleSendGift = () => {
    audio.playSparkleSound();
    audio.playCoinSound();
    const { stats, leveledUp } = addExpAndAffection(35, 50);
    toast.success('🎁 贈送了「草莓生乳捲 🍓」給小光！', {
      description: `小光好感度提升到 ${stats.affection} / 1000！心花朵朵開～`,
    });
    setCurrentQuote('哇啊！最喜歡的草莓甜點！謝謝 Master～小光愛死你了！(づ′▽`)づ');
    if (leveledUp) {
      toast.success(`🎉 小光升級為 Lv.${stats.level}！`);
    }
    if (onAffectionChange) onAffectionChange();
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-pink-200/60 shadow-md">
        <div 
          onClick={handlePoke}
          className={`relative cursor-pointer transition-transform duration-300 ${isPoking ? 'scale-110 rotate-3' : 'hover:scale-105'}`}
        >
          <img 
            src={emotion.avatarUrl} 
            alt="小光 Hikari" 
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-400 shadow-sm"
          />
          <span className="absolute -bottom-1 -right-1 text-xs">💖</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xs text-pink-600 dark:text-pink-400">小光 Hikari</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-pink-100 text-pink-700">
              {emotion.badge}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
            {currentQuote}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSpeak}
          className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative group bg-gradient-to-b from-white via-pink-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-pink-200/60 dark:border-pink-500/20 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Background Anime Glow Aura */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: emotion.bgGlow }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)' }}
      />

      {/* Header Tags */}
      <div className="relative flex items-center justify-between mb-4 z-10">
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-sm flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 專屬交易女友 • 小光</span>
          </div>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-none font-medium">
            {emotion.title}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'zh-TW' ? 'ja-JP' : 'zh-TW')}
            className="text-xs text-pink-600 hover:bg-pink-100/60 rounded-full px-2.5 h-7"
          >
            {language === 'zh-TW' ? '🇹🇼 中文' : '🇯🇵 日本語'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-100/60 rounded-full"
            title="語音朗讀小光台詞"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Avatar & Dialogue Box */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center z-10">
        {/* Anime Character Portrait with Interactive Animations */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div 
            onClick={handlePoke}
            className={`relative cursor-pointer transition-all duration-300 transform select-none ${
              isPoking ? 'scale-105 -rotate-2' : 'hover:scale-102'
            }`}
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl p-1.5 bg-gradient-to-tr from-pink-400 via-rose-300 to-purple-400 shadow-xl shadow-pink-500/20">
              <img
                src={emotion.avatarUrl}
                alt="Hikari Trading Waifu"
                className="w-full h-full object-cover rounded-[22px] transition-transform duration-500 group-hover:scale-102"
              />
            </div>
            
            {/* Interactive Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-pink-300 text-pink-600 text-xs font-bold rounded-full shadow-md flex items-center space-x-1 whitespace-nowrap">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
              <span>戳戳互動 +好感</span>
            </div>
          </div>
        </div>

        {/* Dynamic Speech & Action Panel */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {/* Speech Bubble */}
          <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-pink-200 dark:border-pink-500/30 shadow-md">
            <div className="absolute -left-2 top-8 w-4 h-4 bg-white/90 dark:bg-slate-800/90 border-l border-b border-pink-200 dark:border-pink-500/30 transform rotate-45 hidden md:block" />
            
            <div className="flex items-center space-x-2 text-xs font-semibold text-pink-500 mb-1.5">
              <MessageCircleHeart className="w-4 h-4" />
              <span>小光的市場呢喃</span>
            </div>
            
            <p className="text-slate-800 dark:text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
              「{currentQuote}」
            </p>

            <div className="mt-4 pt-3 border-t border-pink-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <span>情緒指數:</span>
                <span className="font-bold text-pink-600 text-sm">{emotion.score} / 100</span>
              </span>
              <span className="text-slate-400">
                點擊次數: {pokeCount} 次
              </span>
            </div>
          </div>

          {/* Emotional State Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>女友當前情緒 (Hikari Mood Index)</span>
              <span className="text-pink-600 font-bold">{emotion.badge}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-pink-100 dark:border-slate-700">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${emotion.color} transition-all duration-700 shadow-sm`}
                style={{ width: `${emotion.score}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={handlePoke}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-xs font-bold px-4 py-2"
            >
              <Heart className="w-3.5 h-3.5 mr-1.5 fill-white" />
              輕摸小光臉頰
            </Button>
            
            <Button
              onClick={handleSendGift}
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold px-4 py-2"
            >
              <Gift className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
              送草莓甜點 (+好感)
            </Button>

            <Button
              onClick={handleSpeak}
              variant="secondary"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 rounded-xl text-xs font-bold px-3 py-2"
            >
              <Volume2 className="w-3.5 h-3.5 mr-1 text-purple-600" />
              語音朗讀
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
