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
}

export const getMarketData = async (): Promise<MarketIndex[]> => {
    try {
        const response = await fetch("/api/market-data");
        if (!response.ok) {
            throw new Error("Failed to fetch market data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching market data:", error);
        return [];
    }
};
