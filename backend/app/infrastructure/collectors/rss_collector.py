"""
RSS and Financial News Feed Collector
======================================

Collects financial news and sentiment articles using standard RSS/Atom feeds
and financial news APIs without requiring paid API keys.

Supported Sources:
1. Google News Financial RSS (US & Taiwan stocks, localized search)
2. Yahoo Finance RSS (General market feed + symbol-specific headline feeds)
3. Anue 鉅亨網 (Taiwan's premier financial news feed)
4. Custom user-subscribed RSS feeds

Key Advantages:
- 100% Free, unlimited, and highly reliable (no API key required)
- Real-time updates matching live market trading
- Covers both US Tech equities (NVDA, AAPL, TSLA) and Taiwan equities (2330, 2454, 2317)
"""

import re
import html
import asyncio
from datetime import datetime, timezone
import email.utils
from typing import List, Dict, Any, Optional
import httpx
import feedparser

from app.utils.timezone import utc_now
from app.infrastructure.log_system import get_logger
from .base_collector import (
    BaseCollector,
    DataSource,
    RawData,
    CollectionConfig,
    CollectionResult,
    CollectionError
)

logger = get_logger()

# Common mapping for Taiwan stock names to optimize Google News RSS search
TAIWAN_STOCK_NAMES = {
    "2330": "台積電 TSMC",
    "2454": "聯發科 MediaTek",
    "2317": "鴻海 Foxconn",
    "2382": "廣達 Quanta",
    "0050": "元大台灣50 ETF",
    "2221": "大甲",
    "2308": "台達電 Delta",
    "2412": "中華電 Chunghwa Telecom",
    "2881": "富邦金 Fubon",
    "2882": "國泰金 Cathay"
}

# Common mapping for US stock names to optimize RSS search
US_STOCK_NAMES = {
    "AAPL": "Apple",
    "MSFT": "Microsoft",
    "NVDA": "NVIDIA",
    "GOOGL": "Google Alphabet",
    "GOOG": "Google Alphabet",
    "AMZN": "Amazon",
    "META": "Meta Facebook",
    "TSLA": "Tesla",
    "AMD": "AMD",
    "INTC": "Intel",
    "AVGO": "Broadcom",
    "ORCL": "Oracle",
    "PLTR": "Palantir",
    "CRM": "Salesforce",
    "QCOM": "Qualcomm",
    "MU": "Micron",
    "IBM": "IBM"
}


