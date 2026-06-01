"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Mascot from "./components/DolphinMascot";
import { haryanviPhrases } from "./data/haryanvi_phrases";

export default function Home() {
  const [welcomePhrase, setWelcomePhrase] = useState("");
  const [signaturePhrase, setSignaturePhrase] = useState("");

  useEffect(() => {
    // Choose random welcome and signature phrase in Latin script on load
    const welcomes = haryanviPhrases.latin.welcome;
    const signatures = haryanviPhrases.latin.signature_phrases;
    
    setWelcomePhrase(welcomes[Math.floor(Math.random() * welcomes.length)]);
    setSignaturePhrase(signatures[Math.floor(Math.random() * signatures.length)]);
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950 text-white overflow-hidden relative min-h-[calc(100vh-4rem)]">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 text-center flex flex-col items-center">
        {/* Animated Dolphin Mentor */}
        <Mascot state="greeting" phrase={welcomePhrase || "Ram Ram Bhai!"} />

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent max-w-3xl leading-[1.15] mb-4 mt-4">
          Unleash Your Tongue with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          Speech Training
        </h1>

        {/* Mascot Signature / Description */}
        <p className="text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-6 italic">
          "{signaturePhrase || "Ram Ram! Bol saaf, ban laajawab."}"
        </p>

        <p className="max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed mb-10">
          Learn, practice, and master speech clarity with English and Hindi tongue twisters. Receive real-time pronunciation accuracy scores with Haryanvi feedback.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/practice"
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] hover:shadow-purple-500/40 transition-all duration-300"
          >
            Start Practicing Now
          </Link>
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300"
          >
            View Dashboard
          </Link>
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
            <div className="text-3xl mb-4">🎙️</div>
            <h3 className="text-lg font-bold mb-2">Real-time Recognition</h3>
            <p className="text-sm text-zinc-400">
              Web Speech API captures your spoken attempts locally for instant transcriptions.
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-bold mb-2">Accuracy Scoring</h3>
            <p className="text-sm text-zinc-400">
              Compare spoken word similarity against target phrases for performance scores.
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-pink-500/30 transition-all duration-300">
            <div className="text-3xl mb-4">🐬</div>
            <h3 className="text-lg font-bold mb-2">Dolphin Mentor</h3>
            <p className="text-sm text-zinc-400">
              A playful emotional mascot that reacts dynamically in Haryanvi dialects to your speech accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
