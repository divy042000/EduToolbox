import { Kafka } from "kafkajs";
import { set, get, setToken, getToken, del } from "../controllers/redisClient";

// Create a Kafka client
//Monitoring and Metrics: Kafka tracks various metrics per clientId, such as throughput, latency, and error rates. Having separate clientIds makes it easier to monitor and troubleshoot individual components of your system.
const kafka = new Kafka({
  clientId: "urlKafkaConsumer",
  brokers: ["localhost:9092"], // Replace with your Kafka broker addresses
});

// Create a Kafka consumer
const consumer = kafka.consumer({ groupId: 'urlShortner-group' }); // Define a consumer group

// Kafka consumer logic
const run = async () => {
  // Connecting the consumer
  await consumer.connect();

  // Subscribing to the topic
  // we can change particular retention period of topic using kafka services 
  await consumer.subscribe({ topic: "urlShortner", fromBeginning: false });
  // Consuming messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value.toString();

      // Cache the message in Redis using the set function
      await set(`message-${message.offset}`, messageValue);
      console.log("Message cached in Redis:", {
        partition,
        offset: message.offset,
        value: messageValue,
      });

      // Optionally, retrieve and process cached messages using the get function
      const cachedMessage = await get(`message-${message.offset}`);
      console.log("Retrieved from Redis:", {
        partition,
        offset: message.offset,
        value: cachedMessage,
      });
    },
  });
};

run().catch(console.error);
