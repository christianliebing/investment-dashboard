"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getMarketData, MarketIndex } from "@/lib/market-data";
import { MarketCard } from "@/components/market-card";
import { PredictionWidget } from "@/components/prediction-widget";
import { Watchlist } from "@/components/watchlist";
import { Rankings } from "@/components/rankings";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock } from "lucide-react";

export default function Home() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Watchlist State
  const [savedSymbols, setSavedSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("SPY");

  // Load watchlist from local storage
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      try {
        setSavedSymbols(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
  }, []);

  // Save watchlist to local storage
  const updateWatchlist = (symbols: string[]) => {
    setSavedSymbols(symbols);
    localStorage.setItem("watchlist", JSON.stringify(symbols));
  };

  // Track previous score to trigger notifications on change
  const prevScoreRef = useRef<number>(0);

  const calculateScore = (data: MarketIndex, vixData?: MarketIndex) => {
    if (!data?.price || !data.fiftyDayAverage) return 0;
    let score = 0;
    if (data.price > data.fiftyDayAverage) score++;
    if (data.twoHundredDayAverage && data.price > data.twoHundredDayAverage) score++;
    if ((data.changePercent || 0) > 0) score++;
    if (data.fiftyTwoWeekHigh && data.price > (data.fiftyTwoWeekHigh * 0.95)) score++;
    if (vixData && (vixData.price || 0) < 20) score++;
    return score;
  };

  const checkNotifications = (spyData: MarketIndex, vixData?: MarketIndex) => {
    const currentScore = calculateScore(spyData, vixData);
    const prevScore = prevScoreRef.current;

    if (currentScore > prevScore && currentScore >= 3 && Notification.permission === "granted") {
      new Notification("Market Upgrade! 🚀", {
        body: `S&P 500 Sentiment is now BULLISH (Score: ${currentScore}/5). Time to look?`,
        icon: "/icon.png"
      });
    }
    prevScoreRef.current = currentScore;
  };

  const fetchData = useCallback(async () => {
    // loading state only on initial load to avoid flickering
    // setLoading(true); 
    try {
      const data = await getMarketData(savedSymbols);
      setIndices(data);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());

      const spy = data.find(i => i.symbol === "SPY");
      const vix = data.find(i => i.symbol === "^VIX");

      // Check for notifications after data load
      if (spy) {
        checkNotifications(spy, vix);
      }

    } catch (error) {
      console.error("Failed to fetch market data", error);
    } finally {
      setLoading(false);
    }
  }, [savedSymbols]);

  // Re-fetch when watchlist changes
  useEffect(() => {
    fetchData();
  }, [fetchData]); // dependencies handled in useCallback but savedSymbols change triggers new callback

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  const vixData = indices.find(i => i.symbol === "^VIX");

  // Selected Data for Prediction Widget
  const activeData = indices.find(i => i.symbol === selectedSymbol);

  // Exclude SPY/VIX/DAX and Watchlist items from the "Main" cards list if we want clean overview
  // But user might want to see watchlist items as cards too?
  // Let's keep the original logic: Show default indices separately?
  // Actually, usually you want to see your watchlist cards.
  // Let's filter: Show everything except VIX (it's in the widget).
  const visibleCards = indices.filter(i => i.symbol !== "^VIX");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <main className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Market Overview
            </h1>
            {lastUpdated && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Last updated: {lastUpdated}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            className={loading ? "animate-spin" : ""}
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Widget (Main Column) */}
          <div className="lg:col-span-2 space-y-6">
            {!loading && (
              <PredictionWidget
                symbol={selectedSymbol}
                data={activeData}
                vixData={vixData}
                onSelectSymbol={setSelectedSymbol}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                ))
              ) : (
                visibleCards.map((index) => (
                  <MarketCard key={index.symbol} index={index} />
                ))
              )}
            </div>
          </div>

          {/* Watchlist & Rankings (Sidebar) */}
          <div className="lg:col-span-1 space-y-4">
            <Watchlist
              savedSymbols={savedSymbols}
              onUpdateSymbols={updateWatchlist}
              onSelectSymbol={setSelectedSymbol}
              marketData={indices}
            />
            <Rankings
              marketData={indices}
              vixData={vixData}
              onSelectSymbol={setSelectedSymbol}
            />
          </div>
        </div>

        <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-8">
          <h2 className="text-lg font-semibold mb-2">Market Insights</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Data provided live by Yahoo Finance. Updates automatically every 60s. Predictions based on technical analysis (50/200 DMA, VIX) and do not constitute financial advice.
          </p>
        </section>
      </main>
    </div>
  );
}
