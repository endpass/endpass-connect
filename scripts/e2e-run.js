const executor = require('./executor');
require('./e2e-serve.js');

executor('cypress run --browser chrome');
executor.exit();
