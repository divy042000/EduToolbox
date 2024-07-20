import { Kafka } from "kafkajs";
import { generate as generateUniqueId } from "shortid";
import crypto from "crypto";
import { Url } from "../models/urlShortnerModel.js";
import { get, set } from "../controllers/redisClient.js";
import { sendUrlMessage } from "../kafkaServices/urlProducer.js";
import { config as dotenvConfig } from "dotenv";

// setting up middleware
dotenvConfig();

// Function to encode a string using Base62
const base62Encode = (num) => {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let encoded = "";
  while (num > 0) {
    encoded = chars[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded;
};

// Example Key Generation Service (KGS)
const generateKey = async () => {
  const uniqueId = generateUniqueId();
  // You can use more sophisticated methods or databases to ensure uniqueness
  return uniqueId;
};

export const UrlShortner = async (req, res) => {
  try {
    const { LongUrl } = req.body;
    // Check cache first
    const cacheUrl = await get(LongUrl);

    if (!cacheUrl) {
      // If cacheUrl does not exist, fetch from the database
      let databaseUrl = await Url.findOne({ LongUrl });
      if (databaseUrl) {
        // URL found in database, return it
        res.json(databaseUrl);
      } else {
        // Generate a unique ID using KGS
        const id2 = await generateKey();
        // Encode the unique ID using Base62
        const shortUrlBase62 = `${process.env.BASE_URL}/shortUrl/${base62Encode(
          parseInt(id2, 36)
        )}`;
        // Cache and save both encoded URLs
        set(LongUrl, shortUrlBase62, process.env.URL_TTL);
        // Save to database
        await Url.create({ LongUrl, shortUrlBase62, Date: Date.now() });
        const message = {
          LongUrl,
          shortUrlBase62,
        };
        // Send message to Kafka
        await sendUrlMessage(message);
        res.json({ LongUrl, shortUrlBase62, Date: Date.now() });
      }
    } else {
      // If cacheUrl exists, respond with the cacheUrl object
      res.json({
        LongUrl: cacheUrl.LongUrl,
        shortUrlBase62: cacheUrl.shortUrlBase62,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
