"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAttempts, getDashboardStats, getDailyStreak, clearAttempts, Attempt, DashboardStats } from "../utils/db";
import { getGamificationProfile, GamificationProfile, Badge } from "../utils/gamification";

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load attempts (newest first)
    const list = getAttempts();
    const dStats = getDashboardStats();
    const dStreak = getDailyStreak();
    const dProfile = getGamificationProfile(list, dStreak);

    setTimeout(() => {
      setAttempts([...list].reverse());
      setStats(dStats);
      setStreak(dStreak);
      setProfile(dProfile);
      setIsLoaded(true);
    }, 0);
  }, []);

  const handleResetData = () => {
    const confirmReset = window.confirm(
      "राम राम! Are you sure you want to delete all your practice attempts? This will reset your streak and history."
    );
    if (confirmReset) {
      clearAttempts();
      setAttempts([]);
      setStats({
        totalAttempts: 0,
        averageAccuracy: 0,
        totalLoops: 0,
        uniqueSolved: 0,
        englishAttempts: 0,
        hindiAttempts: 0,
      });
      setStreak(0);
      setProfile(getGamificationProfile([], 0));
    }
  };

  // Helper to format timestamps to readable local string
  const formatDateTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };



  if (!isLoaded) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#FAF9F5] dark:bg-[#090d16] text-slate-800 dark:text-zinc-200 min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-600 border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Loading progress profiles...</p>
      </div>
    );
  }

  const hasData = attempts.length > 0;

  return (
    <div className="flex flex-col flex-1 bg-[#FAF9F5] dark:bg-[#090d16] text-slate-800 dark:text-zinc-200 min-h-[calc(100vh-4rem)] p-4 sm:p-6 relative pb-16 transition-colors duration-300">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-sky-200/10 dark:bg-sky-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-100/20 dark:bg-indigo-950/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">
        {/* Page Header */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 px-3 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 mb-2">
          📊 Progress & Analytics
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-100 mb-2">
          Your Speaking Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
          Track your daily speech streaks, pronunciation improvements, and regional accuracy stats.
        </p>

        {/* Dashboard Grid */}
        {hasData ? (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Daily Streak Card */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-450 dark:text-slate-550 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Daily Streak
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                    🔥 {streak} {streak === 1 ? "Day" : "Days"}
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-medium">
                  {streak > 0
                    ? "Fantastic! Keep speaking to grow your streak!"
                    : "No practice logged today. Start a twister!"}
                </p>
              </div>

              {/* Average Accuracy Card */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-450 dark:text-slate-550 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Avg Accuracy
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-450">
                    🎯 {stats?.averageAccuracy || 0}%
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-medium">
                  Calculated across your total attempts.
                </p>
              </div>

              {/* Solved Twisters Card */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-450 dark:text-slate-550 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Solved Challenges
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
                    🏆 {stats?.uniqueSolved} / 40
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-medium">
                  Twisters passed with &ge;80% accuracy.
                </p>
              </div>

              {/* Max Loops Card */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-450 dark:text-slate-550 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Max Loops Spoken
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    🔁 {stats?.totalLoops || 0}
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-medium">
                  Highest number of repetitions in a single session.
                </p>
              </div>
            </div>



            {/* Wrestler Achievements & Athlete Badges Panel */}
            {profile && (
              <div className="w-full rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-5 sm:p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  Choorma Challenge
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.badges.map((badge: Badge) => (
                    <div
                      key={badge.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${badge.isUnlocked
                        ? "border-sky-300 dark:border-sky-900/50 bg-sky-50/10 dark:bg-sky-950/10 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/5 opacity-55 grayscale"
                        }`}
                    >
                      <span className={`text-3.5xl p-1.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm shrink-0`}>
                        {badge.isUnlocked ? badge.icon : "🔒"}
                      </span>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-150">
                            {badge.name}
                          </h3>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold shrink-0">
                            {badge.athleteReference}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550 leading-relaxed mb-2">
                          {badge.description}
                        </p>
                        {badge.isUnlocked ? (
                          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 italic bg-emerald-50/40 dark:bg-emerald-950/10 px-2.5 py-1 rounded border border-emerald-100/30 dark:border-emerald-900/20">
                            &ldquo;{badge.haryanviQuote}&rdquo;
                          </p>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-450 dark:text-slate-550">
                            🔒 Complete the challenge to unlock comparison feedback!
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attempt Logs table list */}
            <div className="w-full rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-5 sm:p-6 shadow-sm overflow-hidden">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Recent Attempts History
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 pr-4">Twister Challenge</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Repeats</th>
                      <th className="py-2.5 pl-3 text-right">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {attempts.slice(0, 10).map((att) => {
                      const isExcellent = att.accuracyScore >= 90;
                      const isGood = att.accuracyScore >= 75;

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-zinc-200">
                            <div className="flex flex-col gap-1 max-w-[320px] sm:max-w-md">
                              <span className="line-clamp-1 italic font-bold">&ldquo;{att.twisterText}&rdquo;</span>
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-450 dark:text-slate-500">
                                <span>{att.language === "english" ? "🇬🇧 EN" : "🇮🇳 HI"}</span>
                                <span>&middot;</span>
                                <span className={`font-bold uppercase ${att.difficulty === "Beginner" ? "text-emerald-500" :
                                  att.difficulty === "Intermediate" ? "text-amber-500" :
                                    att.difficulty === "Advanced" ? "text-orange-500" :
                                      "text-red-500"
                                  }`}>
                                  {att.difficulty}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-450 dark:text-slate-500 whitespace-nowrap">
                            {formatDateTime(att.timestamp)}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                            {att.detectedLoops} / {att.repeatTarget}x
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border ${isExcellent ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" :
                              isGood ? "bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                              }`}>
                              {att.accuracyScore}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reset data widget */}
            <div className="flex justify-end w-full mt-4">
              <button
                onClick={handleResetData}
                className="h-8 px-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 font-bold text-xs transition-all shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          /* Empty State Profile view */
          <div className="w-full max-w-xl rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-8 shadow-md dark:shadow-none flex flex-col items-center text-center animate-fade-in">
            <div className="relative w-36 h-36 mb-4">
              <Image
                src="/dolphin_normal.png"
                alt="Dholu Bolu Mascot"
                fill
                className="object-contain"
                priority
              />
            </div>

            <p className="text-base sm:text-lg font-bold italic tracking-wide text-slate-700 dark:text-zinc-200 px-4 py-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 w-full mb-6">
              &ldquo;राम राम! कोई प्रैक्टिस कोनी करी आज? आ जाओ, थोड़ी कसरत कर लें!&rdquo;
            </p>

            <h3 className="text-lg font-extrabold text-slate-800 dark:text-zinc-100 mb-2">
              No Attempts Logged Yet
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-8">
              Start practicing tongue twisters in English or Hindi to track your pronunciation accuracy and grow your daily streak!
            </p>

            <Link
              href="/practice"
              className="h-11 px-8 rounded-xl bg-sky-650 hover:bg-sky-750 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center hover:scale-[1.01]"
            >
              🎙️ Visit Practice Arena
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
