// Assuming your file is named History.mjs or you've configured your project to support ES6 modules

import mongoose from "mongoose";

const paraphraserHistorySchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true,
  },
  paraphrasedText: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const paraphraserHistoryModel = mongoose.model(
  "ParaphraserHistory",
  paraphraserHistorySchema
);

// Now, you can export the model using named exports
export { paraphraserHistoryModel };
