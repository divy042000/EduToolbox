import React, { useState, useRef, useEffect } from "react";

export default function ParaphraserPage() {
  const inputTextareaRef = useRef(null);
  const outputTextareaRef = useRef(null);
  const [inputWordCount, setInputWordCount] = useState(0);
  const [outputWordCount, setOutputWordCount] = useState(0);
  const [copied, setCopied] = useState("");
  const [allParaphrases, setAllParaphrases] = useState([]);
  const [inputArticle, setInputArticle] = useState("");
  const [outputArticle, setOutputArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setLoading(true);
    setError(null);
    console.log("Input Article:", inputArticle);

    try {
      const response = await fetch("/api/paraphrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: inputArticle }],
          temperature: 1,
          max_tokens: 500,
        }),
      });
      console.log(response);
      const text = await response.text(); // Get the response as text first

      const data = JSON.parse(text); // Then try to parse it as JSON

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }

      // const data = await response.json();
      const paraphrasedText = data.choices[0].message.content;
      setOutputArticle(paraphrasedText);
      const newArticle = { originalText: inputArticle, paraphrasedText };
      setAllParaphrases([...allParaphrases, newArticle]);
      localStorage.setItem("articles", JSON.stringify([...allParaphrases, newArticle]));
    } catch (error) {
      console.error("Failed to paraphrase text:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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
            className="mt-5 px-2 z-10 py-2 bg-sky-500 text-white font-mono italic mb-3 rounded-md border-2 border-stone-950"
            disabled={loading}
          >
            {loading ? "Paraphrasing..." : "Paraphrase"}
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}
