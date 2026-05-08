const  Redis  = require('ioredis');
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = new Redis(redisUrl, {
    retryStrategy : (times)=>{
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3
});

redisClient.on('connect', () => {
    console.log('✅ Redis client connected successfully');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

module.exports = redisClient;