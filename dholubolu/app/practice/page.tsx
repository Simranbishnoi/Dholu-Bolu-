"use client";

import { useState, useEffect } from "react";
import Mascot from "../components/DolphinMascot";
import { haryanviPhrases } from "../data/haryanvi_phrases";
import { englishTwisters, hindiTwisters, Twister } from "../data/twisters";

export default function PracticePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi" | null>(null);
  const [activeTwister, setActiveTwister] = useState<Twister | null>(null);
  
  // Mascot state: greeting, listening, happy, thinking, confused
  const [mascotState, setMascotState] = useState<"greeting" | "listening" | "happy" | "thinking" | "confused">("greeting");
  const [mascotPhrase, setMascotPhrase] = useState("");

  // Get matching phrase array based on script (Latin if no language selected, Devanagari if language selected)
  const getPhrases = () => {
    return selectedLanguage ? haryanviPhrases.devanagari : haryanviPhrases.latin;
  };

  useEffect(() => {
    const phrases = getPhrases();
    if (!selectedLanguage) {
      // Default Latin welcome
      const welcomes = phrases.welcome;
      setMascotPhrase(welcomes[0]); // "Ram Ram Bhai!..."
      setMascotState("greeting");
    } else {
      // Devanagari response when language selected
      const beforeRecs = phrases.before_recording;
      setMascotPhrase(beforeRecs[Math.floor(Math.random() * beforeRecs.length)]);
      setMascotState("thinking");
    }
  }, [selectedLanguage]);

  const handleLanguageSelect = (lang: "english" | "hindi") => {
    setSelectedLanguage(lang);
    setActiveTwister(null); // Reset active twister
  };

  const handleTwisterSelect = (twister: Twister) => {
    setActiveTwister(twister);
    setMascotState("happy");
    const highScores = getPhrases().high_score;
    setMascotPhrase(highScores[Math.floor(Math.random() * highScores.length)]);
  };

  const twistersToDisplay = selectedLanguage === "english" ? englishTwisters : selectedLanguage === "hindi" ? hindiTwisters : [];

  return (
    <div className="flex flex-col flex-1 bg-zinc-950 text-white min-h-[calc(100vh-4rem)] p-6 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">
        {/* Page Header */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20 mb-4">
          🎙️ Tongue Twister Arena
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-8">
          Select Your Speaking Challenge
        </h1>

        {/* Mascot & Instructions Section */}
        <div className="flex flex-col items-center mb-10 w-full">
          <Mascot state={mascotState} phrase={mascotPhrase} />
        </div>

        {/* Phase 3: Language Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
          {/* English Selector */}
          <button
            onClick={() => handleLanguageSelect("english")}
            className={`group flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 ${
              selectedLanguage === "english"
                ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                : "border-white/10 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60"
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🇬🇧</span>
            <h3 className="text-xl font-bold mb-1">English Twisters</h3>
            <p className="text-xs text-zinc-400">Practice English speed and articulation.</p>
            <span className="mt-4 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
              20 Twisters
            </span>
          </button>

          {/* Hindi Selector */}
          <button
            onClick={() => handleLanguageSelect("hindi")}
            className={`group flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 ${
              selectedLanguage === "hindi"
                ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                : "border-white/10 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60"
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🇮🇳</span>
            <h3 className="text-xl font-bold mb-1">Hindi Twisters</h3>
            <p className="text-xs text-zinc-400">हिन्दी साहित्य की शुद्धता और लय का अभ्यास करें।</p>
            <span className="mt-4 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
              20 Twisters
            </span>
          </button>
        </div>

        {/* Selected Twister Workspace (Visual Scaffolding) */}
        {activeTwister && (
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900/40 p-8 backdrop-blur-md shadow-2xl mb-12 flex flex-col items-center text-center animate-fade-in">
            <div className="flex items-center justify-between w-full border-b border-white/5 pb-4 mb-6">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Active Challenge</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                activeTwister.difficulty === "Beginner" ? "bg-emerald-500/20 text-emerald-400" :
                activeTwister.difficulty === "Intermediate" ? "bg-amber-500/20 text-amber-400" :
                activeTwister.difficulty === "Advanced" ? "bg-orange-500/20 text-orange-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {activeTwister.difficulty}
              </span>
            </div>

            <p className="text-2xl font-bold tracking-wide text-zinc-100 italic px-6 py-4 bg-white/5 rounded-xl border border-white/5 w-full mb-6">
              "{activeTwister.text}"
            </p>

            <div className="flex gap-4">
              <button className="h-10 px-6 rounded-xl bg-zinc-800 border border-white/5 hover:bg-zinc-700 transition-all text-sm font-semibold text-zinc-300">
                🔊 Read Aloud (TTS)
              </button>
              <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 transition-all text-sm font-semibold text-white shadow-lg shadow-red-500/10">
                🎙️ Start Recording (Whisper)
              </button>
            </div>
          </div>
        )}

        {/* Display twister list once language is selected */}
        {selectedLanguage && (
          <div className="w-full max-w-4xl animate-fade-in">
            <h2 className="text-xl font-bold text-zinc-300 mb-6 border-b border-white/5 pb-2">
              Select a {selectedLanguage === "english" ? "English" : "Hindi"} Tongue Twister to Practice
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {twistersToDisplay.map((twister) => (
                <div
                  key={twister.id}
                  onClick={() => handleTwisterSelect(twister)}
                  className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    activeTwister?.id === twister.id && activeTwister?.difficulty === twister.difficulty
                      ? "border-indigo-500 bg-indigo-500/5 shadow-md"
                      : "border-white/5 bg-zinc-900/30 hover:border-white/10 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-zinc-500">ID: #{twister.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      twister.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400" :
                      twister.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400" :
                      twister.difficulty === "Advanced" ? "bg-orange-500/10 text-orange-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {twister.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-3 text-zinc-200">
                    {twister.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
