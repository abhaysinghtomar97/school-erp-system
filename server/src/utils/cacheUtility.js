// utils/cacheUtils.js
const redisClient = require('./redis'); 

/**
 * Deletes a specific key or all keys matching a pattern
 * @param {string} matchPattern 
 */
const clearCacheKeys = async (matchPattern) => {
    try {
        const stream = redisClient.scanStream({
            match: matchPattern,
            count: 100 // Scans 100 keys at a time to prevent blocking the server
        });

        stream.on('data', async (keys) => {
            if (keys.length > 0) {
                // Delete the batch of matched keys
                await redisClient.del(...keys);
                console.log(`🗑️ Cleared ${keys.length} cache keys matching: ${matchPattern}`);
            }
        });

        stream.on('end', () => {
            // Done scanning
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};

module.exports = { clearCacheKeys };