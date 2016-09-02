var path = require('path'),
    fs   = require('fs')

// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
var node_modules = {}

fs.readdirSync('node_modules')
  .filter(function(x) {
    return x !== '.bin'
  })
  .forEach(mod => { node_modules[mod] = `commonjs ${mod}`; });

module.exports = {
  devtool: "source-map",
  context: __dirname,
  entry: "./js/server/server.js",
  externals: node_modules,
  target: 'node',
  output: {
    path: __dirname,
    filename: "server.dist.js"
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
