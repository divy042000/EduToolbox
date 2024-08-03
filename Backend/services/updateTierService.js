import { config as dotenvConfig } from "dotenv";
import { withLock } from "../controllers/redisClient.js";
import { throttlingLimiter } from "../controllers/subscriptionCounters.js";
import { getJSON, setJSON } from "../controllers/redisClient.js";

dotenvConfig();

const incrementCounter = async (subscriptionJSON) => {
  try {
    subscriptionJSON.counter += 1;
    return subscriptionJSON;
  } catch (error) {
    console.error("Error incrementing counter:", error);
    throw error;
  }
};

export const handlePremiumUser = async (email, subscriptionJSON) => {
  if (
    !email ||
    typeof email !== "string" ||
    !subscriptionJSON.subscriptionId ||
    typeof subscriptionJSON.subscriptionId !== "string"
  ) {
    throw new Error("Invalid email or subscription ID provided.");
  }
  const userKey = `user:${email}:subscription${subscriptionJSON.subscriptionId}`;
  try {
    return await withLock(userKey, 50, async () => {
      // Your existing logic here
      let throttleJson = await getJSON(userKey);
      if (!throttleJson) {
        throw new Error(
          "No throttling data found for the provided user and subscription ID."
        );
      }
      await throttlingLimiter(throttleJson, process.env.PREMIUM_MAX_REQUESTS);
      await setJSON(userKey, throttleJson, process.env.SUB_ID_TTL);
      const updatedSubscription = await incrementCounter(subscriptionJSON);
      await setJSON(email,updatedSubscription, process.env.SUB_ID_TTL);
      return { status: 200, message: "Handling premium user"};
    });
  } catch (error) {
    console.error(`Failed to handle premium user: ${userKey}`, error);
    throw error;
  }
};

export const handleGoldUser = async (email, subscriptionJSON) => {
  // Validate input parameters
  if (
    !email ||
    typeof email !== "string" ||
    !subscriptionJSON.subscriptionId ||
    typeof subscriptionJSON.subscriptionId !== "string"
  ) {
    throw new Error("Invalid email or subscription ID provided.");
  }

  const userKey = `user:${email}:subscription${subscriptionJSON.subscriptionId}`;

  try {
    return await withLock(userKey, 50, async () => {
      // Retrieve existing subscription information
      let throttleJson = await getJSON(userKey);
      // Check if the subscription exists
      if (!throttleJson) {
        throw new Error(
          "No subscription found for the provided user and subscription ID."
        );
      }

      // Apply rate limiting
      await throttlingLimiter(throttleJson, process.env.GOLD_MAX_REQUESTS);
      // Update the subscription data in the cache
      await setJSON(userKey, throttleJson, process.env.SUB_ID_TTL);
      const updatedSubscription = await incrementCounter(subscriptionJSON);
      await setJSON(email, updatedSubscription, process.env.SUB_ID_TTL);
      // Return a success response
      return { status: 200, message: "Handling gold user"};
    });
  } catch (error) {
    // Log the error and rethrow it to allow higher-level error handling
    console.error(`Failed to handle gold user: ${userKey}`, error);
    throw error;
  }
};

export const handleBasicUser = async (email, subscriptionJSON) => {
  // Validate input parameters
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided.");
  }
  const userKey = `user:${email}`;
  try {
    return await withLock(userKey, 50, async () => {
      // Retrieve existing subscription information
      let throttleJson = await getJSON(userKey);
      // Check if the subscription exists
      if (!throttleJson) {
        throw new Error("No subscription found for the provided user.");
      }
      // Apply rate limiting
      await throttlingLimiter(throttleJson, process.env.BASIC_MAX_REQUESTS);
      // Update the subscription data in the cache
      await setJSON(userKey, throttleJson, process.env.SUB_ID_TTL);
      const updatedSubscription = await incrementCounter(subscriptionJSON);
      await setJSON(email, updatedSubscription, process.env.SUB_ID_TTL);

      // Return a success response
      return { status: 200, message: "Handling basic user" };
    });
  } catch (error) {
    // Log the error and rethrow it to allow higher-level error handling
    console.error(`Failed to handle basic user: ${userKey}`, error);
    throw error;
  }
};
