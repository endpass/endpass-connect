const child_process = require('child_process');

const childs = [
  child_process.fork('./scripts/run-demo.js'),
  child_process.fork('./scripts/run-auth.js'),
];
