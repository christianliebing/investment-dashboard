"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketIndex } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RankingsProps {
    marketData: MarketIndex[];
    vixData?: MarketIndex;
    onSelectSymbol: (symbol: string) => void;
}

// Same calculation logic as PredictionWidget
function calculateScore(data: MarketIndex, vixData?: MarketIndex): number {
    if (!data?.price || !data.fiftyDayAverage) return 50;

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

    // 1. Price vs 50DMA (Weight: 2x)
    const dist50 = ((price - ma50) / ma50) * 100;
    let score1 = dist50 > 2 ? 1 : dist50 < -2 ? -1 : 0;
    totalWeightedScore += score1 * 2;
    maxPossibleScore += 2;

    // 2. Price vs 200DMA (Weight: 1.5x)
    const dist200 = ((price - ma200) / ma200) * 100;
    let score2 = dist200 > 2 ? 1 : dist200 < -2 ? -1 : 0;
    totalWeightedScore += score2 * 1.5;
    maxPossibleScore += 1.5;

    // 3. Momentum (Weight: 1x)
    let score3 = change > 1 ? 1 : change < -1 ? -1 : 0;
    totalWeightedScore += score3 * 1;
    maxPossibleScore += 1;

    // 4. 52-Week Position (Weight: 1.5x)
    const range52 = high52 - low52;
    const position52 = ((price - low52) / range52) * 100;
    let score4 = position52 > 70 ? 1 : position52 < 30 ? -1 : 0;
    totalWeightedScore += score4 * 1.5;
    maxPossibleScore += 1.5;

    // 5. Volume (Weight: 1.5x)
    const volumeRatio = avgVolume > 0 ? volume / avgVolume : 1;
    let score5 = volumeRatio > 1.2 ? 1 : volumeRatio < 0.8 ? -1 : 0;
    totalWeightedScore += score5 * 1.5;
    maxPossibleScore += 1.5;

    // 6. VIX (Weight: 2x)
    let score6 = vixPrice < 15 ? 1 : vixPrice > 25 ? -1 : 0;
    totalWeightedScore += score6 * 2;
    maxPossibleScore += 2;

    const normalizedScore = ((totalWeightedScore + maxPossibleScore) / (2 * maxPossibleScore)) * 100;
    return Math.round(normalizedScore);
}

export function Rankings({ marketData, vixData, onSelectSymbol }: RankingsProps) {
    // Filter out VIX and calculate scores
    const scoredStocks = marketData
        .filter(stock => stock.symbol !== "^VIX" && stock.price && stock.fiftyDayAverage)
        .map(stock => ({
            ...stock,
            investmentScore: calculateScore(stock, vixData)
        }))
        .sort((a, b) => b.investmentScore - a.investmentScore);

    return (
        <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-lg font-bold">🏆 Best Investments</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Sorted by weighted technical score</p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto pt-4">
                {scoredStocks.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                        <p>Add stocks to see rankings</p>
                    </div>
                ) : (
                    scoredStocks.map((stock, index) => {
                        const isTop = index < 3;
                        const scoreColor =
                            stock.investmentScore >= 70 ? "text-green-600 dark:text-green-400" :
                                stock.investmentScore >= 50 ? "text-green-500 dark:text-green-400" :
                                    stock.investmentScore <= 30 ? "text-red-500 dark:text-red-400" :
                                        stock.investmentScore <= 10 ? "text-red-600 dark:text-red-500" :
                                            "text-yellow-500 dark:text-yellow-400";

                        const bgColor =
                            stock.investmentScore >= 70 ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-800" :
                                stock.investmentScore >= 50 ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900" :
                                    stock.investmentScore <= 30 ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900" :
                                        "border-zinc-200 dark:border-zinc-800";

                        const rankBadge = isTop ? (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm shadow-md">
                                {index + 1}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm">
                                {index + 1}
                            </div>
                        );

                        return (
                            <div
                                key={stock.symbol}
                                className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${bgColor} ${isTop ? 'hover:scale-[1.02]' : 'hover:translate-x-1'}`}
                                onClick={() => onSelectSymbol(stock.symbol)}
                            >
                                <div className="flex items-center gap-3">
                                    {rankBadge}
                                    <div>
                                        <div className="font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stock.symbol}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                            ${stock.price?.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${scoreColor}`}>
                                            {stock.investmentScore}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">Score</div>
                                    </div>
                                    {stock.investmentScore >= 50 ? (
                                        <TrendingUp className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                                    ) : stock.investmentScore <= 30 ? (
                                        <TrendingDown className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <Minus className="h-5 w-5 text-yellow-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
