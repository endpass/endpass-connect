const fs = require('fs-extra');
const executor = require('./executor');
// prepare auth

// # Copying service worker
fs.copySync('./tests/e2e/workers/auth.js', './endpass-auth/public/sw-e2e.js', {
  dereference: true,
});

// # Building demo-application artifact
process.chdir('./endpass-auth');
console.log(`current directory: ${process.cwd()}`);
executor([
  //
  'yarn link @endpass/connect',
  'yarn',
  'SOURCE_MAP=true PORT=8888 yarn dev:e2e',
]);

// # Returning to working dir
process.chdir('../');
console.log(`current directory: ${process.cwd()}`);
