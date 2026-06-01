"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync state with HTML tag class on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark") || 
                     localStorage.getItem("theme") === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof window !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Practice", path: "/practice" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800 bg-[#FAF9F5]/80 dark:bg-[#090d16]/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 sm:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold text-xl shadow-sm border border-sky-100 dark:border-sky-900/50 group-hover:scale-105 transition-transform duration-200">
              🐬
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
              Dholu <span className="text-sky-500 font-medium">Bolu</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-sky-700 dark:text-sky-400 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/30 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Panel: Theme Toggle + CTA */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-all duration-250"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              // Sun Icon (Rendered for Dark Mode to switch to light)
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              // Moon Icon (Rendered for Light Mode to switch to dark)
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          <Link
            href="/practice"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg bg-slate-850 dark:bg-slate-100 hover:bg-slate-950 dark:hover:bg-white px-4 text-xs font-bold text-white dark:text-slate-900 shadow-sm transition-all duration-300 hover:scale-[1.01]"
          >
            Start Practicing
          </Link>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
            <span className="w-5 h-0.5 bg-current rounded-full mb-1"></span>
            <span className="w-5 h-0.5 bg-current rounded-full mb-1"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
