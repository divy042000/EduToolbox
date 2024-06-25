export const ParaphraserService = async (text) => {
  try {
    const response = await fetch(process.env.RAPID_PARAPHRASE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": process.env.RAPID_PARAPHRASE_HOST,
        "x-rapidapi-key": process.env.RAPID_PARAPHRASE_KEY,
      },
      body: JSON.stringify({
        text: text,
        result_type: "multiple",
      }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to paraphrase text";
      if (response.status >= 400 && response.status < 500) {
        errorMessage = `Client error: ${response.status} ${response.statusText}`;
      } else if (response.status >= 500) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.flat().join("\n\n");
  } catch (error) {
    console.error("Error in ParaphraserService:", error.message);
    throw new Error(error.message);
  }
};
