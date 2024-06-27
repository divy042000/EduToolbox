import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import axios from "axios";

const rapidApiKey = process.env.VITE_RAPID_API_ARTICLE_KEY;
const rapidApiHost = process.env.VITE_RAPID_API_ARTICLE_HOST;

export const getArticleSummary = async (articleUrl, length = 3) => {
  try {
    console.log("Fetching article summary...");
    const response = await axios.get(`https://${rapidApiHost}/summarize`, {
      params: {
        url: encodeURIComponent(articleUrl),
        length: length,
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
      },
    });

    if (!response.ok) {
        let errorMessage = "Failed to summarize article";
        if (response.status >= 400 && response.status < 500) {
          errorMessage = `Client error: ${response.status} ${response.statusText}`;
        } else if (response.status >= 500) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
  
      // Assuming the API returns a flat array of summaries, join them with newlines
      return response.data.join("\n\n");
    } catch (error) {
      console.error("Error fetching article summary:", error);
      throw error;
    }
  };