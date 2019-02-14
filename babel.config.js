module.exports = {
  presets: ['@babel/preset-env'],
  plugins: ['lodash'],
  env: {
    test: {
      plugins: [['@babel/plugin-transform-runtime']],
    },
  },
};
