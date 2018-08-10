import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'

const camelCase = require('lodash.camelcase')

const libraryName = 'dynamo-easy'

export default {
  input: `dist/_esm5/${libraryName}.js`,
  output: [
    {file: `dist/_bundles/${libraryName}.umd.js`, format: 'umd', name: camelCase(libraryName)},
  ],
  sourcemap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: function (id) {
    return /^(lodash-es|moment|aws-sdk|rxjs|reflect-metadata)/.test(id)
  },
  globals: function (id) {
    console.log('global ' + id);
    return false
  },
  plugins: [
    json({
      include: ['node_modules/aws-sdk/**/*'],
    }),
    builtins(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      // libraries ready to support es2015 modules may have this field
      jsnext: true,
      main: true
    }),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),

    // Resolve source maps to the original source
    sourceMaps()
  ]
}
