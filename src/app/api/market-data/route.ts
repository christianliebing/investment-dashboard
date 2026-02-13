import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    // Default symbols if none provided
    let symbols = ["^GSPC", "^GDAXI", "SPY", "^VIX"];

    // If symbols are provided via URL, append them (or replace? Appending seems safer for main dashboard)
    // Actually, for the main dashboard we might want dynamic. 
    // Let's SUPPORT an override. If 'symbols' is present, use ONLY those? 
    // Or simpler: The frontend decides what to ask for.
    // Let's fallback to defaults if empty.

    if (symbolsParam) {
        const extraSymbols = symbolsParam.split(",").map(s => s.trim());
        // Merge unique symbols
        symbols = Array.from(new Set([...symbols, ...extraSymbols]));
    }

    try {
        const quotes = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const quote = await yahooFinance.quote(symbol);
                    return {
                        symbol: symbol,
                        name: symbol, // Placeholder, ideally fetch full name
                        price: quote.regularMarketPrice,
                        change: quote.regularMarketChange,
                        changePercent: quote.regularMarketChangePercent,
                        preMarketPrice: quote.preMarketPrice,
                        preMarketChange: quote.preMarketChange,
                        preMarketChangePercent: quote.preMarketChangePercent,
                        marketState: quote.marketState,
                        fiftyDayAverage: quote.fiftyDayAverage,
                        twoHundredDayAverage: quote.twoHundredDayAverage,
                        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
                        averageVolume: quote.averageDailyVolume3Month || quote.averageVolume,
                        regularMarketVolume: quote.regularMarketVolume,
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${symbol}:`, error);
                    return null;
                }
            })
        );

        const validQuotes = quotes.filter((quote) => quote !== null);

        return NextResponse.json(validQuotes);
    } catch (error) {
        console.error("Error fetching market data:", error);
        return NextResponse.json(
            { error: "Failed to fetch market data" },
            { status: 500 }
        );
    }
}
