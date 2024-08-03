// import { get, set } from "../controllers/redisClient.js";
// import {} from
// Middleware for rate limiting
export const throttlingLimiter = (throttleJson, maxRequests) => {
  const windowSize = 60 * 1000; // 60 seconds
  const currentTime = Date.now();

  try {
    if (!throttleJson) {
      return { status: 400, message: "Invalid subscription data" };
    } else {
      const elapsedTime =
        currentTime - new Date(throttleJson.lastUpdated).getTime();
      // Check the elapsed time; if greater than a minute, update the counter with max requests
      if (elapsedTime > windowSize) {
        throttleJson.counter = maxRequests;
      }
      // Update lastUpdated time after every current execution
      throttleJson.lastUpdated = currentTime;
      if (throttleJson.counter > 0) {
        // Decrease the counter
        throttleJson.counter -= 1;
        // Return success response
        return { status: 200, message: "Request allowed", throttleJson };
      } else {
        // Return rate limit exceeded response
        return {
          status: 429,
          message: "Too many requests. Please try again later.",
        };
      }
    }
  } catch (err) {
    console.error(`Error in throttlingLimiter: ${err.message}`);
    return { status: 500, message: "Internal Server Error" };
  }
};
