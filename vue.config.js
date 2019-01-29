const path = require('path');
const webpack = require('webpack');
const { getEnv } = require('./env');

const { NODE_ENV, SOURCE_MAP } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  productionSourceMap: false,

  configureWebpack: {
    devtool: SOURCE_MAP && 'cheap-module-eval-source-map',

    plugins: [
      new webpack.DefinePlugin({
        ENV: JSON.stringify(ENV),
      }),
    ],
  },

  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve(__dirname, './src'));
  },
  devServer: {
    proxy: {
      '^/identity/api/v1.1': {
        target: ENV.identity.url,
        changeOrigin: true,
        pathRewrite: {
          '^/identity': '',
        },
        cookieDomainRewrite: 'localhost',
      },
    },
  },

  outputDir: path.resolve(__dirname, './dist'),
};
