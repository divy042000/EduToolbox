import express from "express";
import redis from "redis";
const app = express();
import { getToken, setToken } from "./redisClient.js";
const bucketSize = 10;
const refillRate = 1; // Tokens per minute

const RateLimiter = async (req, res, next) => {
  try {
    const email = req.user.email;
    const userKey = `bucket:${email}`;
    let { tokens, lastRefill } = await getToken(userKey);
    const bucketSize = 10; // Define the bucket size or set it according to your requirements

    // Initialize the current time in minutes
    const currentTime = Date.now() / (1000 * 60);

    // Check if the tokens and lastRefill need initialization or refilling
    if (!tokens && !lastRefill) {
      // Initialize the bucket if it doesn't exist
      tokens = bucketSize;
      lastRefill = currentTime;
      await setToken(userKey, { tokens, lastRefill });
      next();
    } else {
      // Calculate the time passed since the last refill
      const timeSinceLastRefill = Math.floor(currentTime - lastRefill);

      if (Date.now() != lastRefill) {
        // Refill the bucket based on the time passed
        // console.log(timeSinceLastRefill);
        if (tokens > 0) {
          tokens -= 1; // Deduct one token
          tokens = Math.min(
            bucketSize,
            tokens + Math.floor(timeSinceLastRefill * refillRate)
          );
          lastRefill = currentTime;
          await setToken(userKey, { tokens, lastRefill });
          next();
        } else {
          return res.status(429).json({ message: "Rate limit exceeded" });
        }
      }
    }
  } catch (error) {
    console.error("Error accessing Redis", error);
    res.status(500).send("Internal server error");
  }
};

export default RateLimiter;
