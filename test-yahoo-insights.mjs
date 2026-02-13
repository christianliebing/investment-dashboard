import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function test() {
    try {
        const symbol = 'SPY'; // ETF for S&P 500 might have more data
        const quoteSummary = await yahooFinance.quoteSummary(symbol, { modules: ['recommendationTrend', 'summaryDetail', 'indexTrend'] });
        console.log("Quote Summary for SPY:", JSON.stringify(quoteSummary, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
