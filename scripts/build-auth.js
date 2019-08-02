const fs = require('fs-extra');
const executor = require('./executor');

executor([
  // # Clearing up past auth artifact
  'rimraf ./e2e-apps/auth',
  // # Git submodule initialization
  'git submodule init',
  'git submodule update',
]);

// # Building auth-application artifact
process.chdir('./endpass-auth');
console.log(`current directory: ${process.cwd()}`);
executor(['yarn', 'yarn build:e2e']);

// # Returning to working dir
process.chdir('../');
console.log(`current directory: ${process.cwd()}`);

// # Creating auth artifact directory
executor([
  //
  'mkdirp ./e2e-apps/auth',
  'mkdirp ./e2e-apps/auth/bridge',
]);

// # Copying application artifact
fs.copySync('./endpass-auth/dist/app', './e2e-apps/auth', {
  dereference: true,
});
fs.copySync('./endpass-auth/dist/app', './e2e-apps/auth/bridge', {
  dereference: true,
});

// # Installing auth service worker
executor('node ./scripts/install-auth-sw.js');
