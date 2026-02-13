"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { MarketIndex } from "@/lib/market-data";

interface SearchResult {
    symbol: string;
    shortname: string;
    exchange: string;
    type: string;
}

interface WatchlistProps {
    onSelectSymbol: (symbol: string) => void;
    savedSymbols: string[];
    onUpdateSymbols: (symbols: string[]) => void;
    marketData: MarketIndex[];
}

export function Watchlist({ onSelectSymbol, savedSymbols, onUpdateSymbols, marketData }: WatchlistProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    // Debounced search effect could go here, but keep simple for now
    const handleSearch = async () => {
        if (!query) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/market-data/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.results);
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    };

    const addSymbol = (symbol: string) => {
        if (!savedSymbols.includes(symbol)) {
            onUpdateSymbols([...savedSymbols, symbol]);
        }
        setQuery("");
        setResults([]);
    };

    const removeSymbol = (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation();
        onUpdateSymbols(savedSymbols.filter(s => s !== symbol));
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="flex space-x-2">
                    <Input
                        placeholder="Search symbol (e.g. NVDA)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button size="icon" onClick={handleSearch} disabled={searching}>
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Search Results */}
                {results.length > 0 && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-2 space-y-1 max-h-48 overflow-y-auto">
                        <h4 className="text-xs font-semibold text-muted-foreground px-2">Search Results</h4>
                        {results.map((res) => (
                            <div
                                key={res.symbol}
                                className="flex items-center justify-between p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded cursor-pointer text-sm"
                                onClick={() => addSymbol(res.symbol)}
                            >
                                <div>
                                    <div className="font-bold">{res.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{res.shortname}</div>
                                </div>
                                <Plus className="h-4 w-4 text-green-500" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Saved List */}
                <div className="space-y-2">
                    {savedSymbols.length === 0 && !query && (
                        <div className="text-center text-sm text-muted-foreground py-4">
                            No stocks in watchlist.
                        </div>
                    )}
                    {savedSymbols.map(symbol => {
                        const data = marketData.find(m => m.symbol === symbol);
                        const price = data?.price?.toFixed(2) || "---";
                        const change = data?.changePercent?.toFixed(2);
                        const isPos = (data?.changePercent || 0) > 0;
                        return (
                            <div
                                key={symbol}
                                className="flex items-center justify-between p-3 border rounded-lg hover:border-zinc-400 cursor-pointer transition-colors bg-card"
                                onClick={() => onSelectSymbol(symbol)}
                            >
                                <div>
                                    <div className="font-bold">{symbol}</div>
                                    <div className="text-xs text-muted-foreground">{data?.name || "Loading..."}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{price}</div>
                                        <div className={`text-xs ${isPos ? "text-green-500" : "text-red-500"}`}>
                                            {change ? `${change}%` : ""}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                        onClick={(e) => removeSymbol(e, symbol)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
