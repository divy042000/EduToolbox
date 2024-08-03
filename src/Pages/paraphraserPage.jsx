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
  const [showHistory, setShowHistory] = useState(false);

  function handleWordCount(text) {
    if (typeof text !== "string") {
      return 0;
    }
    const words = text.split(/\s+/).filter(Boolean);
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
    try {
      if (inputWordCount >= 20) {
        const authToken = sessionStorage.getItem("authToken");
        const response = await axios.post(
          "http://localhost:4000/Paraphrase/user",
          { text: inputArticle },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const getTextSnippet = (text) => {
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  const handleHistoryItemClick = (item) => {
    setInputArticle(item.originalText);
    setOutputArticle(item.paraphrasedText);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative isolate px-6 pt-4 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-auto blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl py-3 sm:py-24 lg:py-32">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-mono">
              Paraphraser
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 font-mono">
              Effortlessly rephrase your text while maintaining its original
              meaning.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="w-full lg:w-1/2">
              <textarea
                ref={inputTextareaRef}
                value={inputArticle}
                onChange={handleTextChange}
                placeholder="Enter text to paraphrase..."
                className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden"
              />
              <p className="text-sm text-gray-500 mt-2">
                Word Count: {inputWordCount}
              </p>
              <button
                onClick={handleParaphrase}
                className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-200 font-semibold"
              >
                {loading ? "Paraphrasing..." : "Paraphrase"}
              </button>
              {error && <ErrorToast message={error} />}
            </div>

            <div className="w-full lg:w-1/2 flex flex-col">
              <div className="flex-1">
                <textarea
                  ref={outputTextareaRef}
                  value={outputArticle}
                  readOnly
                  placeholder="Paraphrased text will appear here..."
                  className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none bg-gray-50 overflow-hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Word Count: {outputWordCount}
                </p>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={toggleHistory}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200"
                >
                  {showHistory ? "Hide History" : "Show History"}
                </button>
              </div>
              {showHistory && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Paraphrase History</h2>
                  <ul className="space-y-2">
                    {allParaphrases.map((item, index) => (
                      <li 
                        key={index}
                        onClick={() => handleHistoryItemClick(item)}
                        className="cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200"
                      >
                        <p className="font-semibold">Original:</p>
                        <p>{getTextSnippet(item.originalText)}</p>
                        <p className="font-semibold mt-1">Paraphrased:</p>
                        <p>{getTextSnippet(item.paraphrasedText)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
