"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Loader2, ListFilter, Check } from "lucide-react";
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

type SortOption = "name" | "price" | "change" | "default";

export function Watchlist({ onSelectSymbol, savedSymbols, onUpdateSymbols, marketData }: WatchlistProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("default");
    const [showSort, setShowSort] = useState(false);

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

    const sortedSymbols = useMemo(() => {
        if (sortBy === "default") return savedSymbols;

        return [...savedSymbols].sort((a, b) => {
            const dataA = marketData.find(m => m.symbol === a);
            const dataB = marketData.find(m => m.symbol === b);

            if (sortBy === "name") {
                return (dataA?.symbol || a).localeCompare(dataB?.symbol || b);
            }
            if (sortBy === "price") {
                return (dataB?.price || 0) - (dataA?.price || 0);
            }
            if (sortBy === "change") {
                return (dataB?.changePercent || 0) - (dataA?.changePercent || 0);
            }
            return 0;
        });
    }, [savedSymbols, marketData, sortBy]);

    const sortOptions: { label: string; value: SortOption }[] = [
        { label: "Default", value: "default" },
        { label: "Name", value: "name" },
        { label: "Price", value: "price" },
        { label: "Performance", value: "change" },
    ];

    return (
        <Card className="h-full shadow-md hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-visible">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between relative">
                <div>
                    <CardTitle className="text-lg font-bold">📋 Watchlist</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Track your favorite stocks</p>
                </div>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${sortBy !== "default" ? "text-blue-500" : ""}`}
                        onClick={() => setShowSort(!showSort)}
                    >
                        <ListFilter className="h-4 w-4" />
                    </Button>

                    {showSort && (
                        <div className="absolute right-0 top-10 w-40 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-1 animate-in fade-in zoom-in duration-150">
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    className="w-full text-left px-3 py-2 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between group"
                                    onClick={() => {
                                        setSortBy(opt.value);
                                        setShowSort(false);
                                    }}
                                >
                                    <span className={sortBy === opt.value ? "font-bold text-blue-600 dark:text-blue-400" : ""}>
                                        {opt.label}
                                    </span>
                                    {sortBy === opt.value && <Check className="h-3 w-3 text-blue-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {/* Search Input */}
                <div className="flex space-x-2">
                    <Input
                        placeholder="Search symbol (e.g. NVDA)"
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
                        className="border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button size="icon" onClick={handleSearch} disabled={searching} className="shrink-0">
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Search Results */}
                {results.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700">
                        <h4 className="text-xs font-semibold text-muted-foreground px-2 mb-1">Search Results</h4>
                        {results.map((res) => (
                            <div
                                key={res.symbol}
                                className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded cursor-pointer text-sm transition-colors group"
                                onClick={() => addSymbol(res.symbol)}
                            >
                                <div>
                                    <div className="font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{res.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{res.shortname}</div>
                                </div>
                                <Plus className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Saved List */}
                <div className="space-y-2">
                    {savedSymbols.length === 0 && !query && (
                        <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <Search className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                            <p>No stocks in watchlist</p>
                            <p className="text-xs mt-1">Search to add stocks</p>
                        </div>
                    )}
                    {sortedSymbols.map(symbol => {
                        const data = marketData.find(m => m.symbol === symbol);
                        const price = data?.price?.toFixed(2) || "---";
                        const change = data?.changePercent?.toFixed(2);
                        const isPos = (data?.changePercent || 0) > 0;
                        return (
                            <div
                                key={symbol}
                                className="group flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md cursor-pointer transition-all duration-200 bg-white dark:bg-zinc-900/30"
                                onClick={() => onSelectSymbol(symbol)}
                            >
                                <div>
                                    <div className="font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{symbol}</div>
                                    <div className="text-xs text-muted-foreground">{data?.name || "Loading..."}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{price}</div>
                                        <div className={`text-xs font-semibold ${isPos ? "text-green-500" : "text-red-500"}`}>
                                            {change ? `${isPos ? '+' : ''}${change}%` : ""}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 md:opacity-0 group-hover:opacity-100 transition-opacity"
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
