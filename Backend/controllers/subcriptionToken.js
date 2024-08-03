import jwt from "jsonwebtoken";
import { config as dotenvConfig } from "dotenv";
import { getJSON, setJSON, del } from "./redisClient.js";
import { findSubscription } from "../DataAcessLayer/subscriptionAccessLayer";
import {
  handleBasicUser,
  handlePremiumUser,
  handleGoldUser,
} from "../services/updateTierService.js";
// import { promisify } from "util";

dotenvConfig();

// JWT secret key (should be stored securely, e.g., in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;
const SUB_ID_TTL = process.env.SUB_ID_TTL;

async function updateDatabase(tier, subscriptionId) {
  // Implement database update logic here
  // This is a placeholder function
  console.log(
    `Updating database for tier ${tier} with subscriptionId ${subscriptionId}`
  );
}

export default SubscriptionBucket;

async function extractEmailFromToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.email;
  } catch (error) {
    return null;
  }
}

const subscriptionDataService = async (email, userRoles) => {
  try {
    if (!email) {
      return {
        status: 404,
        message: "Email not found from Authentication Service",
      };
    }

    const userKey = `member:${email}`;
    // Fetch subscription from cache
    let subscriptionJSON = await getJSON(userKey);

    if (!subscriptionJSON) {
      // Fetch subscription from database if not in cache
      subscriptionJSON = await findSubscription(email);
      if (!subscriptionJSON) {
        return { status: 404, message: "Subscription JSON not found" };
      }
      await setJSON(userKey, subscriptionJSON, SUB_ID_TTL); // Set with expiration time
    }

    if (subscriptionJSON.subStatus !== "active") {
      await handleBasicUser(email,subscriptionJSON);
    } else {
      const serviceType = subscriptionJSON.tier;
      if (serviceType === "premium") {
        await handlePremiumUser(email,subscriptionJSON);
      } else if (serviceType === "gold") {
        await handleGoldUser(email,subscriptionJSON);
      } else {
        return { status: 400, message: "Unknown service tier" };
      }
    }

    return {
      status: 200,
      subscriptionId: subscriptionJSON.subscriptionId,
      message: `${serviceType} user`,
    };
  } catch (error) {
    console.error(`Error in SubscriptionBucket: ${error.message}`);
    if (error.message.includes("Subscription ID not found")) {
      return { status: 404, message: "Subscription ID not found" };
    }
    return { status: 500, message: "Internal Server Error" };
  }
};

export const subscriptionBucketMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res
      .status(401)
      .json({ message: "Email not received from Authentication" });
  }
  const { email, userRoles } = req.user;
  try {
    const remainingTokens = await subscriptionDataService(email);
    req.user.remainingTokens = remainingTokens;
    next();
  } catch (error) {
    if (error.message === "Rate limit exceeded") {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    if (error.message === "User not found or invalid subscription") {
      return res.status(401).json({ error: "Invalid user or subscription" });
    }
    console.error("Subscription bucket error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
