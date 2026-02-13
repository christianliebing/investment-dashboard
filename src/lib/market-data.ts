export interface MarketIndex {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    preMarketPrice?: number;
    preMarketChange?: number;
    preMarketChangePercent?: number;
    marketState?: string;
    fiftyDayAverage?: number;
    twoHundredDayAverage?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    averageVolume?: number;
    regularMarketVolume?: number;
}

export const getMarketData = async (symbols?: string[]): Promise<MarketIndex[]> => {
    try {
        const params = new URLSearchParams();
        if (symbols && symbols.length > 0) {
            params.append("symbols", symbols.join(","));
        }

        const response = await fetch(`/api/market-data?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Failed to fetch market data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching market data:", error);
        return [];
    }
};
