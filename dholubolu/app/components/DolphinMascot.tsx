"use client";

import Image from "next/image";

interface DolphinMascotProps {
  state: "greeting" | "listening" | "happy" | "thinking" | "confused";
  phrase?: string;
}

export default function DolphinMascot({ state, phrase }: DolphinMascotProps) {
  // Determine image source, glow classes, and badge text based on state
  const getMascotSettings = () => {
    switch (state) {
      case "listening":
        return {
          src: "/dolphin_listening.png",
          glowClass: "bg-indigo-500/25 shadow-indigo-500/30 scale-105 border-indigo-500 animate-pulse",
          statusText: "Listening...",
          statusColor: "bg-indigo-500 text-white"
        };
      case "happy":
        return {
          src: "/dolphin_happy.png",
          glowClass: "bg-emerald-500/25 shadow-emerald-500/30 scale-105 border-emerald-500",
          statusText: "Superb! 🎉",
          statusColor: "bg-emerald-500 text-white"
        };
      case "thinking":
        return {
          src: "/dolphin_thinking.png",
          glowClass: "bg-amber-500/25 shadow-amber-500/30 border-amber-500",
          statusText: "Analyzing...",
          statusColor: "bg-amber-500 text-zinc-950"
        };
      case "confused":
        return {
          src: "/dolphin_confused.png",
          glowClass: "bg-rose-500/25 shadow-rose-500/30 border-rose-500",
          statusText: "Oops! 😅",
          statusColor: "bg-rose-500 text-white"
        };
      case "greeting":
      default:
        return {
          src: "/dolphin_normal.png",
          glowClass: "bg-indigo-500/15 shadow-indigo-500/10 border-indigo-500/30",
          statusText: "Ready!",
          statusColor: "bg-indigo-600 text-white"
        };
    }
  };

  const settings = getMascotSettings();

  return (
    <div className="flex flex-col items-center gap-6 select-none my-6 w-full max-w-sm">
      {/* Speech Bubble */}
      {phrase && (
        <div className="relative bg-zinc-900/95 border border-white/10 text-zinc-100 rounded-2xl px-6 py-4 shadow-xl text-center max-w-xs animate-bounce-slow">
          <p className="text-sm font-medium leading-relaxed">{phrase}</p>
          {/* Bubble Tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r border-b border-white/10 rotate-45"></div>
        </div>
      )}

      {/* Dolphin Body Wrapper */}
      <div className="relative flex items-center justify-center">
        {/* Glow Ring Behind */}
        <div
          className={`absolute -inset-4 rounded-full blur-2xl opacity-70 transition-all duration-500 ${settings.glowClass}`}
        ></div>

        {/* 3D Mascot Image Avatar Frame */}
        <div className={`relative z-10 w-44 h-44 rounded-full overflow-hidden border-4 bg-white p-1 transition-all duration-300 shadow-2xl flex items-center justify-center ${settings.glowClass}`}>
          <img
            src={settings.src}
            alt={`Dolphin Mascot - ${state}`}
            className="w-full h-full object-cover rounded-full select-none pointer-events-none"
          />
        </div>

        {/* Small Status Badge below dolphin */}
        <span className={`absolute bottom-[-10px] z-20 text-[11px] font-bold px-3 py-1 rounded-full border border-white/10 shadow-lg tracking-wider ${settings.statusColor}`}>
          {settings.statusText}
        </span>
      </div>
    </div>
  );
}
