var path = require('path'),
    fs   = require('fs')

module.exports = {
  devtool: "source-map",
  context: __dirname,
  entry: "./js/client/entry.js",
  output: {
    path: __dirname + '/dist',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: "style!css"
      },
      // This applies the loader to all of your dependencies,
      // and not any of the source files in your project:
      // required to make pixi.js to work due to its glslify dependency
      {
        test: /node_modules/,
        loader: 'ify'
      }
    ],
    // For pixi.js:
    // https://gist.github.com/mjackson/ecd3914ebee934f4daf4
    postLoaders: [
      {
        include: path.resolve(__dirname, 'node_modules/pixi.js'),
        loader: 'transform/cacheable?brfs'
      }
    ]
  }
};
