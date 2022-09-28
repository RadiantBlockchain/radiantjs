var path = require('path')

module.exports = {
  entry: path.join(__dirname, '/index.js'),
  externals: {
    crypto: 'crypto'
  },
  output: {
    library: 'radiantjs',
    path: path.join(__dirname, '/'),
    filename: 'radiant.min.js'
  },
  mode: 'production'
}
