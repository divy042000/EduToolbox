import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import backRoutes from "./routes/backRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:4173",
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(backRoutes);



mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const PORT = process.env.SERVER_PORT_1 || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
