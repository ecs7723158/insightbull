import React, { useState } from 'react';
import { EmotionState } from '../types';
import { audio } from '../audioService';
import { Button } from '@/shared/components/ui/button';
import { Volume2, VolumeX, MessageCircleHeart, X, Sparkles, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FloatingWaifuWidgetProps {
  emotion: EmotionState;
}

export const FloatingWaifuWidget: React.FC<FloatingWaifuWidgetProps> = ({ emotion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(audio.isSoundEnabled());

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setSoundEnabled(next);
    audio.setVoiceEnabled(next);
  };

  const handleMascotClick = () => {
    audio.playPokeSound();
    setIsOpen(!isOpen);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.playSparkleSound();
    audio.speak(emotion.quote);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Dialogue Balloon */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-4 border border-pink-200 dark:border-pink-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-slate-800">
            <div className="flex items-center space-x-1.5">
              <span className="text-base">🌸</span>
              <span className="font-bold text-xs text-pink-600 dark:text-pink-400">小光 (Hikari)</span>
              <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-medium">
                {emotion.score} 分
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                className="h-6 w-6 text-slate-400 hover:text-pink-500 rounded-full"
                title={soundEnabled ? '靜音' : '開啟音效'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-pink-500" /> : <VolumeX className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="py-3">
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              「{emotion.quote}」
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeak}
              className="text-[11px] h-7 text-pink-600 border-pink-200 hover:bg-pink-50 rounded-xl"
            >
              <Volume2 className="w-3 h-3 mr-1" />
              聽小光說話
            </Button>

            <Link to="/rpg-waifu" onClick={() => setIsOpen(false)}>
              <Button
                size="sm"
                className="text-[11px] h-7 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-sm"
              >
                <span>女友專屬特區</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Mascot Button */}
      <div
        onClick={handleMascotClick}
        className="group relative cursor-pointer select-none transition-transform active:scale-95 hover:scale-105"
      >
        {/* Pulsing Glow Ring */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity animate-pulse" />

        <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-400 via-rose-300 to-purple-400 shadow-xl overflow-hidden border-2 border-white dark:border-slate-800">
          <img
            src="/waifu/hikari_chibi.jpg"
            alt="小光 Mascot"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Emotion Indicator Dot */}
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] shadow-sm animate-bounce"
          style={{ backgroundColor: '#ec4899' }}
        >
          💖
        </div>
      </div>
    </div>
  );
};
