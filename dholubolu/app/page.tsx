"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Mascot from "./components/DolphinMascot";
import { haryanviPhrases } from "./data/haryanvi_phrases";
import { getDailyChallenge, DailyChallengeInfo } from "./utils/dailyChallenge";

export default function Home() {
  const [welcomePhrase, setWelcomePhrase] = useState("");
  const [signaturePhrase, setSignaturePhrase] = useState("");
  const [daily, setDaily] = useState<DailyChallengeInfo | null>(null);

  useEffect(() => {
    // Choose random welcome and signature phrase in Latin script on load
    const welcomes = haryanviPhrases.latin.welcome;
    const signatures = haryanviPhrases.latin.signature_phrases;
    
    setWelcomePhrase(welcomes[Math.floor(Math.random() * welcomes.length)]);
    setSignaturePhrase(signatures[Math.floor(Math.random() * signatures.length)]);
    
    // Set daily challenge
    setDaily(getDailyChallenge());
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#FAF9F5] dark:bg-[#090d16] text-slate-800 dark:text-zinc-200 overflow-hidden relative min-h-[calc(100vh-4rem)] pb-12 transition-colors duration-300">
      {/* Decorative calm background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-200/20 dark:bg-sky-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-100/30 dark:bg-indigo-950/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8 text-center flex flex-col items-center">
        {/* Animated Dolphin Mentor */}
        <Mascot state="greeting" phrase={welcomePhrase || "Ram Ram Bhai!"} />

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-800 dark:text-zinc-100 max-w-3xl leading-[1.15] mb-3 mt-4">
          Unleash Your Tongue with{" "}
          <span className="bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent font-black">
            AI-Powered
          </span>{" "}
          Speech Training
        </h1>

        {/* Mascot Signature / Description */}
        <p className="text-sky-600 dark:text-sky-400 text-xs sm:text-sm font-bold tracking-wider uppercase mb-6 italic">
          "{signaturePhrase || "Ram Ram! Bol saaf, ban laajawab."}"
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/practice"
            className="flex h-12 items-center justify-center rounded-xl bg-sky-600 dark:bg-sky-500 px-8 text-sm font-semibold text-white shadow-md shadow-sky-600/10 hover:scale-[1.01] hover:bg-sky-700 dark:hover:bg-sky-600 transition-all duration-300"
          >
            Start Practicing Now
          </Link>
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-850 px-8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all duration-300 shadow-sm"
          >
            View Dashboard
          </Link>
        </div>

        {/* Phase 5: Daily Challenge Hero Card */}
        {daily && (
          <div className="w-full max-w-2xl rounded-2xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 shadow-md dark:shadow-none hover:shadow-lg dark:hover:border-sky-900/30 transition-all duration-300 mb-16 text-left flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-sky-500"></span>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  Today's Daily Challenge
                </span>
                <span className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full font-bold">
                  {daily.language === "english" ? "English" : "Hindi"}
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                  {daily.twister.difficulty}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-zinc-100 italic line-clamp-2">
                "{daily.twister.text}"
              </p>
            </div>
            <Link
              href={`/practice?lang=${daily.language}&id=${daily.twister.id}`}
              className="h-10 px-5 rounded-lg bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm text-white whitespace-nowrap w-full sm:w-auto"
            >
              Accept Challenge ⚡
            </Link>
          </div>
        )}

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 shadow-sm dark:shadow-none hover:border-sky-200 dark:hover:border-sky-900/30 transition-all duration-300">
            <div className="text-3xl mb-4">🎙️</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Real-time Recognition</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Web Speech API captures your spoken attempts locally for instant transcriptions.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 shadow-sm dark:shadow-none hover:border-sky-200 dark:hover:border-sky-900/30 transition-all duration-300">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Accuracy Scoring</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Compare spoken word similarity against target phrases for performance scores.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 shadow-sm dark:shadow-none hover:border-sky-200 dark:hover:border-sky-900/30 transition-all duration-300">
            <div className="text-3xl mb-4">🐬</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Dolphin Mentor</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A playful emotional mascot that reacts dynamically in Haryanvi dialects to your speech accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
