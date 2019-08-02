const executor = require('./executor');

require('./e2e-serve');

executor('cypress open');

process.exit(0);
