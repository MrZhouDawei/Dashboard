const Redis = require('ioredis');
require('dotenv').config();

/**
 * @class RedisSingleton
 * @description A singleton class for managing a Redis connection.
 * Ensures that only one Redis client instance is created and shared across the application.
 */
class RedisSingleton {
    static instance = null;
    client = null;

    /**
     * Initializes the Redis connection if not already instantiated.
     * @throws {Error} If REDIS_URL is not defined in the environment variables.
     */
    constructor() {
        if (!RedisSingleton.instance) {
            const redisUrl = process.env.REDIS_URL;
            if (!redisUrl) {
                throw new Error('REDIS_URL is not defined in environment variables');
            }
            this.client = new Redis(redisUrl);
            RedisSingleton.instance = this;
        }
        return RedisSingleton.instance;
    }

    /**
     * Stores a key-value pair in Redis with an optional expiration time.
     * @param {string} key - The key to store.
     * @param {string} value - The value to store.
     * @param {number} [expirationInSeconds=86400] - Expiration time in seconds (default: 24 hours).
     * @returns {Promise<void>} Resolves when the operation completes.
     */
    async setData(key, value, expirationInSeconds = 86400) {
        await this.client.set(key, value, 'EX', expirationInSeconds);
    }

    /**
     * Retrieves a value from Redis by its key.
     * @param {string} key - The key to retrieve.
     * @returns {Promise<string|null>} The cached value or null if not found.
     */
    async getData(key) {
        const cachedData = await this.client.get(key);
        return cachedData ? cachedData : null;
    }
}

module.exports = new RedisSingleton();
