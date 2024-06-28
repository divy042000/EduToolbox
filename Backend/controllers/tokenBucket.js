import express from "express";
import redis from "redis";
const app = express();
import { getToken, setToken } from "./redisClient.js";

const bucketSize = 10; // Define the bucket size or set it according to your requirements
const refillRate = 1; // Tokens per minute

const RateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip; // Extract the IP address from the request
    const userKey = `bucket:${ip}`; // Create a unique key based on the IP address
    let { tokens, lastRefill } = await getToken(userKey);

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
      if (timeSinceLastRefill > 0) {
        // Refill the bucket based on the time passed
        tokens = Math.min(
          bucketSize,
          tokens + Math.floor(timeSinceLastRefill * refillRate)
        );
        lastRefill = currentTime;
      }
      if (tokens > 0) {
        tokens -= 1; // Deduct one token
        await setToken(userKey, { tokens, lastRefill });
        next();
      } else {
        return res.status(429).json({ message: "Rate limit exceeded" });
      }
    }
  } catch (error) {
    console.error("Error accessing Redis", error);
    res.status(500).send("Internal server error");
  }
};

export default RateLimiter;
