const pkg = require('yahoo-finance2');
console.log('Keys:', Object.keys(pkg));
if (pkg.default) console.log('Default keys:', Object.keys(pkg.default));
