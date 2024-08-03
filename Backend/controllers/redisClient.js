import redis from "redis";
import dotenv from "dotenv";
import Redlock from "redlock";
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

// Create a Redlock instance
const redlock = new Redlock([client], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
});

export const checkKeys = async (pattern) => {
  try {
    // Fetch keys matching the pattern
    const keys = await client.keys(pattern);
    // Check if any keys are found
    if (keys.length === 0) {
      console.log("No matching keys found.");
      return [];
    }
    return keys;
  } catch (error) {
    console.error("Error checking keys:", error.message);
    throw new Error("Failed to check keys");
  }
};

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

export const setToken = async (key, data, ttlInSeconds) => {
  try {
    const dataString = JSON.stringify(data); // Convert the data object to a JSON string
    await client.set(key, dataString, ttlInSeconds); // Store the data in Redis
    console.log(`Set token for key: "${key}"`, data);
    return true; // Indicate success
  } catch (error) {
    console.error(`Error in setting token: ${key}`, error);
    throw error; // Rethrow the error to allow calling code to handle it
  }
};

export const set = async (key, value, ttlInSeconds) => {
  try {
    await client.set(key, value, {
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

export const get = async (key) => {
  try {
    const value = await client.get(key);
    if (value === null) {
      console.log(`Key ${key} not found`);
      return null;
    }
    console.log(`Successfully retrieved value for key ${key}`);
    return value;
  } catch (error) {
    console.error(`Error retrieving value for key ${key}:`, error);
    throw error;
  }
};

// getting up JSoN component

export const getJSON = async (key) => {
  try {
    const jsonData = await client.json.get(key);
    return jsonData; // Return the JSON data
  } catch (error) {
    console.error("Error retrieving JSON from Redis:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// setting up JSoN component

export const setJSON = async (key, data, ttl) => {
  try {
    // Set the JSON data
    await client.json.set(key, ".", data);
    // Set the TTL (Time to Live) in seconds
    await client.expire(key, ttl);
    console.log(
      `JSON data set with key '${key}' and TTL ${ttl} seconds successfully.`
    );
    // Return a success status with a status code
    return { statusCode: 200, message: "JSON data set successfully." };
  } catch (error) {
    console.error(
      `Failed to set JSON data with key '${key}' and TTL ${ttl} seconds due to error: ${error}`
    );
    // Return an error status with a status code
    return {
      statusCode: 500,
      message: "Operation failed.",
      errorDetails: error.message,
    };
  }
};


//The . character is used to specify the scope of the deletion operation in Redis. When used as shown, it indicates that the deletion should apply to all keys that match the pattern specified by the key argument. Essentially, it acts as a wildcard character, telling Redis to delete all keys that start with the given prefix.


export const delJSON = async (key) => {
  try {
    // Delete the JSON data
    const result = await client.json.del(key, "."); 
    if (result === 1) {
      console.log(`JSON data with key '${key}' deleted successfully.`);
      // Return a success status with a status code
      return { statusCode: 200, message: "JSON data deleted successfully." };
    } else {
      console.log(`No JSON data found with key '${key}'.`);
      // Return a not found status with a status code
      return { statusCode: 404, message: "No JSON data found with the provided key." };
    }
  } catch (error) {
    console.error(`Failed to delete JSON data with key '${key}' due to error: ${error}`);
    // Return an error status with a status code
    return {
      statusCode: 500,
      message: "Operation failed.",
      errorDetails: error.message,
    };
  }
};


export const withLock = async (resourceKey, ttl, callback) => {
  const lockKey = `lock:${resourceKey}`;
  return redlock.using([lockKey], ttl, async () => {
    console.log(`Lock acquired for ${resourceKey}`);
    try {
      const result = await callback();
      return result;
    } finally {
      console.log(`Lock released for ${resourceKey}`);
    }
  });
};
