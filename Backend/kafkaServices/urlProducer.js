import { Kafka } from 'kafkajs';
import { set, get, setToken } from '../controllers/redisClient.js'; // Adjust imports as needed

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'urlKafka',
  brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
  // createPartitioner: Partitioners.LegacyPartitioner,
});

const producer = kafka.producer();

// Initialize and connect producer
const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Failed to connect Kafka producer:', error);
  }
};
await connectProducer();
// Function to send message to a Kafka topic
const sendMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    console.log(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    console.error(`Failed to send message to topic ${topic}:`, error);
  }
};
// Function to send URL message
export const sendUrlMessage = async (message) => {
  await sendMessage('urlShortner', message);
};

// Function to set throttle for premium users
export const setThrottlePremium = async (message) => {
  await sendMessage('throttlePremium', message);
};

// Function to set throttle for basic users
export const setThrottleBasic = async (message) => {
  await sendMessage('throttleBasic', message);
};

// Function to set throttle for gold users
export const setThrottleGold = async (message) => {
  await sendMessage('throttleGold', message);
};

// Disconnect producer
export const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected');
  } catch (error) {
    console.error('Failed to disconnect Kafka producer:', error);
  }
};