import { Kafka } from "kafkajs";
import { set, get, setToken } from "../controllers/redisClient.js"; // Assuming these are relevant imports
// import { Partitioners } from "kafkajs/partitioners";

const kafka = new Kafka({
  clientId: 'urlKafka',
  brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
  // createPartitioner: Partitioners.LegacyPartitioner,
});

const producer = kafka.producer();

const sendUrlMessage = async (message) => {
  console.log(message);
  await producer.send({
    topic: 'urlShortner',
    messages: [
      { value: message }, // Use the provided message
    ],
  });
};

// Export the sendMessage function
export { sendUrlMessage };

