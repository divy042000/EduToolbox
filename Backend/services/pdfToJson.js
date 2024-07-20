import pdfParse from "pdf-parse"; // Ensure you have installed the correct package
import fs from "fs";
import { getJSoNResponse } from "../services/aiChat.js";
export async function convertit(req, res) {
  // Extract the file path from the request
  // Validate the file path
  console.log("Converting PDF to text");
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json({ error: "Missing file in request" });
  }

  const filePath = req.file.path;
  // const pdfParser = new PDFParser();

  try {
    // Read the file from disk
    const fileBuffer = fs.readFileSync(filePath);

    // Parse the PDF content
    const data = await pdfParse(fileBuffer);
    let jsonData;
    try {
      jsonData = JSON.parse(data.text);
    } catch (error) {
      jsonData = { text: await formatExtractedText(data.text) }; // Fallback to plain text if JSON parsing fails
    }
    const jsonContent = JSON.stringify(jsonData, null, 4);
    const finalContent = await getJSoNResponse(jsonContent);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `converted-${timestamp}.json`;

    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/json");
    console.log(finalContent);
    res.json(finalContent);
  } catch (error) {
    console.error("PDF parsing error: ", error);
    res.status(500).json({ error: "Error processing PDF file." });
  }
}

async function formatExtractedText(text) {
  let formattedText = text.replace(/\n\s*\n/g, "\n");
  try {
    let jsonObject = JSON.parse(formattedText);
    return JSON.stringify(jsonObject, null, 4);
  } catch (e) {
    return formattedText;
  }
}
