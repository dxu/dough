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
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015', 'stage-2'],
        },
      },
      {
        test: /\.css$/,
        loader: 'style!css',
      },
    ],
    // For pixi.js:
    // https://gist.github.com/mjackson/ecd3914ebee934f4daf4
    postLoaders: [
      {
        include: path.join(__dirname, 'node_modules/pixi.js'),
        loader: 'transform/cacheable?brfs',
      },
    ],
  },
};

module.exports = examplesConfig;
