import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if the user is authenticated on component mount
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/Logout/user", {}, {
        headers: { 'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1]}` }
      });
      setIsAuthenticated(false);
      // Clear the token cookie on the client-side
      document.cookie = "token=; Max-Age=0; path=/;"; 
    } catch (error) {
      console.error("Logout error:", error);
      setErrorMessage("Failed to logout. Please try again.");
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <>
          <a href="/SignIn">Sign In</a>
          <a href="/SignUp">Sign Up</a>
        </>
      )}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
