/* eslint-disable */
const path = require('path');

const examplesConfig = {
  devtool: 'source-map',
  context: path.join(__dirname),
  entry: ['./lib/entry.js'],
  output: {
    path: path.join(__dirname, '/docs/examples'),
    filename: 'pew.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
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
        include: path.join(__dirname, 'node_modules/pixi.js'),
        loader: 'transform-loader/cacheable?brfs',
        enforce: 'post'
      },
    ],
  },
};

module.exports = examplesConfig;
