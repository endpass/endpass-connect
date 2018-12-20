const path = require('path');
const webpack = require('webpack');
const { getEnv } = require('./env');

const { NODE_ENV } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  outputDir: path.resolve(__dirname, './dist/app'),
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        ENV: JSON.stringify(ENV),
      }),
    ],
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@@', path.resolve(__dirname, './packages/'))
      .set('@', path.resolve(__dirname, './packages/app/src'));
  },
};
