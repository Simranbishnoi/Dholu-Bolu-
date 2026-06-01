"use client";

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
          glowClass: "bg-sky-400/20 shadow-sky-400/10 scale-105 border-sky-400 animate-pulse",
          statusText: "Listening...",
          statusColor: "bg-sky-500 text-white"
        };
      case "happy":
        return {
          src: "/dolphin_happy.png",
          glowClass: "bg-emerald-400/20 shadow-emerald-400/10 scale-105 border-emerald-400",
          statusText: "Superb! 🎉",
          statusColor: "bg-emerald-500 text-white"
        };
      case "thinking":
        return {
          src: "/dolphin_thinking.png",
          glowClass: "bg-amber-400/20 shadow-amber-400/10 border-amber-400",
          statusText: "Analyzing...",
          statusColor: "bg-amber-500 text-zinc-800"
        };
      case "confused":
        return {
          src: "/dolphin_confused.png",
          glowClass: "bg-rose-400/20 shadow-rose-400/10 border-rose-400",
          statusText: "Oops! 😅",
          statusColor: "bg-rose-500 text-white"
        };
      case "greeting":
      default:
        return {
          src: "/dolphin_normal.png",
          glowClass: "bg-sky-400/10 shadow-sky-400/5 border-sky-300/30",
          statusText: "Ready!",
          statusColor: "bg-sky-600 text-white"
        };
    }
  };

  const settings = getMascotSettings();

  return (
    <div className="flex flex-col items-center gap-6 select-none my-6 w-full max-w-sm">
      {/* Speech Bubble */}
      {phrase && (
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-zinc-100 rounded-2xl px-6 py-4 shadow-md text-center max-w-xs animate-bounce-slow">
          <p className="text-sm font-semibold leading-relaxed">{phrase}</p>
          {/* Bubble Tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200/80 dark:border-slate-800 rotate-45"></div>
        </div>
      )}

      {/* Dolphin Body Wrapper */}
      <div className="relative flex items-center justify-center">
        {/* Glow Ring Behind */}
        <div
          className={`absolute -inset-4 rounded-full blur-2xl opacity-60 transition-all duration-500 ${settings.glowClass}`}
        ></div>

        {/* 3D Mascot Image Avatar Frame */}
        <div className={`relative z-10 w-44 h-44 rounded-full overflow-hidden border-4 bg-white p-1 transition-all duration-300 shadow-lg flex items-center justify-center ${settings.glowClass}`}>
          <img
            src={settings.src}
            alt={`Dolphin Mascot - ${state}`}
            className="w-full h-full object-cover rounded-full select-none pointer-events-none"
          />
        </div>

        {/* Small Status Badge below dolphin */}
        <span className={`absolute bottom-[-10px] z-20 text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md tracking-wider ${settings.statusColor}`}>
          {settings.statusText}
        </span>
      </div>
    </div>
  );
}
