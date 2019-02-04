const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const pkg = require('./package.json');
const { getEnv } = require('./env');

const { NODE_ENV = 'development', WEBPACK_MODE } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  entry: path.resolve(__dirname, './src/lib.js'),

  output: {
    path: __dirname,
    filename: './lib/endpass-connect.min.js',
    library: 'EndpassConnect',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },

  devtool: WEBPACK_MODE === 'development' && 'cheap-module-eval-source-map',

  externals: Object.keys(pkg.dependencies),

  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(ENV),
    }),
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
    modules: [path.resolve('./node_modules'), path.resolve(__dirname, './src')],
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
    extensions: ['.json', '.js'],
  },
};
