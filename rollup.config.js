// @ts-check

import path from 'path';

import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import alias from '@rollup/plugin-alias';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import visualizer from 'rollup-plugin-visualizer';
import ts from 'rollup-plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import url from 'postcss-url';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';

import pkg from './package.json';
import outputList from './plugins.json';

const { getEnv } = require('./env');

function resolveDir(dir) {
  return path.join(__dirname, '', dir);
}

function resolveFile(...args) {
  args.splice(0, 0, __dirname);
  return path.resolve(...args);
}

const ENV = getEnv(process.env.NODE_ENV);

const isDevelopmentMode = process.env.NODE_ENV !== 'production';

const outputConf = {
  exports: 'named',
  sourcemap: isDevelopmentMode,
};

// eslint-disable-next-line no-console
console.log('ENV', ENV);

const commonConfig = config => ({
  external: [...Object.keys(pkg.dependencies)],
  plugins: [
    resolve({
      preferBuiltins: false,
    }),
    alias({
      '@': resolveDir('./src'),
      resolve: ['.js', '/index.js'],
    }),
    json(),
    replace({
      ENV: JSON.stringify(ENV),
    }),
    ts(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
    !isDevelopmentMode && terser(),
    config.withCopy &&
      copy({
        targets: config.withCopy.map(target => ({
          ...target,
          dest: './dist',
        })),
      }),
    postcss({
      plugins: [
        url({
          url: 'inline',
          encodeType: 'base64',
          optimizeSvgEncode: true,
        }),
      ],
    }),
    visualizer({
      filename: resolveFile('./reports/', `${config.library}.html`),
    }),
  ],
  watch: {
    exclude: ['node_modules/**'],
    clearScreen: false,
  },
});

const createConfig = childConfig => {
  const { input, umd, module } = childConfig;
  return {
    ...commonConfig(childConfig),
    input: resolveFile(input),
    output: [
      {
        ...outputConf,
        file: resolveFile('dist', umd),
        name: pkg.name,
        format: 'umd',
      },
      {
        ...outputConf,
        file: resolveFile('dist', module),
        format: 'esm',
      },
    ],
  };
};

export default outputList.map(createConfig);
