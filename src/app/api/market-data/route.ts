import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET() {
    const symbols = ["^GSPC", "^GDAXI", "SPY", "^VIX"];

    try {
        const quotes = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const quote = await yahooFinance.quote(symbol);
                    return {
                        symbol: quote.symbol,
                        name: quote.shortName || quote.longName || symbol,
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
