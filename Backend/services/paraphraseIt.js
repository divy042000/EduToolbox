const RAPIDAPI_HOST = "paraphrase-genius.p.rapidapi.com";
const RAPIDAPI_KEY = "a528c4b3b8msh1e354fb52ee483cp1fdd9ejsn34fa98f976c4";
const API_URL = "https://paraphrase-genius.p.rapidapi.com/dev/paraphrase/";

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
