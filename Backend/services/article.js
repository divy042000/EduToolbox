import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import axios from "axios";
const rapidApiKey = process.env.VITE_RAPID_API_ARTICLE_KEY;
const rapidApiHost=process.env.VITE_RAPID_API_ARTICLE_HOST;

    
export const getArticleSummary = async (articleUrl, length = 3) => {
    try {
        const response = await axios.get(`https://${rapidApiHost}/summarize`, {
            params: {
                url: encodeURIComponent(articleUrl),
                length: length
            },
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': rapidApiHost
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching article summary:', error);
        throw error;
    }
};
