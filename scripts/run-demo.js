const executor = require('./executor');

executor('NODE_ENV=e2e npx serve ./e2e-apps/demo -l 4444 -s');
