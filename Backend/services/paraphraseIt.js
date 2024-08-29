import axios from 'axios';
import { setParaphraseHistory, getParaphraseHistory } from '../controllers/historyController.js';
import { model } from '../models/gemini.js'
// Paraphraser service is ready for purpose of execution

export const paraphraseText = async (text) => {


  if (!text || typeof text !== 'string') {
    throw new TypeError('Input must be a non-empty string');
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  console.log(GEMINI_API_KEY);

  try {
    const geminiQuery = `Act as a text paraphraser service and paraphrase the given text: 
        ${text}`;

    const geminiResults = await model.generateContent(geminiQuery);
    const response = geminiResults.response;
    const textContent = response.text();

    // Save the paraphrased text to the database
    await setParaphraseHistory(text, textContent);

    // Get the paraphrase history
    const paraphraseHistory = await getParaphraseHistory();

    return {
      textContent, paraphraseHistory
    };
  } catch (error) {
    console.error('Error in paraphraseText:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const errorMessage = status >= 400 && status < 500
        ? `Client error: ${status} ${error.response.statusText}`
        : `Server error: ${status} ${error.response.statusText}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from the server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up the request');
    }
  }
};