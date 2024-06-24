import redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch(console.error);

  export const getToken = async (key) => {
    try {
      const token = await client.get(key);
      console.log(`Got token for key: "${key}"`, token);
      if (token === null) {
        // If the token is null, return an object with tokens and lastRefill set to null
        console.log("Finding null", token);
        return { tokens: null, lastRefill: null }; // Return an object with named properties
      } else {
        // If the token exists, parse it from JSON string to an object
        console.log(token);
        return JSON.parse(token); // Assuming the token is a JSON string
      }
    } catch (error) {
      console.error(`Error in getting token: ${key}`, error);
      throw error; // Rethrow the error to allow calling code to handle it
    }
  };
  export const setToken = async (key, data) => {
    try {
      const dataString = JSON.stringify(data); // Convert the data object to a JSON string
      await client.set(key, dataString); // Store the data in Redis
      console.log(`Set token for key: "${key}"`, data);
    } catch (error) {
      console.error(`Error in setting token: ${key}`, error);
      throw error; // Rethrow the error to allow calling code to handle it
    }
  };

export const get = async (key) => {
  try {
    const value = await client.get(key);
    console.log(`Value retrieved for key "${key}":`, value);
    return value;
  } catch (error) {
    console.error(`Error getting key "${key}":`, error);
    throw error;
  }
};

export const set = async (key, value, ttlInSeconds) => {
  try {
    await client.set(key,(value), {
      EX: ttlInSeconds,
      NX: true,
    });

    console.log(`Key ${key} set successfully`);
  } catch (error) {
    console.error(`Error setting key ${key}:`, error);
    throw error;
  }
};

export const del = async (key) => {
  try {
    await client.del(key);
    console.log(`Key ${key} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting key ${key}:`, error);
    throw error;
  }
};
