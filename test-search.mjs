import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function test() {
    try {
        const query = 'Apple';
        const result = await yahooFinance.search(query);
        console.log(`Search results for "${query}":`);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
