// @ts-check

import path from 'path';

import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import alias from 'rollup-plugin-alias';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import visualizer from 'rollup-plugin-visualizer';
import ts from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';

const { getEnv } = require('./env');

function resolveDir(dir) {
  return path.join(__dirname, '', dir);
}

function resolveFile(...args) {
  args.splice(0, 0, __dirname);
  return path.resolve.apply(path, args);
}

const ENV = getEnv(process.env.NODE_ENV);

const withSourceMaps = process.env.NODE_ENV !== 'production';

const outputConf = {
  exports: 'named',
  sourcemap: withSourceMaps,
};

const commonConfig = {
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
    !withSourceMaps && terser(),
    visualizer(),
  ],
  watch: {
    exclude: ['node_modules/**'],
  },
};

const createConfig = ({ input, umd, module }) => {
  return {
    input: resolveFile(input),
    ...commonConfig,
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

export default [
  createConfig({
    input: './src/index.js',
    umd: pkg.umd,
    module: pkg.module,
  }),
  ...pkg.connectPlugins.map(plugin => {
    return createConfig({
      input: plugin.input,
      umd: plugin.umd,
      module: plugin.module,
    })
  }),
];
