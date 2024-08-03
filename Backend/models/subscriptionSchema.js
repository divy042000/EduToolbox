import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    unique: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  tier: {
    type: String,
    required: true,
  },
  subStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  counter: {
    type: Number,
    default: 10,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // New field for Kafka updates
  lastKafkaUpdate: {
    type: Date,
    default: null, // Initially set to null to indicate no updates received
  },
});


subscriptionSchema.index({ subscriptionId: 1 });
subscriptionSchema.index({ userEmail: 1 });

// Update the `updatedAt` field on every save
subscriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const throttleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      index: true,
    },
    tier: {
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      default: 10,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying
throttleSchema.index({ key: 1, tier: 1 });
// Create Throttle model
const Throttle = mongoose.model("Throttle", throttleSchema);

// Assuming Subscription schema is defined elsewhere
const Subscription = mongoose.model("Subscription", subscriptionSchema);

// Export both models using ES6 named exports
export { Throttle, Subscription };
