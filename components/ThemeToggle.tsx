"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with same dimensions to avoid layout shift
    return (
      <div className="w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full overflow-hidden transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)"
          : "linear-gradient(135deg, #87CEEB 0%, #FDB813 100%)",
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Toggle circle/knob */}
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-in-out flex items-center justify-center ${
          isDark ? "left-[1.625rem] bg-gray-800" : "left-0.5 bg-white"
        }`}
      >
        {/* Sun icon */}
        <svg
          className={`w-4 h-4 text-yellow-500 transition-opacity duration-300 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        {/* Moon icon */}
        <svg
          className={`w-4 h-4 text-blue-200 absolute transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>

      {/* Background decorations */}
      <span
        className={`absolute right-1.5 top-1.5 transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Stars for dark mode */}
        <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: 0, right: 0 }} />
        <span className="absolute w-0.5 h-0.5 bg-white/70 rounded-full animate-pulse" style={{ top: 6, right: 8 }} />
        <span className="absolute w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ top: 2, right: 14 }} />
      </span>
    </button>
  );
}
