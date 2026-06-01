export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#FAF9F5] text-slate-800 p-6 relative min-h-[calc(100vh-4rem)]">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-pink-100/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center animate-fade-in">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600 border border-pink-100 mb-6 animate-pulse">
          📊 Analytics Dashboard
        </span>
        
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-slate-800 mb-4">
          Your Progress Profile
        </h1>
        
        <p className="text-slate-500 max-w-md mb-8">
          Review your speaking performance, streaks, overall pronunciation accuracy, and earned badges here.
        </p>

        {/* Dashboard Placeholder Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Average Score</span>
            <div className="text-3xl font-extrabold text-emerald-600">88%</div>
            <p className="text-xs text-slate-500 mt-2">Based on your last 10 practice attempts.</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Daily Streak</span>
            <div className="text-3xl font-extrabold text-amber-600">5 Days</div>
            <p className="text-xs text-slate-500 mt-2">Keep practicing daily to grow your streak!</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Twisters Solved</span>
            <div className="text-3xl font-extrabold text-sky-600">12 / 50</div>
            <p className="text-xs text-slate-500 mt-2">Complete more categories to unlock achievements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
