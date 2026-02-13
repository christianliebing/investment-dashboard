import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ results: [] });
    }

    try {
        const result = await yahooFinance.search(q);
        // Filter to EQUITY or ETF and map to valid shape
        const quotes = result.quotes
            .filter((quote: any) => quote.isYahooFinance && (quote.quoteType === "EQUITY" || quote.quoteType === "ETF"))
            .map((quote: any) => ({
                symbol: quote.symbol,
                shortname: quote.shortname || quote.longname || quote.symbol,
                exchange: quote.exchDisp || quote.exchange,
                type: quote.typeDisp || quote.quoteType
            }))
            .slice(0, 5); // Limit to 5 results

        return NextResponse.json({ results: quotes });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
