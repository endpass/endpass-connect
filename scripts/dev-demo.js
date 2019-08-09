const executor = require('./executor');
// prepare demo
// # Building demo-application artifact
process.chdir('./connect-demo');
console.log(`current directory: ${process.cwd()}`);
executor([
  //
  'yarn link @endpass/connect',
  'yarn',
  'SOURCE_MAP=true PORT=4444 yarn dev:e2e',
]);

// # Returning to working dir
process.chdir('../');
console.log(`current directory: ${process.cwd()}`);

