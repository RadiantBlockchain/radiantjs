var path = require('path')

module.exports = {
  entry: path.join(__dirname, '/index.js'),
  externals: {
    crypto: 'crypto'
  },
  output: {
    library: 'rad',
    path: path.join(__dirname, '/'),
    filename: 'rad.min.js'
  },
  mode: 'production'
}
