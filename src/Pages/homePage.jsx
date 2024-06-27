import React from 'react'
import Hero from "../components/Hero";
// import OptionsComponent from "../components/optionsComponent";
import AISummarizer from "../Pages/aiSummarizerPage";
export default function homePage() {
  return (
    <main>
        <div className="main">
            <div className="app">
            <Hero/>
            <AISummarizer/>
            </div>
        </div>
    </main>
  )
}
