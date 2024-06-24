import React, { useState, useRef, useEffect } from "react";
import { paraphraseText } from "../../Backend/services/paraphraseIt";
import ErrorToast from "../components/errorComponent";

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


  const handleParaphrase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const paraphrasedText = await paraphraseText(inputArticle);
      
      // Check word limit
      const wordLimit = 100;
      const words = paraphrasedText.split(/\s+/).filter(Boolean);
      if (words.length > wordLimit) {
        throw new Error(`Paraphrased text exceeds ${wordLimit} words.`);
      }
  
      setOutputArticle(paraphrasedText);
      setOutputWordCount(words.length);
  
      const newArticle = { originalText: inputArticle, paraphrasedText };
      setAllParaphrases([...allParaphrases, newArticle]);
    } catch (error) {
      console.error("Failed to paraphrase text:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col w-full pointer-events-auto">
      <h1 className="head_text">
        Your own Writing Companion
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
          onClick={() => window.open("https://github.com/hhchoksi")}
        >
          Github
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}
