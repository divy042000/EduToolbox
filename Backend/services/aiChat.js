import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = 'AIzaSyCDnTQM6LSp8t3MqzqLroXYq35uPrSvLz8';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const getJSoNResponse = async (textifiedJson) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(`Convert the following textified JSON into a proper JSON structure: ${textifiedJson}`);
    const jsonResponse = JSON.parse(result.response.text());
    
    console.log(jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error("Error while fetching AI response:", error);
    throw error;
  }
};


// export const getChatResponse = async () => {
//   try {
//     const chatCompletion = await openai.chat.completions.create({
//       model: "mistralai/Mistral-7B-Instruct-v0.2",
//       messages: [
//         { role: "system", content: "You are a travel agent. Be descriptive and helpful" },
//         { role: "user", content: "Tell me about San Francisco" }
//       ],
//       temperature: 0.7,
//       max_tokens: 128,
//     });
//     return chatCompletion.choices[0].message.content;
//   } catch (error) {
//     console.error("Error while fetching AI response:", error);
//     throw error;
//   }
// };

// export const getJSoNResponse = async (textifiedJson) => {
//     try {
//       const chatCompletion = await openai.chat.completions.create({
//         model: "mistralai/Mistral-7B-Instruct-v0.2",
//         messages: [
//           { role: "system", content: "You are an assistant that converts textified JSON into a proper JSON structure." },
//           { role: "user", content: `Convert the following textified JSON into a proper JSON structure: ${textifiedJson}` }
//         ],
//         temperature: 0.7,
//         max_tokens: 256,
//       });

//       const responseText = chatCompletion.choices[0].message.content;

//       // Attempt to parse the response as JSON
//       try {
//         const jsonResponse = JSON.parse(responseText);
//         return jsonResponse;
//       } catch (parsingError) {
//         console.error("Error parsing AI response as JSON:", parsingError);
//         throw new Error("The response could not be parsed as JSON. Here is the raw response: " + responseText);
//       }
//     } catch (error) {
//       console.error("Error while fetching AI response:", error);
//       throw error;
//     }
//   };
