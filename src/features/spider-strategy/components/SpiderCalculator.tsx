import React from 'react';
import { SpiderConfig } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Sliders, RefreshCw, Wand2 } from 'lucide-react';
import { audio } from '@/features/rpg-waifu/audioService';

interface SpiderCalculatorProps {
  config: SpiderConfig;
  onChange: (config: SpiderConfig) => void;
}

export const SpiderCalculator: React.FC<SpiderCalculatorProps> = ({ config, onChange }) => {
  const handleQuickPreset = (preset: '2330' | '2221' | '0050' | 'NVDA') => {
    audio.playPokeSound();
    if (preset === '2330') {
      onChange({
        symbol: '2330.TW (台積電)',
        basePrice: 1020,
        stepPercentage: 5,
        gridLevels: 6,
        allocationPerLevel: 100000,
        mode: 'fixed_amount',
        hedgeWithOptions: true,
      });
    } else if (preset === '2221') {
      onChange({
        symbol: '2221.TW (大甲 實戰經典)',
        basePrice: 20,
        stepPercentage: 10,
        gridLevels: 6,
        allocationPerLevel: 50000,
        mode: 'fixed_amount',
        hedgeWithOptions: false,
      });
    } else if (preset === '0050') {
      onChange({
        symbol: '0050.TW (元大台灣50)',
        basePrice: 195,
        stepPercentage: 5,
        gridLevels: 8,
        allocationPerLevel: 60000,
        mode: 'fixed_amount',
        hedgeWithOptions: true,
      });
    } else {
      onChange({
        symbol: 'NVDA (NVIDIA)',
        basePrice: 125,
        stepPercentage: 8,
        gridLevels: 6,
        allocationPerLevel: 3000,
        mode: 'fixed_amount',
        hedgeWithOptions: false,
      });
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-lg bg-white/95 dark:bg-slate-900/95">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-pink-500" />
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
              蛛網策略參數配置器 (Spider Grid Configurator)
            </CardTitle>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 mr-1">熱門預設:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPreset('2330')}
              className="h-7 text-xs rounded-xl px-2.5 hover:bg-pink-50 hover:text-pink-600"
            >
              2330 台積電
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPreset('2221')}
              className="h-7 text-xs rounded-xl px-2.5 hover:bg-purple-50 hover:text-purple-600"
            >
              2221 大甲
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPreset('0050')}
              className="h-7 text-xs rounded-xl px-2.5 hover:bg-blue-50 hover:text-blue-600"
            >
              0050 ETF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            標的代碼與名稱
          </Label>
          <Input
            value={config.symbol}
            onChange={(e) => onChange({ ...config, symbol: e.target.value })}
            className="rounded-xl h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            基準開倉價 ($)
          </Label>
          <Input
            type="number"
            value={config.basePrice}
            onChange={(e) => onChange({ ...config, basePrice: parseFloat(e.target.value) || 0 })}
            className="rounded-xl h-9 text-xs font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            階距百分比 (%)
          </Label>
          <Select
            value={config.stepPercentage.toString()}
            onValueChange={(val) => onChange({ ...config, stepPercentage: parseInt(val) })}
          >
            <SelectTrigger className="rounded-xl h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5% (穩健密集網格)</SelectItem>
              <SelectItem value="8">8% (中型波動網格)</SelectItem>
              <SelectItem value="10">10% (Alex Huang 經典標準階距)</SelectItem>
              <SelectItem value="15">15% (高波飆股寬網格)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            單階預算金額 ($)
          </Label>
          <Input
            type="number"
            value={config.allocationPerLevel}
            onChange={(e) => onChange({ ...config, allocationPerLevel: parseFloat(e.target.value) || 0 })}
            className="rounded-xl h-9 text-xs font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
};
