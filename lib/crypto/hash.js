if (!process) {
    module.exports = require('./hash.browser');
}
if (process && process.browser) {
    module.exports = require('./hash.browser');
} else {
    module.exports = require('./hash.node');
}
