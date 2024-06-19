import express from "express";
import redis from "redis";
const app = express();
import {getFieldValues,hsetAsync} from "./redisClient.js";
const bucketSize = 10;
const refillRate=1;

const RateLimiter = async (req, res, next) => {
    const email = req.user.email;
    const now = Date.now();
    const userKey = `bucket:${email}`;
  
    try {
      let [tokens, lastRefill] = await getFieldValues(userKey, ['tokens', 'lastRefill']);
  
      if (!tokens || !lastRefill) {
        // Initialize the bucket if it doesn't exist
        tokens = bucketSize;
        lastRefill = now;
      } else {
        tokens = parseInt(tokens, 10);
        lastRefill = parseInt(lastRefill, 10);
  
        // Refill the bucket based on the time passed
        const timeSinceLastRefill = (now - lastRefill) / 1000;
        const tokensToAdd = Math.floor(timeSinceLastRefill * refillRate);
        tokens = Math.min(bucketSize, tokens + tokensToAdd);
        lastRefill = now;
      }
  
      // Check if the bucket has enough tokens
      if (tokens > 0) {
        tokens--;
  
        // Save the updated bucket back to Redis
        await hsetAsync(userKey, {
          tokens,
          lastRefill
        });
  
        next(); // Allow the request
      } else {
        res.status(429).send('Rate limit exceeded');
      }
    } catch (error) {
      console.error('Error accessing Redis', error);
      res.status(500).send('Internal server error');
    }
  };


export default RateLimiter ;