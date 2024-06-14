import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import redis from "redis";
// import { createClient } from 'redis';
import backRoutes from "./routes/backRoutes.js";
import { promisify } from "util";
// Load environment variables

// middle ware 
dotenv.config();
// Express app setup
const app = express();
app.use(express.json());
app.use(backRoutes);

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.connect(console.log("Connected to Redis")).catch(console.error);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);


mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export { getAsync, setAsync };
