export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950 text-white p-6 relative">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400 border border-pink-500/20 mb-6">
          📊 Analytics Dashboard
        </span>
        
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-4">
          Your Progress Profile
        </h1>
        
        <p className="text-zinc-400 max-w-md mb-8">
          Review your speaking performance, streaks, overall pronunciation accuracy, and earned badges here.
        </p>

        {/* Dashboard Placeholder Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md text-left">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Average Score</span>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">88%</div>
            <p className="text-xs text-zinc-400 mt-2">Based on your last 10 practice attempts.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md text-left">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Daily Streak</span>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">5 Days</div>
            <p className="text-xs text-zinc-400 mt-2">Keep practicing daily to grow your streak!</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md text-left">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">Twisters Solved</span>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">12 / 50</div>
            <p className="text-xs text-zinc-400 mt-2">Complete more categories to unlock achievements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
