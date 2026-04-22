const  Redis  = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL, {
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