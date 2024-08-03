import axios from 'axios';
import { setParaphraseHistory,getParaphraseHistory } from '../controllers/historyController.js'; 
// Paraphraser service is ready for purpose of execution

export const paraphraseText = async (text) => {


  if (!text || typeof text !== 'string') {
    throw new TypeError('Input must be a non-empty string');
  }

  const API_URL = process.env.RAPID_PARAPHRASE_API_URL;
  const API_HOST = process.env.RAPID_PARAPHRASE_HOST;
  const API_KEY = process.env.RAPID_PARAPHRASE_KEY;

  if (!API_URL || !API_HOST || !API_KEY) {
    throw new Error('Missing required environment variables');
  }

  try {
    const response = await axios({
      method: 'post',
      url: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': API_HOST,
        'X-RapidAPI-Key': API_KEY,
      },
      data: {
        text,
        result_type: 'multiple',
      },
    });

    return response.data.flat().join('\n\n');
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