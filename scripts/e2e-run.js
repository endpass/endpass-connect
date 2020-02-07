const executor = require('./executor');
require('./e2e-serve.js');

// --headless flag is not working correctly with cypress.viewport(); define
executor('cypress run --browser chrome');
executor.exit();
