"use client";

import { useEffect, useState, useCallback } from "react";
import { getMarketData, MarketIndex } from "@/lib/market-data";
import { MarketCard } from "@/components/market-card";
import { PredictionWidget } from "@/components/prediction-widget";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock } from "lucide-react";

export default function Home() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMarketData();
      setIndices(data);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
    } catch (error) {
      console.error("Failed to fetch market data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial fetch

    const interval = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  const spyData = indices.find(i => i.symbol === "SPY");
  const daxData = indices.find(i => i.symbol === "^GDAXI");
  const vixData = indices.find(i => i.symbol === "^VIX");

  // Exclude SPY/VIX from the main cards list, keep indexes
  const marketIndices = indices.filter(i => i.symbol !== "SPY" && i.symbol !== "^VIX");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <main className="max-w-5xl mx-auto space-y-6">
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
            disabled={loading}
            className={loading ? "animate-spin" : ""}
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </header>

        {/* Prediction Widget */}
        {!loading && (
          <section>
            <PredictionWidget
              spyData={spyData}
              daxData={daxData}
              vixData={vixData}
            />
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ))
          ) : (
            marketIndices.map((index) => (
              <MarketCard key={index.symbol} index={index} />
            ))
          )}
        </div>

        <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-2">Market Insights</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Data provided live by Yahoo Finance. Updates automatically every 60s. Predictions based on technical analysis (50/200 DMA, VIX) and do not constitute financial advice.
          </p>
        </section>
      </main>
    </div>
  );
}
