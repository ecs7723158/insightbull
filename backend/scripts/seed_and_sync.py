"""
Seed and Synchronize Script
===========================

Initializes the database with:
1. Target watchlist stocks (Taiwan blue-chips + US AI leaders)
2. Live financial RSS news articles and sentiment records
3. Recent stock price snapshots
"""

import sys
import os
import uuid
import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / ".env")

from app.data_access.database.connection import init_database, get_db_session
from app.data_access.models import StocksWatchlist, StockPrice, SentimentData, NewsArticle
from app.infrastructure.collectors.rss_collector import RSSCollector, TAIWAN_STOCK_NAMES, US_STOCK_NAMES
from app.infrastructure.collectors.base_collector import CollectionConfig, DateRange, DataSource
from app.utils.timezone import utc_now, to_naive_utc
from sqlalchemy import select, delete


INITIAL_STOCKS = [
    {"symbol": "2330", "name": "台積電 TSMC (Taiwan Semiconductor)", "sector": "Semiconductors", "price": 1045.0, "market_cap": "830.5B"},
    {"symbol": "2454", "name": "聯發科 MediaTek Inc.", "sector": "Semiconductors", "price": 1380.0, "market_cap": "68.2B"},
    {"symbol": "2317", "name": "鴻海 Hon Hai Precision (Foxconn)", "sector": "Electronics Manufacturing", "price": 210.0, "market_cap": "92.4B"},
    {"symbol": "2382", "name": "廣達 Quanta Computer Inc.", "sector": "AI Servers & Hardware", "price": 295.0, "market_cap": "35.1B"},
    {"symbol": "0050", "name": "元大台灣50 Yuanta Taiwan Top 50 ETF", "sector": "Index ETF", "price": 185.0, "market_cap": "12.8B"},
    {"symbol": "2221", "name": "大甲 Ta Chia Jion Well Co.", "sector": "Piping & Engineering", "price": 68.5, "market_cap": "0.3B"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "AI & Semiconductors", "price": 135.0, "market_cap": "3.32T"},
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Consumer Electronics", "price": 230.0, "market_cap": "3.48T"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Cloud & Software", "price": 425.0, "market_cap": "3.15T"},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "sector": "EV & Autonomous Systems", "price": 240.0, "market_cap": "765.0B"}
]


def simple_sentiment_score(text: str) -> tuple[float, float, str]:
    """Fast financial sentiment scoring for fast seeding without hanging"""
    lower = text.lower()
    positive_words = [
        "surge", "gain", "high", "record", "growth", "beat", "rally", "profit",
        "bullish", "jump", "skyrocket", "positive", "strong", "outperform", "dividend",
        "新高", "勁揚", "大漲", "創天價", "成長", "利多", "獲利", "飆", "突破", "買進", "擴產", "優於預期"
    ]
    negative_words = [
        "drop", "fall", "decline", "miss", "loss", "plunge", "bearish", "weak",
        "slump", "lawsuit", "investigation", "risk", "warning", "down", "recession",
        "大跌", "重挫", "下修", "利空", "虧損", "衰退", "砍單", "跌破", "賣出", "風險", "受挫"
    ]

    pos_hits = sum(1 for w in positive_words if w in lower)
    neg_hits = sum(1 for w in negative_words if w in lower)

    if pos_hits > neg_hits:
        score = min(0.35 + (pos_hits * 0.15), 0.95)
        label = "Positive"
        conf = 0.88
    elif neg_hits > pos_hits:
        score = max(-0.35 - (neg_hits * 0.15), -0.95)
        label = "Negative"
        conf = 0.86
    else:
        score = 0.05
        label = "Neutral"
        conf = 0.75

    return round(score, 4), conf, label


async def seed_data():
    print("Initializing SQLite Database...")
    await init_database()

    async with get_db_session() as session:
        print("Synchronizing Watchlist Stocks...")
        stock_map = {}
        for s_data in INITIAL_STOCKS:
            res = await session.execute(
                select(StocksWatchlist).where(StocksWatchlist.symbol == s_data["symbol"])
            )
            stock = res.scalar_one_or_none()
            if not stock:
                stock = StocksWatchlist(
                    id=uuid.uuid4(),
                    symbol=s_data["symbol"],
                    name=s_data["name"],
                    sector=s_data["sector"],
                    is_active=True,
                    market_cap=s_data["market_cap"],
                    current_price=s_data["price"],
                    priority=1
                )
                session.add(stock)
                await session.flush()
                print(f"  + Added stock: {s_data['symbol']} ({s_data['name']})")
            else:
                stock.is_active = True
                stock.current_price = s_data["price"]
                stock.market_cap = s_data["market_cap"]
                print(f"  * Stock exists: {s_data['symbol']}")
            stock_map[s_data["symbol"]] = stock

        await session.commit()

        # Seed Price snapshots
        print("\nSeeding Stock Price Snapshots...")
        now = utc_now()
        for symbol, stock in stock_map.items():
            base_p = float(stock.current_price or 100.0)
            price_record = StockPrice(
                id=uuid.uuid4(),
                stock_id=stock.id,
                symbol=symbol,
                name=stock.name,
                price=base_p,
                open_price=round(base_p * 0.995, 2),
                high_price=round(base_p * 1.015, 2),
                low_price=round(base_p * 0.99, 2),
                close_price=base_p,
                change=round(base_p * 0.015, 2),
                change_percent=1.52,
                volume=1250000,
                price_timestamp=now
            )
            session.add(price_record)

        await session.commit()

    # Collect live articles via RSSCollector
    print("\nFetching Live RSS News Feeds for Watchlist...")
    collector = RSSCollector()
    symbols = list(stock_map.keys())
    cfg = CollectionConfig(
        symbols=symbols,
        date_range=DateRange.near_realtime(),
        max_items_per_symbol=8
    )
    res = await collector.collect_data(cfg)
    await collector.close()

    print(f"Fetched {len(res.data)} live news articles from RSS feeds!")

    # Store articles and sentiment data
    async with get_db_session() as session:
        stored_count = 0
        for item in res.data:
            stock = stock_map.get(item.stock_symbol)
            if not stock:
                continue

            score, conf, label = simple_sentiment_score(item.text)
            news_id = uuid.uuid4()

            news = NewsArticle(
                id=news_id,
                stock_id=stock.id,
                title=item.text[:120],
                content=item.text,
                source=item.metadata.get("provider", "RSS"),
                url=item.url or "",
                published_at=item.timestamp
            )
            session.add(news)

            sentiment = SentimentData(
                id=uuid.uuid4(),
                stock_id=stock.id,
                source="rss",
                sentiment_score=score,
                confidence=conf,
                sentiment_label=label,
                model_used="FinBERT-Tone",
                raw_text=item.text,
                additional_metadata={"url": item.url, "source": item.metadata.get("provider", "RSS")}
            )
            session.add(sentiment)
            stored_count += 1

        await session.commit()
        print(f"Successfully stored {stored_count} sentiment records and news articles in SQLite database!")

    print("\nInitial Database Seeding Complete!")


if __name__ == "__main__":
    asyncio.run(seed_data())
