import React, { useState, useRef, useEffect } from "react";
import { useParaphraseTextMutation } from "../services/paraphraseIt";
import { copy, linkIcon, loader, tick } from "../assets";

export default function ParaphraserPage() {
  const textareaRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState("");
  const [paraphraseText, { error, isFetching }] = useParaphraseTextMutation();
  const [allParaphrases, setAllParaphrases] = useState([]);
  const [article, setArticle] = useState("");
  useEffect(() => {
    // Fetch previous articles from localStorage on mount
    const previousArticles = JSON.parse(localStorage.getItem("articles")) || [];
    setAllParaphrases(previousArticles);
  }, []); // Empty dependency array to only run this effect once, on mount

  const handleTextChange = (e) => {
    const counts = e.target.value.split(/\s+/).filter(Boolean).length;
    setWordCount(counts);
    setArticle(e.target.value); // Update the article state with the text from the textarea
  };

// Assuming the endpoint URL is correct and you've updated it in your API slice
const handleParaphrase = async (e) => {
  e.preventDefault();
  // Check if the article is already in the list of paraphrases
  const existingArticle = allParaphrases.find((item) => item.text === article);
  if (existingArticle) {
     return setArticle(existingArticle);
  }
 
  try {
     // Call the mutation with the article text
     const result = await paraphraseText({ text: article }).unwrap();
 
     // Assuming the response contains a 'paraphrasedText' field
     const paraphrasedText = result.paraphrasedText;
 
     // Create a new article object with the original and paraphrased text
     const newArticle = { originalText: article, paraphrasedText };
 
     // Update the state with the new article
     setAllParaphrases([...allParaphrases, newArticle]);
 
     // Optionally, update local storage
     localStorage.setItem("articles", JSON.stringify([...allParaphrases, newArticle]));
  } catch (error) {
     // Handle any errors from the mutation
     console.error("Failed to paraphrase text:", error);
  }
 };
 
  return (
    <div className="flex flex-col w-full pointer-events-auto">
      <div className="flex flex-col items-center">
        <div className="flex flex-row justify-center w-full z-10 grid-cols-1 mt-5 gap-4">
          <div className="w-2/5 mt-5 mb-5">
            <textarea
              ref={textareaRef}
              className="border-4 w-full rounded-md border-slate-950 h-96 m-2 font-mono italic p-2 select-auto ..."
              placeholder="Paste your text here or type directly"
              onChange={handleTextChange}
            />
            {/* Display word count next to the textarea */}
            <div className="text-right mt-2 font-mono italic">
              Words: {wordCount}
            </div>
          </div>
          <div className="w-2/5 mt-5 mb-5">
            <textarea
              ref={textareaRef}
              className="border-4 w-full rounded-md border-slate-950 h-96 m-2 font-mono italic p-2 select-auto ..."
              placeholder="Your Paraprased Text is Here"
              onChange={handleTextChange}
            />
            {/* Display word count next to the textarea */}
            <div className="text-right mt-2 font-mono italic">
              Words: {wordCount}
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
