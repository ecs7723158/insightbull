"""
Trading Extension Routes
========================
Integrates:
1. Alex Huang 2017 Spider Strategy (蛛網階梯買賣與 7上7下造市模擬)
2. Taiwan Stock Intelligence (TWSE 行情、三大法人、TDCC 千張大戶籌碼)
3. Stock AI Lab ThesisCard (FIN/MKT 投資論點卡規格)
4. RPG Anime Girlfriend Emotion Index (Hikari 小光情緒量表)
"""

from fastapi import APIRouter, Query
from typing import Dict, Any, List
import math

trading_router = APIRouter(prefix="/api/v1/trading", tags=["Trading Extension"])

@trading_router.get("/spider/ladder")
def get_spider_ladder(
    symbol: str = Query("2330.TW", description="Stock Symbol"),
    base_price: float = Query(1020.0, description="Base Price"),
    step_pct: float = Query(5.0, description="Ladder Step %"),
    levels: int = Query(6, description="Grid Levels"),
    allocation: float = Query(100000.0, description="Allocation per level in TWD"),
    mode: str = Query("fixed_amount", description="fixed_amount or fixed_quantity"),
) -> Dict[str, Any]:
    """Generates Spider Grid Ladder according to Alex Huang 2017 formula."""
    r = step_pct / 100.0
    steps = []

    # Base Level
    base_shares = round(allocation / base_price) if base_price > 0 else 0
    steps.append({
        "step": 0,
        "type": "BASE",
        "price": base_price,
        "shares": base_shares,
        "total_cost": allocation,
        "trigger": "基準建倉位階",
        "status": "FILLED"
    })

    # Downward Buy Steps (定額買進)
    down_price = base_price
    for i in range(1, levels + 1):
        down_price = down_price * (1.0 - r)
        rounded_p = round(down_price, 2)
        shares = round(allocation / rounded_p) if mode == "fixed_amount" and rounded_p > 0 else base_shares
        steps.append({
            "step": -i,
            "type": "BUY",
            "price": rounded_p,
            "shares": shares,
            "total_cost": round(shares * rounded_p, 2),
            "trigger": f"回檔 -{round((1.0 - math.pow(1.0 - r, i)) * 100)}% (第 {i} 階跌幅買進)",
            "status": "PENDING"
        })

    # Upward Sell Steps (定量賣出)
    up_price = base_price
    for i in range(1, levels + 1):
        up_price = up_price * (1.0 + r)
        rounded_p = round(up_price, 2)
        steps.append({
            "step": i,
            "type": "SELL",
            "price": rounded_p,
            "shares": base_shares,
            "total_cost": round(base_shares * rounded_p, 2),
            "trigger": f"上漲 +{round((math.pow(1.0 + r, i) - 1.0) * 100)}% (第 {i} 階高檔獲利出清)",
            "status": "PENDING"
        })

    # Sort descending by price
    steps.sort(key=lambda s: s["price"], reverse=True)

    return {
        "symbol": symbol,
        "base_price": base_price,
        "step_percentage": step_pct,
        "symmetry_formula": "(1+x)(1-x) = 1 - x^2 ≈ 1",
        "mode": mode,
        "levels_count": len(steps),
        "steps": steps
    }


@trading_router.get("/spider/intraday-sim")
def get_intraday_sim(
    symbol: str = Query("2221.TW", description="Stock Symbol"),
    base_price: float = Query(20.0, description="Base Price"),
    step_pct: float = Query(10.0, description="Step %"),
    allocation: float = Query(50000.0, description="Allocation"),
) -> Dict[str, Any]:
    """Simulates Alex Huang 2221 大甲 case study: 7 rounds intraday market maker oscillation (14 fills)."""
    r = step_pct / 100.0
    buy_price = round(base_price * (1.0 - r), 2)
    sell_price = round(base_price * (1.0 + r), 2)
    shares = round(allocation / base_price) if base_price > 0 else 0
    profit_per_round = round((sell_price - buy_price) * shares, 2)

    events = []
    cum_profit = 0.0
    time_slots = [
        "09:18:24", "09:45:10", "10:22:35", "11:05:40",
        "11:48:15", "12:30:50", "13:14:02"
    ]

    for round_num in range(1, 8):
        cum_profit += profit_per_round
        t = time_slots[round_num - 1]
        events.append({
            "round": round_num,
            "time": t,
            "type": "BUY",
            "price": buy_price,
            "shares": shares,
            "cash_flow": -(buy_price * shares),
            "cum_profit": cum_profit - profit_per_round,
            "comment": f"下探 ${buy_price} 觸發定額掛單買進"
        })
        events.append({
            "round": round_num,
            "time": t[:-2] + "55",
            "type": "SELL",
            "price": sell_price,
            "shares": shares,
            "cash_flow": sell_price * shares,
            "cum_profit": cum_profit,
            "comment": f"反彈 ${sell_price} 獲利賣出，第 {round_num} 輪獲利 ${profit_per_round}"
        })

    return {
        "symbol": symbol,
        "base_price": base_price,
        "spread_gain_per_round": profit_per_round,
        "total_rounds": 7,
        "total_executions": 14,
        "total_realized_profit": cum_profit,
        "events": events
    }


