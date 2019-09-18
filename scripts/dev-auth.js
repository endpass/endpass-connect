const executor = require('./executor');
// prepare auth

// # Building demo-application artifact
process.chdir('./endpass-auth');
console.log(`current directory: ${process.cwd()}`);
executor([
  //
  'yarn',
  'SOURCE_MAP=true PORT=8888 yarn dev:e2e',
]);

// # Returning to working dir
process.chdir('../');
console.log(`current directory: ${process.cwd()}`);
