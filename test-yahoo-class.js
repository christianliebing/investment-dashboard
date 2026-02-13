const { YahooFinance } = require('yahoo-finance2'); // Try named export

async function test() {
    try {
        if (YahooFinance) {
            console.log("YahooFinance class found");
            const yf = new YahooFinance();
            const result = await yf.quote('^GSPC');
            console.log("Quote result:", result);
        } else {
            console.log("YahooFinance named export NOT found");
            // Try default export as class?
            const Access = require('yahoo-finance2').default;
            try {
                const yf = new Access();
                console.log("Default export is a class?");
                const result = await yf.quote('^GSPC');
                console.log("Quote result:", result);
            } catch (e) {
                console.log("Default export is NOT a constructor: " + e.message);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

test();
