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

const hmgetAsync = (key, ...fields) => {
  return new Promise((resolve, reject) => {
    client.hget(key, fields, (err, replies) => {
      if (err) {
        reject(err);
      } else {
        resolve(replies);
      }
    });
  });
};

export const hsetAsync = (key, fieldValues) => {
  return new Promise((resolve, reject) => {
    client.hset(key, fieldValues, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

export const getFieldValues = async (hashKey, fields) => {
  try {
    const result = await hmgetAsync(hashKey, ...fields);
    console.log(`Field values retrieved for hash key "${hashKey}":`, result);
    return result;
  } catch (error) {
    console.error(
      `Error retrieving field values for hash key "${hashKey}":`,
      error
    );
    throw error;
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
    await client.set(key, JSON.stringify(value), {
      EX: ttlInSeconds,
      NX: true,
    });

    console.log(`Key ${key} set successfully`);
  } catch (error) {
    console.error(`Error setting key ${key}:`, error);
    throw error;
  }
};
