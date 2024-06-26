import { get, set } from "../controllers/redisClient.js";
// import express from "express";
import generateUniqueId from "generate-unique-id";
import { config as dotenvConfig } from "dotenv";
import Url from "../models/urlShortnerModel.js";

dotenvConfig();

export const UrlShortner = async (req, res) => {
  try {
    // Destructure LongUrl from req.query instead of req.body
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
        // Generate a unique ID and create a new short URL
        const id2 = generateUniqueId({
          length: 10,
          useLetters: true,
        });
        const baseUrl = process.env.BASE_URL;
        const shortUrl = `${baseUrl}/${id2}`; // Fixed template literal syntax
        console.log(shortUrl);
        set(LongUrl, shortUrl, process.env.URL_TTL);
        await Url.save({ LongUrl, shortUrl, Date: Date.now() }); // Correct usage of save()
        res.json({ LongUrl, shortUrl, Date: Date.now() }); // No change needed here
      }
    } else {
      // If cacheUrl exists, respond with the cacheUrl object
      console.log(cacheUrl);
      res.json({ LongUrl: cacheUrl });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
