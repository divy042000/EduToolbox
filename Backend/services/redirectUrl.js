import {Url} from "../models/urlShortnerModel.js"
import { get, set, del } from "../controllers/redisClient.js";

export const RedirectService = async (req, res) => {
  const shortUrl = req.params.shortUrl;
  // Try to find the long URL in the cache
  const longUrl = await get(shortUrl);

  if (longUrl) {
    res.redirect(longUrl); // Redirect to the long URL
  } else {
    // If not found in cache, query the database
    const dbEntry = await Url.findOne({ shortUrl });

    if (dbEntry) {
      // Update the cache with the long URL
      await set(shortUrl, dbEntry.longUrl, "EX", 60 * 60); // TTL: 1 hour

      res.redirect(dbEntry.longUrl); // Redirect to the long URL
    } else {
      res.status(404).send("Not Found"); // Resource not found
    }
  }
};
