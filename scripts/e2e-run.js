const executor = require('./executor');

require('./e2e-serve');

executor('cypress run');

process.exit(0);

