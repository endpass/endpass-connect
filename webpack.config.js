const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const { getEnv } = require('./env');

function resolveFile(file) {
  return path.resolve(__dirname, file);
}

const filePath = resolveFile('./dist/endpass-browser.js');

const ENV = getEnv(process.env.NODE_ENV);

module.exports = {
  entry: resolveFile('./browser/browser.js'),
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolveFile('./src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [['@babel/plugin-transform-runtime']],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(ENV),
    }),
  ],
  output: {
    filename: path.basename(filePath),
    path: path.dirname(filePath),
    library: 'EndpassConnect',
    libraryTarget: 'var',
  },
};
