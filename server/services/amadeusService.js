const Amadeus = require('amadeus');
const cache = require('./cacheService');

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY || 'dummy_id',
  clientSecret: process.env.AMADEUS_API_SECRET || 'dummy_secret',
  // You can specify 'production' or 'test' (default is test)
  hostname: process.env.AMADEUS_ENV === 'production' ? 'production' : 'test'
});

/**
 * Wrapper to fetch from Amadeus with caching
 * @param {string} cacheKey - Unique key for the cache
 * @param {Function} apiCall - Function that calls the Amadeus SDK
 * @param {number} ttl - Time to live in seconds (default 30 mins)
 */
const fetchWithCache = async (cacheKey, apiCall, ttl = 1800) => {
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return cachedData;
  }

  console.log(`[Cache Miss] ${cacheKey}`);
  try {
    const response = await apiCall();
    
    // Parse the response data
    const data = response.result || response.data;
    
    // Cache the successful response
    cache.set(cacheKey, data, ttl);
    return data;
  } catch (error) {
    console.error(`Amadeus API Error on ${cacheKey}:`, error.message || error);
    // You can inspect error.response.request, error.response.statusCode, etc.
    if (error.response) {
       console.error(error.response.body);
    }
    throw new Error('Failed to fetch data from Amadeus API');
  }
};

module.exports = {
  amadeus,
  fetchWithCache
};
