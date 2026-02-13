"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarketIndex } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketCardProps {
    index: MarketIndex;
}

export function MarketCard({ index }: MarketCardProps) {
    const isPositive = (index.changePercent || 0) >= 0;
    const isPreMarket = index.marketState === "PRE";

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                {index.symbol}
                            </h3>
                            {isPreMarket && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                                    PRE
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {index.name}
                        </p>
                    </div>
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            ${index.price?.toFixed(2) || "---"}
                        </span>
                        <div className="text-right">
                            <div
                                className={`text-sm font-semibold ${isPositive
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {isPositive ? "+" : ""}
                                {index.change?.toFixed(2) || "0.00"}
                            </div>
                            <div
                                className={`text-xs font-medium ${isPositive
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {isPositive ? "+" : ""}
                                {index.changePercent?.toFixed(2) || "0.00"}%
                            </div>
                        </div>
                    </div>

                    {isPreMarket && index.preMarketPrice && (
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    Pre-Market
                                </span>
                                <div className="text-right">
                                    <div className="font-medium text-zinc-700 dark:text-zinc-300">
                                        ${index.preMarketPrice.toFixed(2)}
                                    </div>
                                    <div
                                        className={`font-medium ${(index.preMarketChangePercent || 0) >= 0
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                            }`}
                                    >
                                        {(index.preMarketChangePercent || 0) >= 0 ? "+" : ""}
                                        {index.preMarketChangePercent?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
