import axios from "axios";
import {
  setParaphraseHistory,
  getParaphraseHistory,
} from "../controllers/historyController.js";

// Function to paraphrase text using the Rapid Paraphrase API
export const paraphrasedText = async (paraphrasingText, email) => {
  

  const API_URL = process.env.RAPID_PARAPHRASE_API_URL;
  const API_HOST = process.env.RAPID_PARAPHRASE_HOST;
  const API_KEY = process.env.RAPID_PARAPHRASE_KEY;

  if (!API_URL || !API_HOST || !API_KEY) {
    throw {
      status: 500,
      message: "Missing required environment variables",
    };
  }

  try {
    const response = await axios({
      method: "post",
      url: API_URL,
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": API_HOST,
        "X-RapidAPI-Key": API_KEY,
      },
      data: {
        paraphrasingText,
        result_type: "multiple",
      },
    });
    const paraphrasedText = response.data.flat().join("\n\n");
    const paraphraseHistory = {
      originalText: paraphrasingText,
      paraphrasedText: paraphrasedText,
      userEmail: email,
    };
    await setParaphraseHistory(email, paraphraseHistory);
    return paraphrasedText;
  } catch (error) {
    console.error("Error in paraphraseText:", error);
    let status = 500;
    let errorMessage = "An unexpected error occurred";
    if (error.response) {
      status = error.response.status;
      errorMessage =
        status >= 400 && status < 500
          ? `Client error: ${status} ${error.response.statusText}`
          : `Server error: ${status} ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = "No response received from the server";
    } else if (error instanceof TypeError) {
      status = 400;
      errorMessage = `Type error: ${error.message}`;
    } else if (error.status) {
      status = error.status;
      errorMessage = error.message;
    }
    throw {
      status,
      message: errorMessage,
    };  
  }
};



// Function to handle paraphrasing requests
export const paraphraserService = async (req, res) => {
  try {
    const { paraphrasingText, email } = req.body;
    const result = await paraphrasedText(paraphrasingText, email);
    res.status(200).json({
      result,
      success: true,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
      success: false,
    });
  }
};
