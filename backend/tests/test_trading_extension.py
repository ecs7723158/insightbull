"""
Unit tests for Trading Extension
================================
Tests Alex Huang Spider Strategy, Taiwan Stock Quotes, and Anime Waifu Mood.
Directly imports trading_extension module without database dependencies.
"""

import unittest
import sys
import os
import importlib.util

module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__),
    '../app/presentation/routes/trading_extension.py'
))

spec = importlib.util.spec_from_file_location("trading_extension", module_path)
trading_ext = importlib.util.module_from_spec(spec)
sys.modules["trading_extension"] = trading_ext
spec.loader.exec_module(trading_ext)

get_spider_ladder = trading_ext.get_spider_ladder
get_intraday_sim = trading_ext.get_intraday_sim
get_waifu_mood = trading_ext.get_waifu_mood
get_taiwan_quotes = trading_ext.get_taiwan_quotes

class TestTradingExtension(unittest.TestCase):

    def test_spider_ladder_symmetry(self):
        """Tests that ladder prices follow geometric progression P0 * (1 - r)^k and P0 * (1 + r)^k."""
        res = get_spider_ladder(
            symbol="2330.TW",
            base_price=1000.0,
            step_pct=10.0,
            levels=3,
            allocation=100000.0,
            mode="fixed_amount"
        )
        self.assertEqual(res["symbol"], "2330.TW")
        self.assertEqual(res["base_price"], 1000.0)
        self.assertEqual(res["levels_count"], 7)  # 1 base + 3 down + 3 up

        steps = {s["step"]: s for s in res["steps"]}
        self.assertEqual(steps[0]["price"], 1000.0)
        self.assertEqual(steps[-1]["price"], 900.0)  # 1000 * 0.9
        self.assertEqual(steps[-2]["price"], 810.0)  # 900 * 0.9
        self.assertEqual(steps[1]["price"], 1100.0)  # 1000 * 1.1

        # Fixed amount accumulates more shares at cheaper prices
        self.assertGreater(steps[-2]["shares"], steps[-1]["shares"])

    def test_intraday_seven_rounds_simulation(self):
        """Tests the famous 2221 大甲 7-up-7-down 14 fill simulation."""
        res = get_intraday_sim(
            symbol="2221.TW",
            base_price=20.0,
            step_pct=10.0,
            allocation=50000.0
        )
        self.assertEqual(res["total_rounds"], 7)
        self.assertEqual(res["total_executions"], 14)
        self.assertGreater(res["total_realized_profit"], 0.0)
        self.assertEqual(len(res["events"]), 14)

    def test_waifu_mood_score_mapping(self):
        """Tests Hikari mood score mappings."""
        ecstatic = get_waifu_mood(95)
        self.assertEqual(ecstatic["level"], "ecstatic")
        self.assertIn("hikari_happy.jpg", ecstatic["avatar_url"])

        sweet = get_waifu_mood(75)
        self.assertEqual(sweet["level"], "sweet")

        playful = get_waifu_mood(55)
        self.assertEqual(playful["level"], "playful")

        tsundere = get_waifu_mood(35)
        self.assertEqual(tsundere["level"], "tsundere")
        self.assertIn("hikari_tsundere.jpg", tsundere["avatar_url"])

        worried = get_waifu_mood(15)
        self.assertEqual(worried["level"], "worried")
        self.assertIn("hikari_worried.jpg", worried["avatar_url"])

    def test_taiwan_stock_quotes(self):
        """Tests TWSE quotes telemetry."""
        quotes = get_taiwan_quotes()
        self.assertGreaterEqual(len(quotes), 4)
        symbols = [q["symbol"] for q in quotes]
        self.assertIn("2330.TW", symbols)
        self.assertIn("2454.TW", symbols)

if __name__ == '__main__':
    unittest.main()
