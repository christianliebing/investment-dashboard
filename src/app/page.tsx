"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getMarketData, MarketIndex } from "@/lib/market-data";
import { MarketCard } from "@/components/market-card";
import { PredictionWidget } from "@/components/prediction-widget";
import { Watchlist } from "@/components/watchlist";
import { Rankings } from "@/components/rankings";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    if (!data?.price || !data.fiftyDayAverage) return 50;
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

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

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
      if (isManualRefresh) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, [savedSymbols]);

  // Re-fetch when watchlist changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  const vixData = indices.find(i => i.symbol === "^VIX");

  // Selected Data for Prediction Widget
  const activeData = indices.find(i => i.symbol === selectedSymbol);

  // Exclude VIX from cards
  const visibleCards = indices.filter(i => i.symbol !== "^VIX");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 p-4 md:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
                Investment Dashboard
              </h1>
            </div>
            {lastUpdated && (
              <div className="flex items-center text-xs text-muted-foreground ml-14 gap-1">
                <Clock className="h-3 w-3" />
                <span>Last updated: {lastUpdated}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content Area (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Prediction Widget */}
            {loading ? (
              <div className="h-[400px] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-700">
                <PredictionWidget
                  symbol={selectedSymbol}
                  data={activeData}
                  vixData={vixData}
                  onSelectSymbol={setSelectedSymbol}
                />
              </div>
            )}

            {/* Market Cards Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-zinc-700 dark:text-zinc-300">Market Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))
                ) : (
                  visibleCards.map((index, i) => (
                    <div
                      key={index.symbol}
                      className="animate-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${i * 50}ms`, animationDuration: '500ms' }}
                    >
                      <MarketCard index={index} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Right column) */}
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              <>
                <div className="h-[300px] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-[400px] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </>
            ) : (
              <>
                <div className="animate-in slide-in-from-right-4 duration-700">
                  <Watchlist
                    savedSymbols={savedSymbols}
                    onUpdateSymbols={updateWatchlist}
                    onSelectSymbol={setSelectedSymbol}
                    marketData={indices}
                  />
                </div>
                <div className="animate-in slide-in-from-right-4 duration-700 delay-100">
                  <Rankings
                    marketData={indices}
                    vixData={vixData}
                    onSelectSymbol={setSelectedSymbol}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-8">
          <h2 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-zinc-200">Market Insights</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Data provided live by Yahoo Finance. Updates automatically every 60s. Predictions based on weighted technical analysis (50/200 DMA, Volume, VIX, 52-week position) and do not constitute financial advice.
          </p>
        </section>
      </main>
    </div>
  );
}
