"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketIndex } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Gauge, Check, X, AlertTriangle, Bell, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PriceChart } from "./price-chart";

interface PredictionWidgetProps {
    symbol: string;
    data?: MarketIndex;
    vixData?: MarketIndex;
    onSelectSymbol: (symbol: string) => void;
}

// Calculate weighted score (0-100)
function calculateWeightedScore(data: MarketIndex, vixData?: MarketIndex) {
    if (!data?.price || !data.fiftyDayAverage) return { score: 50, breakdown: [] };

    const price = data.price;
    const ma50 = data.fiftyDayAverage;
    const ma200 = data.twoHundredDayAverage || ma50;
    const high52 = data.fiftyTwoWeekHigh || price * 1.2;
    const low52 = data.fiftyTwoWeekLow || price * 0.8;
    const change = data.changePercent || 0;
    const volume = data.regularMarketVolume || 0;
    const avgVolume = data.averageVolume || volume;
    const vixPrice = vixData?.price || 20;

    let totalWeightedScore = 0;
    let maxPossibleScore = 0;
    const breakdown: Array<{ name: string, score: number, weight: number, contribution: number, status: 'bullish' | 'neutral' | 'bearish' }> = [];

    // 1. Price vs 50DMA (Weight: 2x)
    const weight1 = 2;
    const dist50 = ((price - ma50) / ma50) * 100;
    let score1 = 0;
    if (dist50 > 2) score1 = 1;
    else if (dist50 < -2) score1 = -1;
    totalWeightedScore += score1 * weight1;
    maxPossibleScore += weight1;
    breakdown.push({
        name: `50DMA Distance (${dist50.toFixed(1)}%)`,
        score: score1,
        weight: weight1,
        contribution: score1 * weight1,
        status: score1 > 0 ? 'bullish' : score1 < 0 ? 'bearish' : 'neutral'
    });

    // 2. Price vs 200DMA (Weight: 1.5x)
    const weight2 = 1.5;
    const dist200 = ((price - ma200) / ma200) * 100;
    let score2 = 0;
    if (dist200 > 2) score2 = 1;
    else if (dist200 < -2) score2 = -1;
    totalWeightedScore += score2 * weight2;
    maxPossibleScore += weight2;
    breakdown.push({
        name: `200DMA Distance (${dist200.toFixed(1)}%)`,
        score: score2,
        weight: weight2,
        contribution: score2 * weight2,
        status: score2 > 0 ? 'bullish' : score2 < 0 ? 'bearish' : 'neutral'
    });

    // 3. Momentum Strength (Weight: 1x)
    const weight3 = 1;
    let score3 = 0;
    if (change > 1) score3 = 1;
    else if (change < -1) score3 = -1;
    totalWeightedScore += score3 * weight3;
    maxPossibleScore += weight3;
    breakdown.push({
        name: `Momentum (${change.toFixed(2)}%)`,
        score: score3,
        weight: weight3,
        contribution: score3 * weight3,
        status: score3 > 0 ? 'bullish' : score3 < 0 ? 'bearish' : 'neutral'
    });

    // 4. 52-Week Position (Weight: 1.5x)
    const weight4 = 1.5;
    const range52 = high52 - low52;
    const position52 = ((price - low52) / range52) * 100;
    let score4 = 0;
    if (position52 > 70) score4 = 1;
    else if (position52 < 30) score4 = -1;
    totalWeightedScore += score4 * weight4;
    maxPossibleScore += weight4;
    breakdown.push({
        name: `52W Position (${position52.toFixed(0)}%)`,
        score: score4,
        weight: weight4,
        contribution: score4 * weight4,
        status: score4 > 0 ? 'bullish' : score4 < 0 ? 'bearish' : 'neutral'
    });

    // 5. Volume Trend (Weight: 1.5x)
    const weight5 = 1.5;
    const volumeRatio = avgVolume > 0 ? volume / avgVolume : 1;
    let score5 = 0;
    if (volumeRatio > 1.2) score5 = 1;
    else if (volumeRatio < 0.8) score5 = -1;
    totalWeightedScore += score5 * weight5;
    maxPossibleScore += weight5;
    breakdown.push({
        name: `Volume (${(volumeRatio * 100).toFixed(0)}% avg)`,
        score: score5,
        weight: weight5,
        contribution: score5 * weight5,
        status: score5 > 0 ? 'bullish' : score5 < 0 ? 'bearish' : 'neutral'
    });

    // 6. VIX Level (Weight: 2x)
    const weight6 = 2;
    let score6 = 0;
    if (vixPrice < 15) score6 = 1;
    else if (vixPrice > 25) score6 = -1;
    totalWeightedScore += score6 * weight6;
    maxPossibleScore += weight6;
    breakdown.push({
        name: `VIX Fear Gauge (${vixPrice.toFixed(1)})`,
        score: score6,
        weight: weight6,
        contribution: score6 * weight6,
        status: score6 > 0 ? 'bullish' : score6 < 0 ? 'bearish' : 'neutral'
    });

    // Normalize to 0-100 scale
    const normalizedScore = ((totalWeightedScore + maxPossibleScore) / (2 * maxPossibleScore)) * 100;

    return { score: Math.round(normalizedScore), breakdown };
}

