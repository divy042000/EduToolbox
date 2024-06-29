import React, { useState, useEffect } from "react";
import axios from "axios";
import { copy, linkIcon, loader, tick } from "../assets";
import ErrorToast from "../components/errorComponent";
import SuccessToast from "../components/successComponent";

const AISummarizer = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingArticle = allArticles.find(
      (item) => item.url === article.url
    );

    if (existingArticle) return setArticle(existingArticle);

    try {
      console.log("Loading");
      setIsFetching(true);
      const authToken = sessionStorage.getItem("authToken");
      console.log(authToken);
      const response = await axios.post(
        "http://localhost:4000/AISummarizer/user",
        {
          articleUrl: article.url,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Replace authToken with the actual token value
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = response;

      if (data.summary) {
        const newArticle = { ...article, summary: data.summary };
        const updatedAllArticles = [newArticle, ...allArticles];

        // Update state and local storage
        setArticle(newArticle);
        setAllArticles(updatedAllArticles);
        localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        setSuccessMessage("Article summary fetched successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage("Failed to fetch article summary.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsFetching(false);
    }
  };

  // Copy the URL and toggle the icon for user feedback
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link-icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />

          <input
            type="url"
            placeholder="Paste the article link"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            onKeyDown={handleKeyDown}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            <p>↵</p>
          </button>
        </form>

        {/* Browse History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setArticle(item)}
              className="link_card"
            >
              <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Display Result */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : errorMessage ? (
          <ErrorToast message={errorMessage} />
        ) : successMessage ? (
          <SuccessToast message={successMessage} />
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
                <div
                  className="copy_btn"
                  onClick={() => handleCopy(article.summary)}
                >
                  <img
                    src={copied === article.summary ? tick : copy}
                    alt={copied === article.summary ? "tick_icon" : "copy_icon"}
                    className="w-[40%] h-[40%] object-contain"
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default AISummarizer;
