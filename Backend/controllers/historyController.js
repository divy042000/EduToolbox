import { getJSON, setJSON,delJSON } from "../controllers/redisClient.js";
import { paraphraserHistoryModel } from "../models/historySchema.js";




async function fetchparapharseHistoryFromDatabase(email) {
  try {
    //Calling .lean() converts these document instances into plain objects,
    //Calling .exec() forces the execution of the query. Without .exec(), the query wouldn't actually run until you awaited the promise it returns.
    return await paraphraserHistoryModel
      .findOne({ userEmail: email })
      .lean()
      .exec();
  } catch (error) {
    console.error("Failed to fetch history from database:", error);
    throw error;
  }
}

export const getParaphraseHistory = async (email) => {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided");
  }
  // Generate a unique key based on the email
  const key = `paraphraser:history:${email}`;
  try {
    // Try to get history from Redis
    const history = await getJSON(key);
    if (!history) {

      // If not found in Redis, fetch from the database
      const historyFromDb = await fetchparapharseHistoryFromDatabase(email);

      if (historyFromDb) {
        // Store fetched history in Redis for future requests
        await setJSON(key, historyFromDb);
      } else {
        console.warn(`No history found for email: ${email}`);
      }
    }
    // returning history JSON Data.

    return history;
  } catch (error) {
    console.error(`Failed to fetch history for email: ${email}`, error);
    throw error;
  }
};

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

export const setParaphraseHistory = async (email,history) => {
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
      console.log('History deleted from database successfully');
    } catch (error) {
      console.error('Failed to delete history from database:', error);
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
      console.log(`History for email: ${email} has been deleted and removed from cache.`);
    } catch (error) {
      console.error(
        `Failed to delete and remove history for email: ${email}`,
        error
      );
      throw error;
    }
  };
  