const child_process = require('child_process');
const executor = require('./executor');

const childs = [
  child_process.fork('./scripts/dev-connect.js'),
  child_process.fork('./scripts/dev-demo.js'),
  child_process.fork('./scripts/dev-auth.js'),
];

executor('cypress open');

childs.forEach((child) => {
  child.kill();
});

process.exit(0);
