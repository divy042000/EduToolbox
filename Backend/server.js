import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import mongoose from "mongoose";

import backRoutes from "./routes/backRoutes.js";
// Load environment variables
dotenv.config();

// Express app setup
const app = express();
app.use(express.json());
app.use(backRoutes);




mongoose
  .connect(process.env.MONGODB_URL, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});
