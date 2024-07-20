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
        console.log("Process called")
         // Retrieve the token from Session Storage
         const authToken = sessionStorage.getItem('authToken');
         console.log(authToken);
         const response = await axios.post('http://localhost:4000/Paraphrase/user', {
          text: inputArticle,
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`, // Replace authToken with the actual token value
            'Content-Type': 'application/json'
          }
        });
        
        
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Task Management</h1>
      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200">Add Task</button>
        </form>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200">Export Tasks</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task._id} className="border-b border-gray-200 py-2 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-sm text-gray-500">Due Date: {task.dueDate}</p>
            </div>
            <button onClick={() => handleDelete(task._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};