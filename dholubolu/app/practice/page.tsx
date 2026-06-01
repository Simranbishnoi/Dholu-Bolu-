"use client";

import { useState, useEffect, useRef } from "react";
import Mascot from "../components/DolphinMascot";
import { haryanviPhrases } from "../data/haryanvi_phrases";
import { englishTwisters, hindiTwisters, Twister } from "../data/twisters";
import { getDailyChallenge, DailyChallengeInfo } from "../utils/dailyChallenge";
import { calculatePracticeScore } from "../utils/scoring";
import { saveAttempt } from "../utils/db";

// Safely access SpeechRecognition in browsers
const SpeechRecognition = typeof window !== "undefined"
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null;

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

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Speech to Text & Loop Target States
  const [transcription, setTranscription] = useState<string>("");
  const [repeatTarget, setRepeatTarget] = useState<number>(1);
  const [detectedLoops, setDetectedLoops] = useState<number>(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [wrongWordsCount, setWrongWordsCount] = useState<number>(0);
  const [missingWordsCount, setMissingWordsCount] = useState<number>(0);
  
  const recordingStartTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const transcriptionRef = useRef<string>("");
  const audioUrlRef = useRef<string | null>(null);
  const recognitionActiveRef = useRef<boolean>(false);

  // Phase 9: Process recording results with real similarity and loop counting
  const processRecordingResults = (audioUrl: string, finalTranscription: string) => {
    if (!activeTwister) return;

    const scoreResult = calculatePracticeScore(
      finalTranscription,
      activeTwister.text,
      selectedLanguage || "english",
      repeatTarget
    );

    setDetectedLoops(scoreResult.detectedLoops);
    setAccuracyScore(scoreResult.accuracyScore);
    setWrongWordsCount(scoreResult.wrongWordsCount);
    setMissingWordsCount(scoreResult.missingWordsCount);

    // Select and trigger Haryanvi voice output based on score
    const phrases = haryanviPhrases.devanagari;
    let chosenPhrase = "";
    
    if (scoreResult.accuracyScore >= 90) {
      setMascotState("happy");
      chosenPhrase = phrases.high_score[Math.floor(Math.random() * phrases.high_score.length)];
    } else if (scoreResult.accuracyScore >= 75) {
      setMascotState("thinking");
      chosenPhrase = phrases.medium_score[Math.floor(Math.random() * phrases.medium_score.length)];
    } else {
      setMascotState("confused");
      chosenPhrase = phrases.low_score[Math.floor(Math.random() * phrases.low_score.length)];
    }

    setMascotPhrase(chosenPhrase);
    speakHaryanviPhrase(chosenPhrase);

    // Phase 11: Save attempt to database (localStorage)
    try {
      saveAttempt({
        twisterId: activeTwister.id,
        language: selectedLanguage || "english",
        difficulty: activeTwister.difficulty,
        twisterText: activeTwister.text,
        transcription: finalTranscription,
        accuracyScore: scoreResult.accuracyScore,
        detectedLoops: scoreResult.detectedLoops,
        repeatTarget: repeatTarget,
        wrongWordsCount: scoreResult.wrongWordsCount,
        missingWordsCount: scoreResult.missingWordsCount,
        extraWordsCount: scoreResult.extraWordsCount,
      });
      console.log("Successfully saved practice attempt to local database storage!");
    } catch (error) {
      console.error("Failed to save practice attempt to local storage:", error);
    }
  };

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

  // Cancel speech and pause audio on unmount or active twister change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioElement) {
        audioElement.pause();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setRecordedUrl(null);
    setIsRecording(false);
    setIsPlayingRecording(false);
    setRecordingError(null);
    setDetectedLoops(0);
    setAccuracyScore(null);
    setTranscription("");
  }, [activeTwister]);

  // Read Haryanvi Feedback phrase out loud using SpeechSynthesis
  const speakHaryanviPhrase = (phraseText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(phraseText);
    const voices = synth.getVoices();

    const hindiVoice = voices.find(v => v.lang.startsWith("hi")) || null;
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.rate = 0.95;
    synth.speak(utterance);
  };

  // Update Mascot when language is selected
  const handleLanguageSelect = (lang: "english" | "hindi") => {
    setSelectedLanguage(lang);
    setActiveTwister(null);

    const phrases = haryanviPhrases.devanagari;
    const beforeRecs = phrases.before_recording;
    const chosenPhrase = beforeRecs[Math.floor(Math.random() * beforeRecs.length)];
    setMascotPhrase(chosenPhrase);
    setMascotState("thinking");
    speakHaryanviPhrase(chosenPhrase);
  };

  const handleTwisterSelect = (twister: Twister) => {
    setActiveTwister(twister);
    setMascotState("happy");
    const highScores = haryanviPhrases.devanagari.high_score;
    const chosenPhrase = highScores[Math.floor(Math.random() * highScores.length)];
    setMascotPhrase(chosenPhrase);
    speakHaryanviPhrase(chosenPhrase);
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
    const chosenPhrase = achievements[Math.floor(Math.random() * achievements.length)];
    setMascotPhrase(chosenPhrase);
    setMascotState("happy");
    speakHaryanviPhrase(chosenPhrase);
  };

  // Phase 5: Load Daily Challenge
  const handleLoadDailyChallenge = () => {
    if (!dailyChallenge) return;
    setSelectedLanguage(dailyChallenge.language);
    setActiveTwister(dailyChallenge.twister);

    const phrase = "राम राम! आज का डेली चैलेंज लोड हो गया सै। जमा साफ बोलियो!";
    setMascotPhrase(phrase);
    setMascotState("thinking");
    speakHaryanviPhrase(phrase);
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

    synth.cancel();

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

  // Phase 7: Voice Recording Controls
  const startRecording = async () => {
    setRecordingError(null);
    setRecordedUrl(null);
    setAudioChunks([]);
    setDetectedLoops(0);
    setAccuracyScore(null);
    setTranscription("");
    transcriptionRef.current = "";
    audioUrlRef.current = null;
    recognitionActiveRef.current = false;

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setRecordingError("Voice capture is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedUrl(audioUrl);
        audioUrlRef.current = audioUrl;

        // Stop all track media streams to release mic hardware lock
        stream.getTracks().forEach((track) => track.stop());

        // Trigger Mobile Vibration
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(200);
        }

        // Stop Speech Recognition if active
        if (recognitionRef.current && recognitionActiveRef.current) {
          recognitionRef.current.stop();
        } else {
          // Speech recognition wasn't active or already ended
          processRecordingResults(audioUrl, transcriptionRef.current);
        }
      };

      // Phase 8: Initialize Speech Recognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage === "hindi" ? "hi-IN" : "en-US";

        recognition.onresult = (event: any) => {
          let chunkText = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              chunkText += event.results[i][0].transcript;
            }
          }
          if (chunkText) {
            const updated = (transcriptionRef.current ? " " : "") + chunkText;
            transcriptionRef.current = updated;
            setTranscription(updated);
          }
        };

        recognition.onend = () => {
          recognitionActiveRef.current = false;
          if (audioUrlRef.current !== null) {
            processRecordingResults(audioUrlRef.current, transcriptionRef.current);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
        };

        recognitionRef.current = recognition;
        recognitionActiveRef.current = true;
        recognition.start();
      }

      // Set start time anchor
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);

      // Mascot reaction
      setMascotState("listening");
      setMascotPhrase(
        selectedLanguage === "hindi"
          ? `बोलते रहो भाई! जब पूरा हो जाए, तब 'स्टॉप रिकॉर्डिंग' दबा दियो।`
          : `Speak now! Press 'Stop Recording' when you are done.`
      );
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setRecordingError("Could not access microphone. Please check permissions.");
      setMascotState("confused");
      setMascotPhrase(
        selectedLanguage === "hindi"
          ? "अरे भाई! माइक की परमिशन तो दे दे।"
          : "Oops! Please grant microphone access."
      );
    }
  };

  const stopRecording = () => {
    if (recorder && isRecording) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (!recordedUrl) return;

    if (isPlayingRecording && audioElement) {
      audioElement.pause();
      setIsPlayingRecording(false);
      return;
    }

    const audio = audioElement || new Audio(recordedUrl);
    if (!audioElement) {
      setAudioElement(audio);
    }

    audio.onended = () => {
      setIsPlayingRecording(false);
    };

    audio.play();
    setIsPlayingRecording(true);
  };

  const resetRecording = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setRecordedUrl(null);
    setIsPlayingRecording(false);
    setAudioChunks([]);
    setDetectedLoops(0);
    setAccuracyScore(null);
    setTranscription("");

    const chosenPhrase = selectedLanguage === "hindi"
      ? "चल दोबारा कोशिश करांगे, अबकी बार बढ़िया बोलियो।"
      : "Let's try again, speak clearly this time.";
    
    setMascotPhrase(chosenPhrase);
    setMascotState("thinking");
    speakHaryanviPhrase(chosenPhrase);
  };

  const handlePlusTenChallenge = () => {
    const newTarget = repeatTarget + 10;
    setRepeatTarget(newTarget);
    resetRecording();
    
    const chosenPhrase = selectedLanguage === "hindi"
      ? `ओ हो! हौसला देख भाई का। अबकी बार ${newTarget} बार बोलना सै। तैयार हो जा!`
      : `Wow! Aiming higher! Now try repeating it ${newTarget} times.`;

    setMascotPhrase(chosenPhrase);
    setMascotState("happy");
    speakHaryanviPhrase(chosenPhrase);
  };

  const twistersToDisplay = selectedLanguage === "english" ? englishTwisters : selectedLanguage === "hindi" ? hindiTwisters : [];

  return (
    <div className="flex flex-col flex-1 bg-[#FAF9F5] dark:bg-[#090d16] text-slate-800 dark:text-zinc-200 min-h-[calc(100vh-4rem)] p-4 sm:p-6 relative pb-16 transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-sky-200/10 dark:bg-sky-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-100/20 dark:bg-indigo-950/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">
        
        {/* Page Header */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 px-3 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 mb-2">
          🎙️ Tongue Twister Arena
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-100 mb-4">
          Select Your Speaking Challenge
        </h1>

        {/* Daily Challenge Banner */}
        {dailyChallenge && !selectedLanguage && (
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
        <div className="flex flex-col items-center mb-4 w-full">
          <Mascot state={mascotState} phrase={mascotPhrase} />
        </div>

        {/* Dynamic Selector Header */}
        {selectedLanguage ? (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm text-sm mb-6 transition-all duration-300">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Category: {selectedLanguage === "english" ? "🇬🇧 English Twisters" : "🇮🇳 Hindi Twisters"}
            </span>
            <button
              onClick={() => {
                setSelectedLanguage(null);
                setActiveTwister(null);
                resetRecording();
              }}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold border-l border-slate-200 dark:border-slate-800 pl-3 ml-1"
            >
              Change Language
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-2xl mb-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-4">
              <button
                onClick={() => handleLanguageSelect("english")}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all duration-300"
              >
                <span className="text-4.5xl mb-3 group-hover:scale-110 transition-transform">🇬🇧</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">English Twisters</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Practice English speed and articulation.</p>
                <span className="mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30">
                  20 Twisters
                </span>
              </button>

              <button
                onClick={() => handleLanguageSelect("hindi")}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-300"
              >
                <span className="text-4.5xl mb-3 group-hover:scale-110 transition-transform">🇮🇳</span>
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
        )}

        {/* Selected Twister Workspace */}
        {activeTwister && (
          <div className="w-full max-w-2xl rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 sm:p-8 shadow-md dark:shadow-none mb-6 flex flex-col items-center text-center animate-fade-in">
            <div className="flex items-center justify-between w-full border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Active Challenge</span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTwister.difficulty === "Beginner" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" :
                activeTwister.difficulty === "Intermediate" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" :
                activeTwister.difficulty === "Advanced" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30" :
                "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"
              }`}>
                {activeTwister.difficulty}
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-bold tracking-wide text-slate-855 dark:text-zinc-100 italic px-4 py-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 w-full mb-5">
              "{activeTwister.text}"
            </p>

            {/* TTS & Speech Controls Workspace */}
            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-col gap-5 items-center">
              {/* TTS Controls Panel */}
              <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 w-full max-w-md shadow-inner">
                
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

                {/* Speech Speed Selector */}
                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wide mr-1">Speed</span>
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

              {/* Loop Repetition Selector */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/50 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 w-full max-w-sm justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Repetition Target:</span>
                <div className="flex gap-1.5">
                  {[1, 3, 5, 10].map((target) => (
                    <button
                      key={target}
                      disabled={isRecording || recordedUrl !== null}
                      onClick={() => setRepeatTarget(target)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                        repeatTarget === target
                          ? "bg-sky-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      }`}
                    >
                      {target}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Recording Section */}
              <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
                
                {recordingError && (
                  <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-950/30">
                    ⚠️ {recordingError}
                  </p>
                )}

                {isRecording && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-500 animate-pulse bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-lg">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Recording Speech Loops...</span>
                  </div>
                )}

                {!isRecording && !recordedUrl ? (
                  // Idle: Start Recording
                  <button
                    onClick={startRecording}
                    className="h-12 w-full max-w-xs rounded-xl bg-red-500 hover:bg-red-650 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    🎙️ Start Voice Recording
                  </button>
                ) : isRecording ? (
                  // Recording Active: Stop Button
                  <button
                    onClick={stopRecording}
                    className="h-12 w-full max-w-xs rounded-xl bg-red-600 dark:bg-rose-700 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[0.99]"
                  >
                    ⏹️ Stop Recording
                  </button>
                ) : (
                  // Recording Completed: Review Panel & Accuracy Score
                  <div className="flex flex-col items-center gap-4 w-full max-w-md">
                    
                    {accuracyScore !== null && (
                      <div className="w-full bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-left flex flex-col gap-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Speaking Results</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400`}>
                            {detectedLoops} loops detected
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-lg font-black text-slate-800 dark:text-zinc-150">{accuracyScore}%</span>
                          </div>
                          <div className="flex-1 text-xs font-semibold text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                            <p className="flex justify-between">
                              <span>Pronunciation Accuracy:</span>
                              <span className="text-slate-800 dark:text-zinc-150 font-bold">{accuracyScore}%</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Detected Repeats:</span>
                              <span className="text-sky-600 dark:text-sky-400 font-bold">{detectedLoops} / {repeatTarget}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Wrong Words:</span>
                              <span className="text-rose-500 font-bold">{wrongWordsCount}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Missing Words:</span>
                              <span className="text-amber-500 font-bold">{missingWordsCount}</span>
                            </p>
                          </div>
                        </div>

                        {/* Real-time speech transcription display (Phase 8 feature) */}
                        {transcription && (
                          <div className="bg-slate-50 dark:bg-slate-955/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-left w-full mt-1">
                            <span className="font-bold text-slate-400 block mb-1">What We Heard (STT):</span>
                            <p className="font-semibold text-slate-700 dark:text-zinc-200 italic">
                              "{transcription}"
                            </p>
                          </div>
                        )}

                        {/* Level Up Button */}
                        <div className="flex gap-2 w-full mt-2">
                          <button
                            onClick={handlePlusTenChallenge}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm text-center"
                          >
                            ⚡ Level Up: Try +10 Loop Challenge!
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      <button
                        onClick={playRecording}
                        className={`h-11 px-6 rounded-xl font-bold flex-1 flex items-center justify-center gap-1.5 shadow-sm border transition-all ${
                          isPlayingRecording
                            ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                            : "bg-sky-600 dark:bg-sky-500 text-white border-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600"
                        }`}
                      >
                        {isPlayingRecording ? "⏸️ Pause Playback" : "🎧 Play Attempt"}
                      </button>
                      <button
                        onClick={resetRecording}
                        className="h-11 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
                      >
                        🔄 Record Again
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Display twister list once language is selected */}
        {selectedLanguage && (
          <div className="w-full max-w-4xl animate-fade-in mt-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-zinc-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
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
