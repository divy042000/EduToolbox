import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

export const Url =  mongoose.model("Url", UrlSchema);
