import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import json from 'rollup-plugin-json'
// import globals from'rollup-plugin-node-globals'
import builtins from 'rollup-plugin-node-builtins'

const pkg = require('./package.json')
const camelCase = require('lodash.camelcase')

const libraryName = 'sc-dynamo-object-mapper'

export default {
  input: `compiled/${libraryName}.js`,
  output: [
    {file: pkg.main, format: 'umd', name: camelCase(libraryName)},
    {file: pkg.module, format: 'es'}
  ],
  sourcemap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: function (id) {
    return /lodash|moment|aws|rxjs/.test(id)
  },
  globals: function (id) {
    console.log('global' + id);
    return false
  },
  plugins: [
    json({
      include: ['node_modules/aws-sdk/**/*', 'node_modules/winston/**/*'],
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
