const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const LodashWebpackPlugin = require('lodash-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './packages/lib/index.js'),

  output: {
    path: path.resolve(__dirname, './dist/lib'),
    filename: 'endpass-connect.js',
    chunkFilename: '[name].endpass-connect.js',
    library: 'EndpassConnect',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },

  plugins: [
    new LodashWebpackPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: ['lodash'],
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },

  node: {
    fs: 'empty',
  },

  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve(__dirname, './packages'),
    ],
    alias: {
      '@@': path.resolve(__dirname, './packages/'),
    },
    extensions: ['.json', '.js'],
  },
};
