"use client";

import { useState, useEffect } from "react";
import Mascot from "../components/DolphinMascot";
import { haryanviPhrases } from "../data/haryanvi_phrases";
import { englishTwisters, hindiTwisters, Twister } from "../data/twisters";
import { getDailyChallenge, DailyChallengeInfo } from "../utils/dailyChallenge";

export default function PracticePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi" | null>(null);
  const [activeTwister, setActiveTwister] = useState<Twister | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeInfo | null>(null);

  // Mascot state: greeting, listening, happy, thinking, confused
  const [mascotState, setMascotState] = useState<"greeting" | "listening" | "happy" | "thinking" | "confused">("greeting");
  const [mascotPhrase, setMascotPhrase] = useState("");

  // Text to Speech States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Load Daily Challenge and check URL params on mount
  useEffect(() => {
    const daily = getDailyChallenge();
    setDailyChallenge(daily);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get("lang");
      const idParam = params.get("id");

      if (langParam === "english" || langParam === "hindi") {
        setSelectedLanguage(langParam);
        const list = langParam === "english" ? englishTwisters : hindiTwisters;
        const idVal = parseInt(idParam || "", 10);
        const match = list.find(t => t.id === idVal);
        if (match) {
          setActiveTwister(match);
          setMascotState("happy");
          const highScores = haryanviPhrases.devanagari.high_score;
          setMascotPhrase(highScores[Math.floor(Math.random() * highScores.length)]);
          return;
        }
      }
    }

    const welcomes = haryanviPhrases.latin.welcome;
    setMascotPhrase(welcomes[0]);
    setMascotState("greeting");
  }, []);

  // Cancel speech on unmount or active twister change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [activeTwister]);

  // Update Mascot when language is explicitly selected
  const handleLanguageSelect = (lang: "english" | "hindi") => {
    setSelectedLanguage(lang);
    setActiveTwister(null);

    const phrases = haryanviPhrases.devanagari;
    const beforeRecs = phrases.before_recording;
    setMascotPhrase(beforeRecs[Math.floor(Math.random() * beforeRecs.length)]);
    setMascotState("thinking");
  };

  const handleTwisterSelect = (twister: Twister) => {
    setActiveTwister(twister);
    setMascotState("happy");
    const highScores = haryanviPhrases.devanagari.high_score;
    setMascotPhrase(highScores[Math.floor(Math.random() * highScores.length)]);
  };

  // Phase 4: Surprise Me (Random Selector)
  const handleSurpriseMe = () => {
    let currentLang = selectedLanguage;
    if (!currentLang) {
      currentLang = Math.random() > 0.5 ? "english" : "hindi";
      setSelectedLanguage(currentLang);
    }

    const list = currentLang === "english" ? englishTwisters : hindiTwisters;
    const randomTwister = list[Math.floor(Math.random() * list.length)];
    setActiveTwister(randomTwister);

    const phrases = haryanviPhrases.devanagari;
    const achievements = phrases.achievement_unlock;
    setMascotPhrase(achievements[Math.floor(Math.random() * achievements.length)]);
    setMascotState("happy");
  };

  // Phase 5: Load Daily Challenge
  const handleLoadDailyChallenge = () => {
    if (!dailyChallenge) return;
    setSelectedLanguage(dailyChallenge.language);
    setActiveTwister(dailyChallenge.twister);

    setMascotPhrase("राम राम! आज का डेली चैलेंज लोड हो गया सै। जमा साफ बोलियो!");
    setMascotState("thinking");
  };

  // Phase 6: Text To Speech (TTS) Controls
  const handleTTSPlay = () => {
    if (!activeTwister || typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      setMascotState("listening");
      return;
    }

    synth.cancel(); // Cancel any existing speech

    const utterance = new SpeechSynthesisUtterance(activeTwister.text);
    const voices = synth.getVoices();
    
    let matchedVoice = null;
    if (selectedLanguage === "hindi") {
      matchedVoice = voices.find(v => v.lang.startsWith("hi")) || null;
    } else {
      matchedVoice = voices.find(v => v.lang.startsWith("en")) || null;
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.rate = speechRate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setMascotState("listening");
      setMascotPhrase(
        selectedLanguage === "hindi"
          ? "राम राम! ध्यान ते सुनियो, मैं बोलूं सूँ।"
          : "Ram Ram! Listen carefully, I am speaking now."
      );
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setMascotState("happy");
      setMascotPhrase(
        selectedLanguage === "hindi"
          ? "लो भाई, अब थारी बारी! रिकॉर्ड दबाओ।"
          : "Now it's your turn! Press record."
      );
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setMascotState("greeting");
    };

    synth.speak(utterance);
  };

  const handleTTSPause = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      setMascotState("thinking");
      setMascotPhrase(
        selectedLanguage === "hindi"
          ? "रोक दिया भाई! दोबारा सुनना हो तो प्ले करियो।"
          : "Paused! Press play to resume."
      );
    }
  };

  const handleTTSStop = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setMascotState("thinking");
    setMascotPhrase(
      selectedLanguage === "hindi"
        ? "रोक दिया सै। फेर ते शुरू करांगे।"
        : "Stopped. Let's start again."
    );
  };

  const twistersToDisplay = selectedLanguage === "english" ? englishTwisters : selectedLanguage === "hindi" ? hindiTwisters : [];

  return (
    <div className="flex flex-col flex-1 bg-[#FAF9F5] dark:bg-[#090d16] text-slate-800 dark:text-zinc-200 min-h-[calc(100vh-4rem)] p-6 relative pb-16 transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-sky-200/10 dark:bg-sky-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-100/20 dark:bg-indigo-950/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">
        
        {/* Page Header */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 mb-4">
          🎙️ Tongue Twister Arena
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-800 dark:text-zinc-100 mb-6">
          Select Your Speaking Challenge
        </h1>

        {/* Phase 5: Daily Challenge Mini Banner */}
        {dailyChallenge && (
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div className="text-left">
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Daily Challenge available</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 italic">"{dailyChallenge.twister.text}"</p>
              </div>
            </div>
            <button
              onClick={handleLoadDailyChallenge}
              className="h-8 px-4 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 font-bold text-xs transition-all"
            >
              Load Challenge
            </button>
          </div>
        )}

        {/* Mascot Section */}
        <div className="flex flex-col items-center mb-8 w-full">
          <Mascot state={mascotState} phrase={mascotPhrase} />
        </div>

        {/* Phase 3: Language Selectors & Shuffle */}
        <div className="flex flex-col items-center w-full max-w-2xl mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-6">
            <button
              onClick={() => handleLanguageSelect("english")}
              className={`group flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 ${
                selectedLanguage === "english"
                  ? "border-sky-400 dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              }`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🇬🇧</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">English Twisters</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Practice English speed and articulation.</p>
              <span className="mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30">
                20 Twisters
              </span>
            </button>

            <button
              onClick={() => handleLanguageSelect("hindi")}
              className={`group flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300 ${
                selectedLanguage === "hindi"
                  ? "border-purple-400 dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              }`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🇮🇳</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Hindi Twisters</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">हिन्दी साहित्य की शुद्धता और लय का अभ्यास करें।</p>
              <span className="mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                20 Twisters
              </span>
            </button>
          </div>

          <button
            onClick={handleSurpriseMe}
            className="flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm w-full sm:w-auto"
          >
            🎲 Surprise Me! (Random Selection)
          </button>
        </div>

        {/* Selected Twister Workspace */}
        {activeTwister && (
          <div className="w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-8 shadow-md dark:shadow-none mb-12 flex flex-col items-center text-center animate-fade-in">
            <div className="flex items-center justify-between w-full border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Active Challenge</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                activeTwister.difficulty === "Beginner" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" :
                activeTwister.difficulty === "Intermediate" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" :
                activeTwister.difficulty === "Advanced" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30" :
                "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"
              }`}>
                {activeTwister.difficulty}
              </span>
            </div>

            <p className="text-2xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 italic px-6 py-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 w-full mb-6">
              "{activeTwister.text}"
            </p>

            {/* TTS & Speech Controls Workspace */}
            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col gap-6 items-center">
              {/* TTS Controls Panel */}
              <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 w-full max-w-md shadow-inner">
                
                {/* Play / Pause Toggle Button */}
                {!isPlaying && !isPaused ? (
                  <button
                    onClick={handleTTSPlay}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 px-4 text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    <span>🔊</span> Play Pronunciation
                  </button>
                ) : isPlaying ? (
                  <button
                    onClick={handleTTSPause}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    <span>⏸️</span> Pause Speech
                  </button>
                ) : (
                  <button
                    onClick={handleTTSPlay}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 px-4 text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    <span>▶️</span> Resume Speech
                  </button>
                )}

                {/* Stop / Reset Button */}
                {(isPlaying || isPaused) && (
                  <button
                    onClick={handleTTSStop}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm transition-colors"
                    title="Stop and Reset"
                  >
                    ⏹️
                  </button>
                )}

                {/* Speech Speed (Rate) Selector */}
                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mr-1">Speed</span>
                  {[0.75, 1.0, 1.25].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      disabled={isPlaying || isPaused}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                        speechRate === rate
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent disabled:opacity-50"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

              </div>

              {/* Voice Recording Button Scaffolding (Phase 7 target) */}
              <div className="w-full flex justify-center">
                <button className="h-12 w-full max-w-xs rounded-xl bg-slate-800 dark:bg-slate-150 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 transition-all text-sm font-semibold shadow-md flex items-center justify-center gap-2">
                  🎙️ Start Voice Recording
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display twister list once language is selected */}
        {selectedLanguage && (
          <div className="w-full max-w-4xl animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-200 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
              Select a {selectedLanguage === "english" ? "English" : "Hindi"} Tongue Twister to Practice
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {twistersToDisplay.map((twister) => (
                <div
                  key={twister.id}
                  onClick={() => handleTwisterSelect(twister)}
                  className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900/35 ${
                    activeTwister?.id === twister.id && activeTwister?.difficulty === twister.difficulty
                      ? "border-sky-400 dark:border-sky-500 bg-sky-50/20 dark:bg-sky-950/15 shadow-sm"
                      : "border-slate-100 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">ID: #{twister.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      twister.difficulty === "Beginner" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" :
                      twister.difficulty === "Intermediate" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" :
                      twister.difficulty === "Advanced" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400" :
                      "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                    }`}>
                      {twister.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-3 text-slate-700 dark:text-slate-300">
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
