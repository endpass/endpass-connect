const logOutput = require('cypress-log-to-output');

module.exports = on => {
  logOutput.install(on);
};
