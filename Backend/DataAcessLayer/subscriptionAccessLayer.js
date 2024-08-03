import Subscription from "../models/subscriptionSchema.js";


export const findSubscription = async (userKey) => {
    try {
      // Query the database for a subscription with the given userKey
      const subscription = await Subscription.findOne({ userKey: userKey });
      return subscription;
    } catch (error) {
      console.error('Error finding subscription for a user key: ' + error.message);
      throw error;
    }
  };

  