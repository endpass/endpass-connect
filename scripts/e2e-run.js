const executor = require('./executor');
require('./e2e-serve.js');

executor('cypress run --browser chrome');
// executor('cypress run --headless --browser chrome');
executor.exit();
