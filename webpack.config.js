const path = require('path');

module.exports = {
  entry: './dist/endpass-connect.min.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'endpass-connect.browser.js',
    library: 'EndpassConnect',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
};
