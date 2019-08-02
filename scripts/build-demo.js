const fs = require('fs-extra');
const executor = require('./executor');

executor([
  // # Clearing up past demo artifact
  'rimraf ./e2e-apps/demo',
  // # Git submodule initialization
  'git submodule init',
  'git submodule update',
]);

// # Building demo-application artifact
process.chdir('./connect-demo');
console.log(`current directory: ${process.cwd()}`);
executor([
  //
  'yarn link @endpass/connect',
  'yarn',
  'yarn build:e2e',
]);

// # Returning to working dir
process.chdir('../');
console.log(`current directory: ${process.cwd()}`);

// # Creating demo artifact directory
executor(['mkdirp ./e2e-apps/demo']);

// # Copying application artifact
fs.copySync('./connect-demo/dist', './e2e-apps/demo', {
  dereference: true,
});
