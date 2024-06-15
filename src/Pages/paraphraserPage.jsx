import React, { useState, useRef, useEffect } from "react";
import { useParaphraseTextMutation } from "../services/paraphraseIt";
import { copy, linkIcon, loader, tick } from "../assets";

export default function ParaphraserPage() {
  const inputTextareaRef = useRef(null);
  const outputTextareaRef = useRef(null);
  const [inputWordCount, setInputWordCount] = useState(0);
  const [outputWordCount, setOutputWordCount] = useState(0);
  const [copied, setCopied] = useState("");
  const [paraphraseText, { error, isFetching }] = useParaphraseTextMutation();
  const [allParaphrases, setAllParaphrases] = useState([]);
  const [inputArticle, setInputArticle] = useState("");
  const [outputArticle, setOutputArticle] = useState("");

  useEffect(() => {
    const previousArticles = JSON.parse(localStorage.getItem("articles")) || [];
    setAllParaphrases(previousArticles);
  }, []);

  const handleTextChange = (e) => {
    const counts = e.target.value.split(/\s+/).filter(Boolean).length;
    setInputWordCount(counts);
    setInputArticle(e.target.value);
  };

  const handleParaphrase = async (e) => {
    e.preventDefault();
    try {
       const result = await paraphraseText({ text: inputArticle }).unwrap();
       const paraphrasedText = result.data.paraphrasedText; // Update to access the paraphrased text from the response
       setOutputArticle(paraphrasedText);
       const newArticle = { originalText: inputArticle, paraphrasedText };
       setAllParaphrases([...allParaphrases, newArticle]);
       localStorage.setItem("articles", JSON.stringify([...allParaphrases, newArticle]));
    } catch (error) {
       console.error("Failed to paraphrase text:", error);
    }
  };

  return (
    <div className="flex flex-col w-full pointer-events-auto">
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
            className="mt-5 px-2 z-10 py-2 bg-sky-500 text-white font-mono italic mb-3 rounded-md  border-2 border-stone-950"
          >
            Paraphrase
          </button>
        </div>
      </div>
    </div>
  );
}
