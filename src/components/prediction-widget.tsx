"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketIndex } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Gauge, Check, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PredictionWidgetProps {
    spyData?: MarketIndex;
    daxData?: MarketIndex;
    vixData?: MarketIndex;
}

export function PredictionWidget({ spyData, daxData, vixData }: PredictionWidgetProps) {
    const [selectedMarket, setSelectedMarket] = useState<"SPY" | "DAX">("SPY");

    const data = selectedMarket === "SPY" ? spyData : daxData;
    const marketName = selectedMarket === "SPY" ? "S&P 500 (SPY)" : "DAX 40";

    if (!data?.price || !data.fiftyDayAverage || !data.twoHundredDayAverage || !data.fiftyTwoWeekHigh) {
        return (
            <Card className="w-full">
                <CardHeader><CardTitle>Market Forecast</CardTitle></CardHeader>
                <CardContent>Loading technical data...</CardContent>
            </Card>
        );
    }

    // Multi-Factor Scoring Logic
    const price = data.price;
    const ma50 = data.fiftyDayAverage;
    const ma200 = data.twoHundredDayAverage;
    const high52 = data.fiftyTwoWeekHigh;
    const change = data.changePercent || 0;

    // VIX Logic
    const vixPrice = vixData?.price || 0;
    const isVixCalm = vixPrice < 20;
    const isVixHigh = vixPrice > 30;

    let score = 0;
    // 1. Trend: Price > 50 DMA
    const above50 = price > ma50;
    if (above50) score++;

    // 2. Long Term Trend: Price > 200 DMA
    const above200 = price > ma200;
    if (above200) score++;

    // 3. Momentum: Positive Daily Change
    const positiveMom = change > 0;
    if (positiveMom) score++;

    // 4. Strength: Near 52-Week High (within 5%)
    const nearHigh = price > (high52 * 0.95);
    if (nearHigh) score++;

    // 5. VIX Factor (Bonus/Penalty)
    // If VIX is calm (<20), add 0.5 or 1 point? Let's just create a new 5 point scale or keep it simple.
    // Plan says "New Criterion". Let's use it to augment the score.
    if (isVixCalm) score++;

    // Sentiment Determination
    let sentiment = "NEUTRAL";
    let color = "text-yellow-500";
    let bg = "bg-yellow-500/10";
    let icon = Gauge;

    // Max score is now 5
    if (score >= 4) {
        sentiment = score === 5 ? "STRONG BULLISH 🚀" : "BULLISH 📈";
        color = "text-green-500";
        bg = "bg-green-500/10";
        icon = TrendingUp;
    } else if (score <= 1) { // 0 or 1
        sentiment = "BEARISH 🐻";
        color = "text-red-500";
        bg = "bg-red-500/10";
        icon = TrendingDown;
    } else if (isVixHigh) {
        // Override if VIX is extremely high
        sentiment = "EXTREME FEAR 😱";
        color = "text-red-600";
        bg = "bg-red-600/10";
        icon = AlertTriangle;
    }

    return (
        <Card className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Gauge className={`h-6 w-6 ${color}`} />
                    Market Forecast
                </CardTitle>
                <div className="flex space-x-2">
                    <Button
                        variant={selectedMarket === "SPY" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMarket("SPY")}
                    >
                        S&P 500
                    </Button>
                    <Button
                        variant={selectedMarket === "DAX" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMarket("DAX")}
                    >
                        DAX
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">

                    {/* Score & Sentiment */}
                    <div className={`p-4 rounded-xl flex items-center justify-between ${bg} border border-zinc-200 dark:border-zinc-800`}>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground block mb-1">Outlook for {marketName}</span>
                            <div className={`text-2xl font-black tracking-tight ${color}`}>
                                {sentiment}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-muted-foreground block mb-1">Score</span>
                            <div className="text-3xl font-bold">{score}/5</div>
                        </div>
                    </div>

                    {/* Criteria Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black border">
                            <span className="flex items-center text-muted-foreground">
                                Short Trend ({'>'} 50DMA)
                            </span>
                            {above50 ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black border">
                            <span className="flex items-center text-muted-foreground">
                                Long Trend ({'>'} 200DMA)
                            </span>
                            {above200 ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black border">
                            <span className="flex items-center text-muted-foreground">
                                Momentum ({'>'} 0%)
                            </span>
                            {positiveMom ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black border">
                            <div className="flex flex-col">
                                <span className="flex items-center text-muted-foreground">
                                    Strength (Near Highs)
                                </span>
                                <span className="text-[10px] text-zinc-400">Within 5% of 52W High</span>
                            </div>
                            {nearHigh ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                        </div>

                        {/* VIX Criterion */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black border md:col-span-2">
                            <div className="flex flex-col">
                                <span className="flex items-center text-muted-foreground font-semibold">
                                    Fear Gauge (VIX)
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                    Current: {vixPrice.toFixed(2)} | Low Volatility ({'<'} 20) is Bullish
                                </span>
                            </div>
                            {isVixCalm ? (
                                <div className="flex items-center text-green-500 font-bold text-xs gap-1">
                                    <ShieldCheck className="h-5 w-5" /> CALM
                                </div>
                            ) : isVixHigh ? (
                                <div className="flex items-center text-red-500 font-bold text-xs gap-1">
                                    <AlertTriangle className="h-5 w-5" /> FEAR
                                </div>
                            ) : (
                                <div className="flex items-center text-yellow-500 font-bold text-xs gap-1">
                                    <AlertTriangle className="h-5 w-5" /> ELEVATED
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
