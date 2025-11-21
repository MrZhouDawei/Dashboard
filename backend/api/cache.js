// services/Cache.js
const redisClient = require('./redis');

/**
 * @class Cache
 * @description A singleton class for caching data using Redis.
 */
class Cache {
    constructor() {
        if (!Cache.instance) {
            Cache.instance = this;
        }
        return Cache.instance;
    }

    /**
     * Computes a dynamic TTL (Time To Live) until the specified target time.
     * If the target time has already passed today, it sets it for the next day.
     * @param {number} hour - Target hour (24h format)
     * @param {number} [minute=0] - Target minutes (default: 0)
     * @param {number} [second=0] - Target seconds (default: 0)
     * @returns {number} TTL in seconds
     */
    computeDynamicTTL(hour, minute = 0, second = 0) {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" }));
        let expiration = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
        if (expiration <= now) {
            expiration.setDate(expiration.getDate() + 1);
        }
        return Math.floor((expiration - now) / 1000);
    }

    /**
     * Middleware function for caching data.
     * @param {string} key - Cache key
     * @param {Function} fetchFunction - Function to fetch fresh data if cache miss occurs
     * @param {Object|number} expiration - If an object `{ hour, minute, second }`, uses dynamic TTL. If a number, uses fixed TTL.
     * @returns {Promise<any>} Data from cache or fetched fresh data
     */
    async getOrSetCache(key, fetchFunction, expiration) {
        const cachedData = await redisClient.getData(key);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const freshData = await fetchFunction();
        let ttl;

        if (typeof expiration === "object") {
            ttl = this.computeDynamicTTL(expiration.hour, expiration.minute, expiration.second);
        } else {
            ttl = expiration; // Fixed TTL in seconds
        }

        await redisClient.setData(key, JSON.stringify(freshData), ttl);
        return freshData;
    }
}

// Export a singleton instance
const cacheInstance = new Cache();
module.exports = cacheInstance;
