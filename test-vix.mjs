import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function test() {
    try {
        const symbol = '^VIX';
        const quote = await yahooFinance.quote(symbol);
        console.log(`Data for ${symbol}:`);
        console.log("Price:", quote.regularMarketPrice);
        console.log("Day High:", quote.regularMarketDayHigh);
        console.log("Day Low:", quote.regularMarketDayLow);
    } catch (e) {
        console.error(e);
    }
}

test();
