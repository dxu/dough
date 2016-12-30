var path = require('path'),
    fs   = require('fs')

module.exports = {
  context: __dirname,
  entry: "./lib/entry.js",
  output: {
    path: __dirname + '/build',
    filename: "pew.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015', 'stage-2']
        }
      },
      {
        test: /\.css$/,
        loader: "style!css"
      }
    ],
    // For pixi.js:
    // https://gist.github.com/mjackson/ecd3914ebee934f4daf4
    postLoaders: [
      {
        include: path.resolve(__dirname + path.sep, 'node_modules/pixi.js'),
        loader: 'transform/cacheable?brfs'
      }
    ]
  }
};
