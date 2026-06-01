"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Practice", path: "/practice" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 sm:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              👅
            </span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200">
              Twister<span className="text-indigo-400">AI</span>
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
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button / Status */}
        <div className="flex items-center gap-4">
          <Link
            href="/practice"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 text-xs font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02]"
          >
            Start Practicing
          </Link>
          
          {/* Mobile Menu Button Placeholder */}
          <button className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5">
            <span className="w-5 h-0.5 bg-current rounded-full mb-1"></span>
            <span className="w-5 h-0.5 bg-current rounded-full mb-1"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
