import React, { useState, useRef, useEffect } from "react";
import ErrorToast from "../components/errorComponent";
import axios from "axios";

export default function ParaphraserPage() {
  const inputTextareaRef = useRef(null);
  const outputTextareaRef = useRef(null);
  const [inputWordCount, setInputWordCount] = useState(0);
  const [outputWordCount, setOutputWordCount] = useState(0);
  const [allParaphrases, setAllParaphrases] = useState([]);
  const [inputArticle, setInputArticle] = useState("");
  const [outputArticle, setOutputArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleWordCount(text) {
    // Check if the input is a string
    if (typeof text !== "string") {
      return 0;
    }
    // Split the text into an array of words
    const words = text.split(/\s+/).filter(Boolean);

    // Return the length of the words array
    return words.length;
  }

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setInputArticle(newText);
    setInputWordCount(handleWordCount(newText));
  };

  const handleParaphrase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("Button is being pressed!");

    try {
      // Check if the input word count is greater than or equal to 20
      if (inputWordCount >= 20) {
        console.log("Process called");
        // Retrieve the token from Session Storage
        const authToken = sessionStorage.getItem("authToken");
        console.log(authToken);
        const response = await axios.post(
          "http://localhost:4000/Paraphrase/user",
          {
            text: inputArticle,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Replace authToken with the actual token value
              "Content-Type": "application/json",
            },
          }
        );

        const paraphrasedText = response.data.paraphrasedText;

        setOutputArticle(paraphrasedText);
        setOutputWordCount(handleWordCount(paraphrasedText));

        const newArticle = { originalText: inputArticle, paraphrasedText };
        setAllParaphrases([...allParaphrases, newArticle]);
      } else {
        setError("Word Count must be greater than 20 words!");
      }
    } catch (error) {
      console.error("Failed to paraphrase text:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col w-full pointer-events-auto">
        <h1 className="head_text">
          <br className="max-md:hidden" />
          <span className="blue_gradient">Genius Paraphraser</span>
        </h1>
        <div className="flex flex-col items-center">
          <div className="flex flex-row justify-center w-full z-10 grid-cols-1 mt-5 gap-4">
            <div className="w-2/5 mt-5 mb-5">
              <textarea
                ref={inputTextareaRef}
                className="border-4 w-full rounded-md border-slate-950 h-96 m-2 font-mono italic p-2 select-auto ..."
                placeholder="Paste your text here or type directly"
                onChange={handleTextChange}
                value={inputArticle}
              />
              <div className="text-right mt-2 font-mono italic">
                Words: {inputWordCount}
              </div>
            </div>
            <div className="w-2/5 mt-5 mb-5">
              <textarea
                ref={outputTextareaRef}
                className="border-4 w-full rounded-md border-slate-950 h-96 m-2 font-mono italic p-2 select-auto ..."
                placeholder="Your Paraphrased Text is Here"
                value={outputArticle}
                readOnly
              />
              <div className="text-right mt-2 font-mono italic">
                Words: {outputWordCount}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={handleParaphrase}
              className="mt-5 px-2 z-10 py-2 bg-blue-500 text-white font-mono italic mb-3 rounded-md border-2 border-stone-950"
              disabled={loading}
            >
              {loading ? "Paraphrasing..." : "Paraphrase It"}
            </button>
          </div>
          <button
            type="button"
            className="black_btn"
            onClick={() => window.open("")}
          >
            Github
          </button>
        </div>
      </div>
      {error && <ErrorToast message={error} />}
    </div>
  );
}
