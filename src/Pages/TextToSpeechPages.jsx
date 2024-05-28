import React, { useState, useEffect, useRef } from "react";

const TextToSpeech = () => {
  const textareaRef = useRef(null);
  const voiceListRef = useRef(null);
  const speechBtnRef = useRef(null);

  // Initialize currentUtterance as a state variable
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const [synth, setSynth] = useState(window.speechSynthesis);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (synth) {
      voices();
      synth.addEventListener("voiceschanged", voices);
    }
    return () => {
      if (synth) {
        synth.removeEventListener("voiceschanged", voices);
      }
    };
  }, [synth]);

  // Reset currentUtterance on component mount
  useEffect(() => {
    setCurrentUtterance(null);
    synth.cancel();
  }, [synth]);

  function voices() {
    if (!synth || !voiceListRef.current) return;

    for (const voice of synth.getVoices()) {
      const selected = voice.name === "Google US English" ? "selected" : "";
      const option = `<option value="${voice.name}" ${selected}>${voice.name} (${voice.lang})</option>`;
      voiceListRef.current.insertAdjacentHTML("beforeend", option);
    }
  }

  function textToSpeech(text) {
    if (!synth) return;

    const newUtterance = new SpeechSynthesisUtterance(text);
    for (const voice of synth.getVoices()) {
      if (voice.name === voiceListRef.current.value) {
        newUtterance.voice = voice;
        break;
      }
    }
    newUtterance.onend = () => {
      setCurrentUtterance(null); // Reset currentUtterance when speech ends
    };
    synth.speak(newUtterance);
    setCurrentUtterance(newUtterance); // Update currentUtterance state
  }

  const handleTextChange = (e) => {
    const counts = e.target.value.split(/\s+/).filter(Boolean).length;
    setWordCount(counts);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    const text = textareaRef.current.value;

    if (synth.paused) {
      synth.resume();
      speechBtnRef.current.innerText = "Pause Speech";
    } else if (synth.speaking) {
      synth.pause();
      speechBtnRef.current.innerText = "Resume Speech";
    } else {
      if (text.trim() !== "") {
        if (!synth.speaking) {
          textToSpeech(text);
        }
      }
    }
  };
  return (
    <div className="justify-center">
      <h1 className="head_text flex-col mb-1.5">
        Read Articles Easily
      </h1>
      <div>
        <div className="flex flex-col items-center text-xl mt-2 ">
          <div className="flex flex-col w-3/5  items-center m-2">
            <textarea
              ref={textareaRef}
              className="border-2 w-full rounded-md border-slate-950 h-96 m-2 font-mono italic p-2"
              placeholder="Paste your text here or type directly"
              onChange={handleTextChange}
            />{" "}
            {/* Added a class for styling */}
            <p className="font-mono italic">Word Count: {wordCount}</p>
            <div className="flex flex-col w-2/5 border-3 mt-2 mb-2">
              <select
                ref={voiceListRef}
                className="voice-select border-2 rounded-md border-slate-950 font-mono italic"
              />{" "}
              {/* Added a class for styling */}
              <button
                ref={speechBtnRef}
                onClick={handleButtonClick}
                className="border-2 rounded-md border-slate-950 z-10 m-2 font-mono italic"
              >
                Start Speaking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
