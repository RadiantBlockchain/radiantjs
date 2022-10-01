
// Check for process
try {
  if (!process) {
    module.exports = require('./hash.browser')
  }

  if (process && process.browser) {
    module.exports = require('./hash.browser')
  } else {
    module.exports = require('./hash.node')
  }
} catch (err) {
  console.log("'could not detect 'process', defaulting to hash.browser")
  module.exports = require('./hash.browser')
}
