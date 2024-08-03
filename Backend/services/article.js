import { config as dotenvConfig } from "dotenv";
import axios from 'axios';

dotenvConfig();

// Ready for purpose of execution ....

const RAPID_API_KEY = process.env.VITE_RAPID_API_ARTICLE_KEY;
const RAPID_API_HOST = process.env.VITE_RAPID_API_ARTICLE_HOST;

if (!RAPID_API_KEY || !RAPID_API_HOST) {
  throw new Error('Missing required environment variables');
}


export const getArticleSummary = async (articleUrl, length = 3) => {
  if (!articleUrl || typeof articleUrl !== 'string') {
    throw new TypeError('articleUrl must be a non-empty string');
  }

  if (!Number.isInteger(length) || length < 1) {
    throw new TypeError('length must be a positive integer');
  }

  try {
    const response = await axios.get(`https://${RAPID_API_HOST}/summarize`, {
      params: {
        url: encodeURIComponent(articleUrl),
        length: length
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in getArticleSummary:', error);
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