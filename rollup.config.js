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

function resolveFile(file) {
  return path.resolve(__dirname, file);
}

const ENV = getEnv(process.env.NODE_ENV);

const withSourceMaps = process.env.NODE_ENV !== 'production';

const outputConf = {
  exports: 'named',
  sourcemap: withSourceMaps,
};

export default {
  input: resolveFile('./src/index.js'),
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
  output: [
    {
      ...outputConf,
      file: resolveFile(pkg.main),
      name: pkg.name,
      format: 'umd',
    },
    {
      ...outputConf,
      file: resolveFile(pkg.module),
      format: 'esm',
    },
  ],
};
