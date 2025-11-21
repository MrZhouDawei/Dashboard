const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

/**
 * @class SecureScraping
 * @description A singleton class for performing secure web scraping using proxies, random delays,
 * and batch processing to avoid detection and multi-connection issues.
 */
class SecureScraping {
  /**
   * Private constructor to prevent direct instantiation.
   */
  constructor() {
    if (!SecureScraping.instance) {
      SecureScraping.instance = this;
    }
    return SecureScraping.instance;
  }

  /**
   * Returns a random element from the provided array.
   * @param {Array} arr - The array to pick a random element from.
   * @returns {*} A random element from the array.
   * @throws {Error} If the array is empty or not an array.
   */
  getRandomElement(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('Array must be non-empty.');
    }
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }

  /**
   * Performs a secure GET request using random proxies and user agents.
   * Includes random delays to avoid detection.
   * @param {string} url - The URL for the GET request.
   * @returns {Promise<Object>} The axios response.
   * @throws {Error} If the request fails.
   */
  async secureGet(url) {
    if (!url) {
      throw new Error('No URL provided for the GET request.');
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const randomDelay = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000; // 10-20 sec

    try {
      console.log(`Waiting ${randomDelay / 1000} seconds before request with proxy...`);
      await delay(randomDelay);

      return await axios.get(url, {
        proxy: {
          host: 'proxy-server.scraperapi.com',
          port: 8001,
          auth: {
            username: 'scraperapi',
            password: process.env.SCRAPEAPY_KEY,
          },
          protocol: 'http',
        },
      });
    } catch (error) {
      console.error('Scraper API request failed, retrying without proxy:', error.message);

      try {
        console.log(`Waiting ${randomDelay / 1000} seconds before request without proxy...`);
        await delay(randomDelay);

        return await axios.get(url); // Retry without proxy
      } catch (finalError) {
        console.error('Second GET request also failed:', finalError.message);
        throw finalError;
      }
    }
  }

  /**
   * Delays execution for a specified time before executing an optional function.
   * @param {Function} [func] - Optional function to execute after the delay.
   * @param {number} ms - Delay duration in milliseconds.
   * @returns {Promise<void>} Resolves after delay and optional function execution.
   */
  async delay(func = () => {}, ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return await func();
  }

  /**
   * Processes an array of items in batches to avoid multi-connection errors.
   * @param {Array} items - List of items to process.
   * @param {Function} processFunction - Function to apply to each item.
   * @param {number} [limit=4] - Number of concurrent requests per batch.
   * @param {number} [delay=10000] - Delay between batches in milliseconds.
   * @returns {Promise<void>} Resolves when all batches have been processed.
   */
  async processInBatches(items, processFunction, limit = 4, delay = 10000) {
    for (let i = 0; i < items.length; i += limit) {
      const batch = items.slice(i, i + limit);
      await Promise.all(batch.map(item => processFunction(item)));
      if (i + limit < items.length) {
        console.log('Waiting to avoid multi-connection errors...');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

const instance = new SecureScraping();
Object.freeze(instance);
module.exports = instance;
