import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.connect().then(() => {
  console.log("Connected to Redis");
}).catch(console.error);

export const get = async (key) => {
  try {
    console.log(key);
    console.log(`Attempting to get key "${key}" from Redis...`);
    const value = await client.get(key);
    console.log(`Value retrieved for key "${key}":`, value);
    return value;
  } catch (error) {
    console.error(`Error getting key "${key}":`, error);
    throw error;
  }
};


export const set = async (key,value,ttlInSeconds) => {
  try {
    console.log("set reached");
    await client.set(key, JSON.stringify(value), {
      EX: ttlInSeconds,
      NX: true,
    });
    console.log("value: " + JSON.stringify(value));
    console.log(`Key ${key} set successfully`);
  } catch (error) {
    console.error(`Error setting key ${key}:`, error);
    throw error;
  }
};



