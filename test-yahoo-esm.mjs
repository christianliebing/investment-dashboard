import * as yf2 from 'yahoo-finance2';

async function test() {
    console.log('Keys:', Object.keys(yf2));
    try {
        if (yf2.YahooFinance) {
            console.log("YahooFinance class found on namespace");
            const yf = new yf2.YahooFinance();
            await yf.quote('^GSPC');
            console.log("Success");
        } else {
            console.log("YahooFinance NOT found on namespace");
        }
    } catch (e) {
        console.error(e);
    }
}

test();
