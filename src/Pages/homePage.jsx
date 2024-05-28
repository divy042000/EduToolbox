import React from 'react'
import Hero from "../components/Hero";
// import OptionsComponent from "../components/optionsComponent";
import Demo from "../components/Demo";
export default function homePage() {
  return (
    <main>
        <div className="main">
            <div className="app">
            <Hero/>
            <Demo/>
            </div>
        </div>
    </main>
  )
}
