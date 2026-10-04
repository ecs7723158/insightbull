import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { 
  LayoutDashboard, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Grid,
  Building2,
  Sparkles
} from "lucide-react";
import { MarketCountdown } from "@/shared/components/MarketCountdown";
import { FloatingWaifuWidget } from "@/features/rpg-waifu/components/FloatingWaifuWidget";
import { getEmotionState } from "@/features/rpg-waifu/waifuEngine";

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isKawaiiMode, setIsKawaiiMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('insightbull_kawaii_mode');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const toggleKawaiiMode = () => {
    const next = !isKawaiiMode;
    setIsKawaiiMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('insightbull_kawaii_mode', JSON.stringify(next));
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      highlight: false
    },
    {
      name: "🌸 女友情緒指數",
      href: "/rpg-waifu",
      icon: Heart,
      highlight: true
    },
    {
      name: "🕸️ 蛛網策略教學",
      href: "/spider-strategy",
      icon: Grid,
      highlight: true
    },
    {
      name: "🇹🇼 台股與論點卡",
      href: "/taiwan-stock",
      icon: Building2,
      highlight: true
    },
    {
      name: "Stock Analysis",
      href: "/analysis",
      icon: Search,
      highlight: false
    },
    {
      name: "Sentiment vs Price",
      href: "/sentiment-vs-price",
      icon: TrendingUp,
      highlight: false
    },
    {
      name: "Correlation Analysis",
      href: "/correlation",
      icon: BarChart3,
      highlight: false
    },
    {
      name: "Sentiment Trends",
      href: "/trends",
      icon: Activity,
      highlight: false
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
      highlight: false
    }
  ];

  const waifuEmotion = getEmotionState(78);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isKawaiiMode 
        ? "bg-gradient-to-br from-pink-50/40 via-purple-50/20 to-blue-50/30" 
        : "bg-gradient-to-br from-slate-50 to-blue-50"
    }`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50/40 shadow-2xl border-r ${
        isKawaiiMode ? "border-pink-200/50" : "border-gray-200/50"
      } backdrop-blur-sm transition-all duration-300 z-40 ${isSidebarOpen ? "w-64" : "w-16"}`}>
        {/* Header */}
        <div className={`p-5 border-b shadow-lg transition-all duration-500 ${
          isKawaiiMode 
            ? "border-pink-400/20 bg-gradient-to-br from-pink-600 via-rose-600 to-purple-700" 
            : "border-blue-400/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700"
        }`}>
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex-1">
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-bold text-xl text-white leading-tight tracking-tight">
                    InsightBull
                  </h1>
                  {isKawaiiMode && <span className="text-base animate-pulse">🌸</span>}
                </div>
                <p className="text-pink-100 text-xs mt-0.5 font-medium">
                  {isKawaiiMode ? "AI 萌化女友 • 蛛網量化" : "Stock Sentiment Platform"}
                </p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-white hover:bg-white/20 hover:text-white transition-all hover:scale-110"
            >
              {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Mode Switcher Button */}
        {isSidebarOpen && (
          <div className="px-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleKawaiiMode}
              className={`w-full text-xs font-bold rounded-xl border transition-all ${
                isKawaiiMode
                  ? "bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100"
                  : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
              <span>{isKawaiiMode ? "🌸 萌化動漫模式 (ON)" : "💼 專業簡約模式 (OFF)"}</span>
            </Button>
          </div>
        )}

        {/* Market Status in Sidebar */}
        {isSidebarOpen && (
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <div className={`absolute inset-0 rounded-xl blur-sm ${
                isKawaiiMode ? "bg-gradient-to-br from-pink-400/20 to-purple-400/20" : "bg-gradient-to-br from-blue-400/20 to-indigo-400/20"
              }`}></div>
              <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 shadow-md hover:shadow-lg transition-all">
                <MarketCountdown variant="detailed" />
              </div>
            </div>
          </div>
        )}
        {!isSidebarOpen && (
          <div className="flex justify-center py-4 px-2">
            <MarketCountdown variant="compact" />
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <div className={`group relative ${
                  !isSidebarOpen ? "flex justify-center" : ""
                }`}>
                  {isActive && isSidebarOpen && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${
                      isKawaiiMode ? "bg-gradient-to-b from-pink-500 to-rose-600" : "bg-gradient-to-b from-blue-600 to-indigo-600"
                    }`}></div>
                  )}
                  <Button 
                    variant="ghost"
                    className={`w-full transition-all duration-200 ${
                      !isSidebarOpen 
                        ? "px-0 w-12 h-12 justify-center rounded-xl" 
                        : "justify-start px-3.5 py-2.5 rounded-xl"
                    } ${
                      isActive 
                        ? isKawaiiMode
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md scale-102"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                        : item.highlight && isKawaiiMode
                          ? "text-pink-700 bg-pink-50/60 hover:bg-pink-100/70"
                          : "text-gray-700 hover:bg-slate-100 hover:text-blue-700"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${
                      isSidebarOpen ? "mr-2.5" : ""
                    } ${
                      isActive ? "text-white" : item.highlight ? "text-pink-500 group-hover:scale-110 transition-transform" : "group-hover:scale-110 transition-transform"
                    }`} />
                    {isSidebarOpen && (
                      <span className="font-semibold text-xs tracking-tight">{item.name}</span>
                    )}
                  </Button>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Floating Waifu Companion Widget */}
      <FloatingWaifuWidget emotion={waifuEmotion} />
    </div>
  );
};

export default UserLayout;
