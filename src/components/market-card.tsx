import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketIndex } from "@/lib/market-data";
import { ArrowDownIcon, ArrowUpIcon, Clock } from "lucide-react";

interface MarketCardProps {
    index: MarketIndex;
}

export function MarketCard({ index }: MarketCardProps) {
    const isPositive = index.change >= 0;

    // Check if we have pre-market data and if the market is in pre-market state
    // Note: marketState can be "PRE", "REGULAR", "POST", "CLOSED" etc.
    const showPreMarket = index.marketState === "PRE" && index.preMarketChangePercent !== undefined;
    const isPreMarketPositive = (index.preMarketChange || 0) >= 0;

    return (
        <Card className="w-full relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {index.name}
                </CardTitle>
                <div className={`text-xs font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {index.symbol}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className={`text-xs flex items-center mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                    {Math.abs(index.change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({Math.abs(index.changePercent).toFixed(2)}%)
                </p>

                {showPreMarket && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Pre-Market</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                                {index.preMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-xs flex items-center ${isPreMarketPositive ? "text-green-500" : "text-red-500"}`}>
                                {isPreMarketPositive ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                                {Math.abs(index.preMarketChangePercent || 0).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
