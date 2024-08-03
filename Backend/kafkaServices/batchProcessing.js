import {
  setThrottlePremium,
  setThrottleBasic,
  setThrottleGold,
} from "../kafkaServices/urlProducer.js";
import { checkKeys, getJSON } from "../controllers/redisClient.js";
import cron from "node-cron";
import { Subscription } from "../models/subscriptionSchema.js";

export const checkAndUpdateEntries = async () => {
  const currentTime = new Date();
  const SixtyMinutesAgo = new Date(currentTime.getTime() - 60 * 60000);

  const keys = await checkKeys("member:");
  const entriesToUpdate = [];

  for (const key of keys) {
    const value = await getJSON(key);
    if (value && value.lastKafkaUpdate) {
      const lastKafkaUpdate = new Date(value.lastKafkaUpdate);
      if (lastKafkaUpdate < SixtyMinutesAgo) {
        entriesToUpdate.push(value);
      }
    }
  }

  if (entriesToUpdate.length > 0) {
    const bulkOps = entriesToUpdate.map((entry) => ({
      updateMany: {
        filter: { subscriptionId: entry.subscriptionId },
        update: {
          $set: {
            lastKafkaUpdate: new Date(),
            counter: entry.counter, // Replace 'newValue' with the actual value you want to set for 'counter'
          },
        },
      },
    }));

    await Subscription.bulkWrite(bulkOps);
    console.log(`${entriesToUpdate.length} entries updated in MongoDB`);
  }
};

cron.schedule("*/5 * * * *", () => {
  console.log("Running background job to check and update entries...");
  checkAndUpdateEntries().catch((err) =>
    console.error("Error in background job:", err)
  );
});
