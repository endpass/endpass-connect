const handlersList = [];
let binded = false;

function bindExit() {
  if (binded) {
    return;
  }
  process.stdin.resume(); // so the program will not close instantly

  function exitHandler(options, exitCode) {
    handlersList.forEach(handler => {
      handler();
      console.log('--- exitHandler');
    });
    handlersList.length = 0;

    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
  }

  // do something when app is closing
  process.on('exit', exitHandler.bind(null, { cleanup: true }));

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

  binded = true;
}

module.exports = function(handler) {
  bindExit();
  handlersList.push(handler);
};
