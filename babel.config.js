module.exports = {
  plugins: ['lodash'],
  env: {
    test: {
      presets: ['@babel/preset-env'],
      plugins: [['@babel/plugin-transform-runtime']],
    },
  },
};