export function PredictionWidget({ symbol, data, vixData, onSelectSymbol }: PredictionWidgetProps) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const requestPermission = () => {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                setNotificationsEnabled(true);
                new Notification("Notifications Enabled", {
                    body: "You will catch the next big move! 🚀",
                    icon: "/icon.png"
                });
            }
        });
    };

    const marketName = data?.name || symbol;

    if (!data?.price || !data.fiftyDayAverage) {
        return (
            <Card className="w-full h-full">
                <CardHeader><CardTitle>Market Forecast</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
                        Select a stock to view forecast...
                        {(!data && symbol) && <span className="text-xs mt-2">Loading data for {symbol}...</span>}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { score, breakdown } = calculateWeightedScore(data, vixData);

    // Sentiment Determination based on 0-100 score
    let sentiment = "NEUTRAL ⚖️";
    let color = "text-yellow-500";
    let bg = "bg-yellow-500/10";
    let icon = Gauge;

    if (score >= 70) {
        sentiment = "STRONG BULLISH 🚀";
        color = "text-green-600";
        bg = "bg-green-500/10";
        icon = TrendingUp;
    } else if (score >= 50) {
        sentiment = "BULLISH 📈";
        color = "text-green-500";
        bg = "bg-green-500/10";
        icon = TrendingUp;
    } else if (score <= 10) {
        sentiment = "STRONG BEARISH 📉";
        color = "text-red-600";
        bg = "bg-red-500/10";
        icon = TrendingDown;
    } else if (score <= 30) {
        sentiment = "BEARISH 🐻";
        color = "text-red-500";
        bg = "bg-red-500/10";
        icon = TrendingDown;
    }

    return (
        <Card className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className={`h-6 w-6 ${color}`} />
                    Forecast: {symbol}
                </CardTitle>
                <div className="flex space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={requestPermission}
                        title="Enable Notifications"
                        disabled={notificationsEnabled}
                    >
                        <Bell className={`h-4 w-4 ${notificationsEnabled ? "text-green-500 fill-green-500" : "text-muted-foreground"}`} />
                    </Button>
                    <Button
                        variant={symbol === "SPY" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectSymbol("SPY")}
                    >
                        S&P 500
                    </Button>
                    <Button
                        variant={symbol === "^GDAXI" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectSymbol("^GDAXI")}
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
                            <div className="text-3xl font-bold">{score}/100</div>
                        </div>
                    </div>

                    {/* Price Chart */}
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Price Action & Trends</h3>
                        <PriceChart data={data} />
                    </div>

                    {/* Weighted Criteria Breakdown */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted-foreground">Weighted Analysis</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] gap-1 px-2"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? (
                                    <>Less <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                    <>Details <ChevronDown className="h-3 w-3" /></>
                                )}
                            </Button>
                        </div>

                        <div className={`grid gap-2 text-sm ${isExpanded ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
                            {breakdown.map((item, idx) => (
                                <div key={idx} className={`flex ${isExpanded ? "items-center justify-between p-2" : "flex-col items-center justify-center p-3 text-center"} rounded-lg bg-white dark:bg-black border transition-all duration-200`}>
                                    <div className={`flex flex-col ${isExpanded ? "flex-1" : "mb-1"}`}>
                                        <span className={`text-muted-foreground ${isExpanded ? "" : "text-[11px] leading-tight"}`}>{item.name}</span>
                                        {isExpanded && <span className="text-[10px] text-zinc-400">Weight: {item.weight}x</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${item.status === 'bullish' ? 'text-green-500' :
                                            item.status === 'bearish' ? 'text-red-500' :
                                                'text-yellow-500'
                                            }`}>
                                            {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(1)}
                                        </span>
                                        {item.status === 'bullish' ? <Check className={`text-green-500 ${isExpanded ? "h-5 w-5" : "h-4 w-4"}`} /> :
                                            item.status === 'bearish' ? <X className={`text-red-500 ${isExpanded ? "h-5 w-5" : "h-4 w-4"}`} /> :
                                                <AlertTriangle className={`text-yellow-500 ${isExpanded ? "h-5 w-5" : "h-4 w-4"}`} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
