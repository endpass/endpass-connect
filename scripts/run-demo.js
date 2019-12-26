const executor = require('./executor');

executor('NODE_ENV=e2e node ./scripts/serv.js d=./e2e-apps/demo p=4444');
