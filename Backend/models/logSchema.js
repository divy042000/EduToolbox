import mongoose from "mongoose";
const { Schema } = mongoose;
const LogSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true, // Indexing improves search performance
    },
    token: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now, // Automatically set to current date/time upon creation
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Log = mongoose.model("Log", LogSchema);
export default Log;
