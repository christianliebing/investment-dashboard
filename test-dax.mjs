import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function test() {
    try {
        const symbol = '^GDAXI';
        const quote = await yahooFinance.quote(symbol);
        console.log(`Data for ${symbol}:`);
        console.log("50 Day MA:", quote.fiftyDayAverage);
        console.log("200 Day MA:", quote.twoHundredDayAverage);
        console.log("52 Week High:", quote.fiftyTwoWeekHigh);
        console.log("52 Week Low:", quote.fiftyTwoWeekLow);

        // Check for other useful fields
        const summary = await yahooFinance.quoteSummary(symbol, { modules: ['financialData', 'defaultKeyStatistics'] });
        console.log("\nFinancial Data:", summary.financialData);
    } catch (e) {
        console.error(e);
    }
}

test();
