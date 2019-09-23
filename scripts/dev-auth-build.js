const executor = require('./executor');
// prepare auth

// # Building demo-application artifact
process.chdir('./endpass-auth');
console.log(`current directory: ${process.cwd()}`);
executor('yarn');

// # Returning to working dir
process.chdir('../');
console.log(`current directory: ${process.cwd()}`);
