const yahooFinance = require('yahoo-finance2').default;

async function test() {
    try {
        const result = await yahooFinance.quote('^GSPC');
        console.log(result);
    } catch (e) {
        console.error(e);
    }
}

test();