@trading_router.get("/taiwan/quotes")
def get_taiwan_quotes() -> List[Dict[str, Any]]:
    """Returns TWSE quotes with institutional and TDCC concentration telemetry."""
    return [
        {
            "symbol": "2330.TW",
            "name": "台積電",
            "industry": "半導體製造",
            "price": 1025.0,
            "change": 25.0,
            "change_pct": 2.50,
            "foreign_buy": 14850,
            "trust_buy": 2310,
            "dealer_buy": 840,
            "super_concentration": 87.4,
            "monthly_rev_yoy": 33.8,
            "sentiment_score": 88
        },
        {
            "symbol": "2454.TW",
            "name": "聯發科",
            "industry": "IC 設計",
            "price": 1315.0,
            "change": 35.0,
            "change_pct": 2.73,
            "foreign_buy": 3410,
            "trust_buy": 820,
            "dealer_buy": -150,
            "super_concentration": 68.2,
            "monthly_rev_yoy": 19.2,
            "sentiment_score": 78
        },
        {
            "symbol": "2317.TW",
            "name": "鴻海",
            "industry": "電子代工與 AI 伺服器",
            "price": 198.5,
            "change": 3.5,
            "change_pct": 1.79,
            "foreign_buy": 21500,
            "trust_buy": 1450,
            "dealer_buy": 1120,
            "super_concentration": 64.9,
            "monthly_rev_yoy": 21.4,
            "sentiment_score": 82
        },
        {
            "symbol": "0050.TW",
            "name": "元大台灣50",
            "industry": "指數型 ETF",
            "price": 196.2,
            "change": 2.8,
            "change_pct": 1.45,
            "foreign_buy": 5200,
            "trust_buy": -320,
            "dealer_buy": 1800,
            "super_concentration": 51.5,
            "monthly_rev_yoy": 0.0,
            "sentiment_score": 72
        }
    ]


@trading_router.get("/waifu/mood")
def get_waifu_mood(score: int = Query(75, ge=0, le=100)) -> Dict[str, Any]:
    """Returns Hikari RPG Anime Girlfriend emotion telemetry and voiced quote."""
    if score >= 85:
        level = "ecstatic"
        title = "💖 欣喜若狂 (Super Bull)"
        quote = "哇啊啊！Master 太厲害啦！整個市場都在為我們放煙火～今天一定要請我吃草莓聖代喔！🍓✨"
        ja = "ご主人様、すごーい！市場が私たちのために輝いてるよ～！"
    elif score >= 65:
        level = "sweet"
        title = "🌸 甜美安心 (Mild Bull)"
        quote = "行情穩步向上，看到紅通通的盤面好安心呀～有 Master 在，小光一點都不慌！"
        ja = "安定していて安心だね。ご主人様と一緒なら心強いよ！"
    elif score >= 45:
        level = "playful"
        title = "✨ 俏皮期待 (Sideways Volatility)"
        quote = "嘻嘻～上下洗盤正是蛛網策略的本命舞台！「7上7下」每一階都在替我們賺便當錢呢～！"
        ja = "レンジ相場こそクモの巣戦略の出番！７往復全部いただきだよ～！"
    elif score >= 25:
        level = "tsundere"
        title = "⚡ 傲嬌緊張 (Market Dip)"
        quote = "哼！回檔震盪而已，慌張什麼呀？笨蛋 Master！跌下來的階梯算好了沒？定額加碼單快掛上啦！"
        ja = "べ、別に心配なんかしてないんだからね！ちゃんと定額で買い下がってよ、バカ！"
    else:
        level = "worried"
        title = "🌧️ 委屈抱抱 (Deep Bear Panic)"
        quote = "嗚嗚...大盤連續跳空大跌好恐怖... Master 快抱抱我！千萬不要硬扛，記得用選擇權或現金額度避險喔！"
        ja = "急落怖いよ…ぎゅってして…！オプションヘッジと現金比率を絶対守ってね！"

    return {
        "score": score,
        "level": level,
        "title": title,
        "quote": quote,
        "japanese_quote": ja,
        "avatar_url": f"/waifu/hikari_{'happy' if score >= 85 else 'playful' if score >= 45 else 'tsundere' if score >= 25 else 'worried'}.jpg"
    }
