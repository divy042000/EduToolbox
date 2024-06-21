const RAPIDAPI_HOST = "";
const RAPIDAPI_KEY = "";
const API_URL = "";

export const paraphraseText = async (text) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
    body: JSON.stringify({
      text: text,
      result_type: "multiple",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to paraphrase text");
  }

  const data = await response.json();
  return data.flat().join("\n\n");
};
