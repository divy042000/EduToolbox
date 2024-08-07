import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/homePage';
import TextToSpeechPage from './Pages/TextToSpeechPages'; // Assuming this is the path
import ParaphraserPage from './Pages/paraphraserPage';
import './App.css'
import StudentPage from './Pages/studentPage';
import AboutPage from './Pages/aboutPage';
import SignUpPage from './Pages/signupPage.jsx';
import SignInPage from './Pages/signinPage';
import MoreFeatures from './Pages/moreFeatures';
import ErrorPage from './Pages/errorPage';
import FlowRenderer from './Pages/mindmapPage';
import TaskListComponent from './components/tasklist';
import ForgotPasswordPage from './Pages/forgotPassword.jsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/summarizerPage" element={<HomePage />} /> {/* Home route */}
        <Route path="/text-to-speech" element={<TextToSpeechPage />} />
        <Route path="/textParaphraser" element={<ParaphraserPage />} />
        <Route path="/StudentPage" element={<StudentPage />} />
        <Route path="/aboutPage" element={<AboutPage/>} />
        <Route path="/tasklist" element={<TaskListComponent />} /> {/* Task List route */}
        <Route path="/SignUpPage" element={<SignUpPage/>}/>
        <Route path="/SignInPage" element={<SignInPage/>}/>
        <Route path="/mindmapPage" element={<FlowRenderer/>}/>
        <Route path="/moreFeatures" element={<MoreFeatures/>}/>
        <Route path="/ForgotPasswordPage" element={<ForgotPasswordPage/>}/>
        <Route path="*" element={<ErrorPage />} />      
        </Routes>
    </Router>
  );
}

export default App;
