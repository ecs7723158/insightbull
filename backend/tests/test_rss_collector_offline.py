"""Offline unit tests for RSSCollector.

No network. HTTP is a mock feed. Does not load torch or the database.
"""

import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from app.infrastructure.collectors.base_collector import (
    CollectionConfig,
    DataSource,
    DateRange,
)
from app.infrastructure.collectors.collector_settings import COLLECTOR_SETTINGS
from app.infrastructure.collectors.rss_collector import RSSCollector


def _config(symbols, max_items=5):
    return CollectionConfig(
        symbols=symbols,
        date_range=DateRange(
            start_date=datetime(2026, 9, 1, tzinfo=timezone.utc),
            end_date=datetime(2026, 10, 4, tzinfo=timezone.utc),
        ),
        max_items_per_symbol=max_items,
    )


def _response(status=200, text="", json_body=None):
    resp = MagicMock()
    resp.status_code = status
    resp.text = text
    resp.json = MagicMock(return_value=json_body or {})
    return resp


NVDA_FEED = """<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>NVDA beats estimates</title>
    <description>Data center demand &amp; supply</description>
    <link>https://example.test/nvda</link>
    <pubDate>Sat, 03 Oct 2026 12:00:00 +0000</pubDate>
  </item>
  <item>
    <title>NVDA beats estimates</title>
    <description>Data center demand &amp; supply</description>
    <link>https://example.test/nvda-dup</link>
    <pubDate>Sat, 03 Oct 2026 13:00:00 +0000</pubDate>
  </item>
  <item>
    <title>&lt;b&gt;Old headline&lt;/b&gt;</title>
    <description>stale</description>
    <link>https://example.test/old</link>
    <pubDate>Wed, 01 Jan 2020 00:00:00 +0000</pubDate>
  </item>
</channel></rss>
"""

TW_FEED = """<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>2330 台積電營收</title>
    <description>法說會</description>
    <link>https://example.test/2330</link>
    <pubDate>Sat, 03 Oct 2026 12:00:00 +0000</pubDate>
  </item>
</channel></rss>
"""


class TestRSSCollectorOffline(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.collector = RSSCollector()

    async def asyncTearDown(self):
        await self.collector.close()

    def test_source_and_settings_need_no_key(self):
        self.assertEqual(self.collector.source, DataSource.RSS)
        self.assertFalse(self.collector.requires_api_key)
        self.assertIn("rss", COLLECTOR_SETTINGS)
        self.assertFalse(COLLECTOR_SETTINGS["rss"].requires_api_key)
        self.assertEqual(DataSource.RSS.value, "rss")

    def test_parse_strips_html_and_drops_items_before_range(self):
        config = _config(["NVDA"])
        fresh = SimpleNamespace(
            title="NVDA <b>rallies</b>",
            summary="chips <i>up</i> &amp; demand",
            link="https://example.test/new",
            published="Sat, 03 Oct 2026 12:00:00 +0000",
        )
        stale = SimpleNamespace(
            title="old",
            summary="",
            link="https://example.test/old",
            published_parsed=(2020, 1, 1, 0, 0, 0, 0, 0, 0),
        )
        empty = SimpleNamespace(title="   ", summary="", link=None)

        item = self.collector._parse_feed_entry(fresh, "NVDA", "GoogleNews-US", config)
        self.assertIsNotNone(item)
        self.assertEqual(item.text, "NVDA rallies. chips up & demand")
        self.assertNotIn("<", item.text)
        self.assertEqual(item.stock_symbol, "NVDA")
        self.assertEqual(item.source, DataSource.RSS)
        self.assertIsNone(self.collector._parse_feed_entry(stale, "NVDA", "GoogleNews-US", config))
        self.assertIsNone(self.collector._parse_feed_entry(empty, "NVDA", "GoogleNews-US", config))

    async def test_collect_mock_feed_dedup_and_encoded_urls(self):
        async def fake_get(url):
            if "cnyes.com" in url:
                return _response(
                    json_body={
                        "items": {
                            "data": [
                                {
                                    "title": "台積電法說",
                                    "summary": "2330 展望穩健",
                                    "publishAt": 1759500000,
                                    "newsId": 42,
                                },
                                {
                                    "title": "天氣",
                                    "summary": "與個股無關",
                                    "publishAt": 1759500000,
                                    "newsId": 43,
                                },
                            ]
                        }
                    }
                )
            if "zh-TW" in url or ".TW" in url:
                return _response(text=TW_FEED)
            if "news.google.com" in url or "yahoo.com" in url:
                return _response(text=NVDA_FEED)
            return _response(status=404, text="")

        client = MagicMock()
        client.is_closed = False
        client.get = AsyncMock(side_effect=fake_get)
        client.aclose = AsyncMock()
        self.collector._client = client

        result = await self.collector.collect_data(_config(["NVDA", "2330"]))
        self.assertTrue(result.success, result.error_message)
        urls = [call.args[0] for call in client.get.await_args_list]
        self.assertTrue(urls)
        self.assertTrue(any("news.google.com/rss/search?q=" in url for url in urls))
        self.assertFalse(any(" " in url for url in urls))
        self.assertTrue(any("2330.TW" in url for url in urls))
        self.assertTrue(any("cnyes.com" in url for url in urls))

        nvda = [item for item in result.data if item.stock_symbol == "NVDA"]
        self.assertEqual(len(nvda), 1)
        self.assertIn("NVDA beats estimates", nvda[0].text)
        self.assertNotIn("Old headline", " ".join(item.text for item in result.data))

        tw = [item for item in result.data if item.stock_symbol == "2330"]
        self.assertGreaterEqual(len(tw), 1)
        self.assertTrue(any("台積電" in item.text or "2330" in item.text for item in tw))
        cnyes = [item for item in tw if item.metadata.get("provider") == "Anue 鉅亨網"]
        self.assertEqual(len(cnyes), 1)
        self.assertEqual(cnyes[0].url, "https://news.cnyes.com/news/id/42")

    async def test_http_error_skips_feed_and_still_succeeds(self):
        client = MagicMock()
        client.is_closed = False
        client.get = AsyncMock(return_value=_response(status=503, text="nope"))
        client.aclose = AsyncMock()
        self.collector._client = client

        result = await self.collector.collect_data(_config(["AAPL"]))
        self.assertTrue(result.success)
        self.assertEqual(result.data, [])


if __name__ == "__main__":
    unittest.main()
