var path = require('path'),
    fs   = require('fs')

// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
var node_modules = fs.readdirSync('node_modules')
  .filter(function(x) {
    return x !== '.bin'
  })

module.exports = {
  devtool: "source-map",
  entry: "./js/server/routes.js",
  externals: node_modules,
  output: {
    path: __dirname + '/dist',
    filename: "routes.js"
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