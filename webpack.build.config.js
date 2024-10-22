/* eslint-disable */
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const buildConfig = {
  context: __dirname,
  entry: './lib/entry.js',
  output: {
    path: __dirname + '/build',
    filename: 'dough.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015', 'stage-2'],
        },
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css',
      },
      // For pixi.js:
      // https://gist.github.com/mjackson/ecd3914ebee934f4daf4
      {
        include: path.resolve(__dirname + path.sep, 'node_modules/pixi.js'),
        loader: 'transform-loader/cacheable?brfs',
      },
    ],
  },
  plugins: [new UglifyJSPlugin()],
};

module.exports = buildConfig;
