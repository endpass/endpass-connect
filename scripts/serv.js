const express = require('express');
const path = require('path');

const opt = process.argv.slice(2).reduce((obj, key) => {
  const values = key.split('=');
  obj[values[0]] = values[1];
  return obj;
}, {});

const port = opt.p || 8080;
const dist = opt.d || './dist';

const app = express();

const rootDir = path.join(__dirname, '../', dist);
app.use(express.static(rootDir));

app.get('*', (request, response) => {
  response.sendFile(path.resolve(rootDir, 'index.html'));
});

app.listen(port);
console.log(`- used static files: ${rootDir}`);
console.log(`- started on port: ${port}`);
