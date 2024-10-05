import { getJSON, setJSON, delJSON } from "../controllers/redisClient.js";
import { paraphraserHistoryModel } from "../models/historySchema.js";




// API endpoint handler
export const handleParaphraseHistoryRequest = async (req, res) => {
  const { email, limit = 10, page = 1 } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email provided" });
  }

  try {
    const history = await getParaphraseHistory(email, limit, page);
    res.json(history);
  } catch (error) {
    console.error(`Failed to fetch history for email: ${email}`, error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

// Main function to get paraphrase history
export const getParaphraseHistory = async (email, limit = 20, page = 1) => {
  const key = `paraphraser:history:${email}:${page}:${limit}`;

  try {
    // Try to get history from Redis
    let history = await getJSON(key);

    if (!history) {
      // If not found in Redis, fetch from the database
      history = await ParaphraseHistoryFromDatabase(email, limit, page);
      if (history && history.length > 0) {
        // Store fetched history in Redis with an expiration time (e.g., 5 minutes)
        await setJSON(key, history, 300); // 300 seconds = 5 minutes
      } else {
        console.warn(
          `No history found for email: ${email}, page: ${page}, limit: ${limit}`
        );
      }
    }
    return history;
  } catch (error) {
    console.error(
      `Failed to fetch history for email: ${email}, page: ${page}, limit: ${limit}`,
      error
    );
    throw error;
  }
}

async function ParaphraseHistoryFromDatabase(email, limit, page) {
  try {
    const skip = (page - 1) * limit;
    return await paraphraserHistoryModel
      .findOne({ userEmail: email })
      .slice("history", [skip, limit])
      .lean()
      .exec();
  } catch (error) {
    console.error("Failed to fetch history from database:", error);
    throw error;
  }
}

const saveHistoryToDatabase = async (history) => {
  if (
    !history ||
    typeof history.originalText !== "string" ||
    typeof history.paraphrasedText !== "string" ||
    typeof history.userEmail !== "string"
  ) {
    throw new Error("Invalid history object provided.");
  }

  try {
    // Create a new document with the provided history data
    const newHistory = new paraphraserHistoryModel({
      originalText: history.originalText,
      paraphrasedText: history.paraphrasedText,
      userEmail: history.userEmail,
      createdAt: new Date(), // Automatically set the creation date
    });

    // Save the document to the database
    await newHistory.save();

    console.log("Paraphrase history saved successfully.");

    return newHistory; // Return the saved document
  } catch (error) {
    console.error("Failed to save paraphrase history:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const setParaphraseHistory = async (email, history) => {
  if (!email || typeof email !== "string" || !history) {
    throw new Error("Invalid email or history provided");
  }
  // Generate a unique key based on the email
  const key = `paraphraser:history:${email}`;
  try {
    // Save history to the database
    await saveHistoryToDatabase(history);
    // Store fetched history in Redis for future requests
    await setJSON(key, history);
    console.log(`History for email: ${email} has been saved and cached.`);
  } catch (error) {
    console.error(
      `Failed to save and cache history for email: ${email}`,
      error
    );
    throw error;
  }
};

// Assuming you have a function to delete history from the database
// This function might vary based on your schema and requirements
async function deleteHistoryFromDatabase(email) {
  try {
    await paraphraserHistoryModel.deleteOne({ userEmail: email });
    console.log("History deleted from database successfully");
  } catch (error) {
    console.error("Failed to delete history from database:", error);
    throw error;
  }
}

export const deleteParaphraseHistory = async (email) => {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided");
  }
  // Generate a unique key based on the email
  const key = `paraphraser:history:${email}`;
  try {
    // Delete history from the database
    await deleteHistoryFromDatabase(email);
    // Remove the history from Redis
    await delJSON(key); // Assuming you have a delJSON function similar to setJSON for Redis deletion
    console.log(
      `History for email: ${email} has been deleted and removed from cache.`
    );
  } catch (error) {
    console.error(
      `Failed to delete and remove history for email: ${email}`,
      error
    );
    throw error;
  }
};
