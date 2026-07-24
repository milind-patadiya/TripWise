const NodeCache = require('node-cache');

// Standard cache for 30 minutes, checking for expired keys every 5 minutes
const apiCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

module.exports = apiCache;