class RSSCollector(BaseCollector):
    """
    High-reliability RSS & Financial Feed Collector.
    Provides free, up-to-date market news articles for sentiment analysis.
    """

    REQUEST_TIMEOUT = 12.0
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

    def __init__(self, rate_limiter=None, custom_feeds: Optional[List[str]] = None):
        """
        Initialize RSS Collector.
        
        Args:
            rate_limiter: Optional rate limiting handler
            custom_feeds: Optional list of additional custom RSS feed URLs
        """
        super().__init__(api_key=None, rate_limiter=rate_limiter)
        self.custom_feeds = custom_feeds or []
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def source(self) -> DataSource:
        return DataSource.RSS

    @property
    def requires_api_key(self) -> bool:
        return False

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or initialize the async HTTP client"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                headers={
                    "User-Agent": self.USER_AGENT,
                    "Accept": "application/rss+xml, application/xml, application/json, text/xml, */*",
                    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                },
                timeout=self.REQUEST_TIMEOUT,
                follow_redirects=True
            )
        return self._client

    async def close(self):
        """Close HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def validate_connection(self) -> bool:
        """Validate connection by fetching a sample Google News RSS feed"""
        try:
            client = await self._get_client()
            resp = await client.get("https://news.google.com/rss/search?q=NVDA+stock&hl=en-US&gl=US&ceid=US:en")
            return resp.status_code == 200
        except Exception as e:
            logger.warning(f"RSS connection validation error: {e}", component="rss_collector")
            return False

    async def collect_data(self, config: CollectionConfig) -> CollectionResult:
        """
        Collect articles from financial RSS feeds for configured symbols.
        """
        start_time = utc_now()
        collected_data: List[RawData] = []
        error_count = 0

        logger.info(
            f"Starting RSS feed collection for {len(config.symbols)} symbols",
            component="rss_collector",
            symbols=config.symbols,
            date_range_start=config.date_range.start_date.isoformat(),
            date_range_end=config.date_range.end_date.isoformat()
        )

        try:
            self._validate_config(config)
            await self._apply_rate_limit()

            # 1. Collect per-symbol feeds concurrently with semaphore
            sem = asyncio.Semaphore(4)

            async def _collect_symbol_safe(symbol: str) -> List[RawData]:
                nonlocal error_count
                async with sem:
                    try:
                        return await self._collect_for_symbol(symbol.upper(), config)
                    except Exception as e:
                        error_count += 1
                        logger.warning(
                            f"Error collecting RSS feed for {symbol}: {e}",
                            component="rss_collector",
                            symbol=symbol
                        )
                        return []

            tasks = [_collect_symbol_safe(s) for s in config.symbols]
            results = await asyncio.gather(*tasks)
            for res in results:
                collected_data.extend(res)

            # 2. Also collect general Taiwan financial headlines if any Taiwan symbol is monitored
            has_tw_symbol = any(re.match(r'^\d{4}$', s) or s in TAIWAN_STOCK_NAMES for s in config.symbols)
            if has_tw_symbol:
                try:
                    cnyes_data = await self._collect_cnyes_headlines(config)
                    collected_data.extend(cnyes_data)
                except Exception as e:
                    logger.debug(f"CNYES headline collection note: {e}")

            # 3. Deduplicate by URL or text
            seen_hashes = set()
            unique_data = []
            for item in collected_data:
                key = (item.stock_symbol, item.text[:60])
                if key not in seen_hashes:
                    seen_hashes.add(key)
                    unique_data.append(item)

            execution_time = (utc_now() - start_time).total_seconds()
            logger.info(
                f"RSS collection complete: {len(unique_data)} items collected across {len(config.symbols)} symbols",
                component="rss_collector",
                items_collected=len(unique_data),
                symbols_processed=len(config.symbols),
                errors=error_count,
                execution_time=round(execution_time, 2)
            )

            return CollectionResult(
                source=self.source,
                success=True,
                data=unique_data,
                execution_time=execution_time
            )

        except Exception as e:
            execution_time = (utc_now() - start_time).total_seconds()
            err_msg = f"RSS collection failed: {str(e)}"
            logger.error(err_msg, component="rss_collector", error_type=type(e).__name__)
            return CollectionResult(
                source=self.source,
                success=False,
                data=[],
                error_message=err_msg,
                execution_time=execution_time
            )

    async def _collect_for_symbol(self, symbol: str, config: CollectionConfig) -> List[RawData]:
        """Collect RSS news entries for a specific stock symbol"""
        client = await self._get_client()
        items: List[RawData] = []
        max_items = config.max_items_per_symbol

        # Build search queries & RSS URLs
        is_tw_stock = bool(re.match(r'^\d{4}$', symbol)) or symbol in TAIWAN_STOCK_NAMES
        name = TAIWAN_STOCK_NAMES.get(symbol, US_STOCK_NAMES.get(symbol, symbol))

        feed_urls = []

        if is_tw_stock:
            # Google News RSS (Taiwan Traditional Chinese)
            q_tw = f"{symbol} {name} 台股"
            feed_urls.append((
                f"https://news.google.com/rss/search?q={httpx.URL('', params={'q': q_tw}).query.decode('utf-8').replace('q=', '')}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
                "GoogleNews-TW"
            ))
            # Yahoo Taiwan Stock RSS
            feed_urls.append((
                f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}.TW",
                "YahooFinance-TW"
            ))
        else:
            # Google News RSS (US / Global English)
            q_us = f"{symbol} {name} stock"
            feed_urls.append((
                f"https://news.google.com/rss/search?q={httpx.URL('', params={'q': q_us}).query.decode('utf-8').replace('q=', '')}&hl=en-US&gl=US&ceid=US:en",
                "GoogleNews-US"
            ))
            # Yahoo Finance Symbol Feed
            feed_urls.append((
                f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}",
                "YahooFinance"
            ))

        for url, provider in feed_urls:
            if len(items) >= max_items:
                break
            try:
                resp = await client.get(url)
                if resp.status_code != 200:
                    continue

                feed = feedparser.parse(resp.text)
                for entry in feed.entries:
                    if len(items) >= max_items:
                        break

                    raw_item = self._parse_feed_entry(entry, symbol, provider, config)
                    if raw_item:
                        items.append(raw_item)
            except Exception as e:
                logger.debug(f"Feed {provider} fetch failed for {symbol}: {e}")

        return items

    async def _collect_cnyes_headlines(self, config: CollectionConfig) -> List[RawData]:
        """Collect Taiwan financial news from Anue 鉅亨網 API"""
        client = await self._get_client()
        items: List[RawData] = []
        try:
            url = "https://news.cnyes.com/api/v3/news/category/headline?limit=25"
            resp = await client.get(url)
            if resp.status_code != 200:
                return items

            data = resp.json()
            articles = data.get("items", {}).get("data", [])
            for art in articles:
                title = art.get("title", "")
                summary = art.get("summary", "")
                text = f"{title}. {summary}".strip()
                if not text:
                    continue

                # Match against monitored symbols
                matched_symbol = None
                for sym in config.symbols:
                    sym_name = TAIWAN_STOCK_NAMES.get(sym, sym)
                    if sym in text or (sym_name and any(part in text for part in sym_name.split())):
                        matched_symbol = sym
                        break

                if not matched_symbol:
                    # If not explicitly matched, assign to first monitored TW symbol or 2330
                    continue

                publish_at = art.get("publishAt")
                ts = datetime.fromtimestamp(publish_at, tz=timezone.utc) if publish_at else utc_now()

                news_id = art.get("newsId")
                art_url = f"https://news.cnyes.com/news/id/{news_id}" if news_id else None

                items.append(RawData(
                    source=DataSource.RSS,
                    content_type="article",
                    text=text,
                    timestamp=ts,
                    stock_symbol=matched_symbol,
                    url=art_url,
                    metadata={"provider": "Anue 鉅亨網", "category": "headline"}
                ))
        except Exception as e:
            logger.debug(f"Failed to fetch CNYES news: {e}")

        return items

    def _parse_feed_entry(
        self,
        entry: Any,
        symbol: str,
        provider: str,
        config: CollectionConfig
    ) -> Optional[RawData]:
        """Parse RSS feed entry into RawData object"""
        title = getattr(entry, 'title', '').strip()
        summary = getattr(entry, 'summary', '').strip()
        link = getattr(entry, 'link', None)

        # Clean HTML tags and decode entities
        clean_title = re.sub(r'<[^>]+>', '', title)
        clean_title = html.unescape(clean_title).strip()

        clean_summary = re.sub(r'<[^>]+>', '', summary)
        clean_summary = html.unescape(clean_summary).strip()

        if clean_summary and clean_summary != clean_title:
            text = f"{clean_title}. {clean_summary}"
        else:
            text = clean_title

        if not text:
            return None

        # Parse publication timestamp
        dt = None
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            try:
                dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            except Exception:
                pass

        if dt is None and hasattr(entry, 'published'):
            try:
                dt = email.utils.parsedate_to_datetime(entry.published)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
            except Exception:
                pass

        if dt is None:
            dt = utc_now()

        # Filter by date range if specified
        if config.date_range and dt < config.date_range.start_date:
            return None

        return RawData(
            source=DataSource.RSS,
            content_type="article",
            text=text,
            timestamp=dt,
            stock_symbol=symbol,
            url=link,
            metadata={"provider": provider}
        )
