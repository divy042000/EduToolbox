import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/homePage';
import TextToSpeechPage from './Pages/TextToSpeechPages'; // Assuming this is the path
import ParaphraserPage from './Pages/paraphraserPage';
import './App.css'
import StudentPage from './Pages/studentPage';
import ErrorPage from './Pages/errorPage';
import AboutPage from './Pages/aboutPage';
import SignUpPage from './Pages/signupPage';
import SignInPage from './Pages/signinPage';
import MoreFeatures from './Pages/moreFeatures';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/summarizerPage" element={<HomePage />} /> {/* Home route */}
        <Route path="/text-to-speech" element={<TextToSpeechPage />} />
        <Route path="/textParaphraser" element={<ParaphraserPage />} />
        <Route path="/StudentPage" element={<StudentPage />} />
        <Route path="/aboutPage" element={<AboutPage/>} />
        <Route path="/SignUpPage" element={<SignUpPage/>}/>
        <Route path="/SignInPage" element={<SignInPage/>}/>
        <Route path="/moreFeatures" element={<MoreFeatures/>}/>
        <Route path="*" element={<ErrorPage />} />      
        </Routes>
    </Router>
  );
}

export default App;
