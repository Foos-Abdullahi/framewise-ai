"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const light = document.documentElement.dataset.theme !== "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    try { localStorage.setItem("framewise-theme", light ? "light" : "dark"); } catch {}
  }
  return (
    <button type="button" onClick={toggleTheme} aria-label="Toggle light and dark theme" className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-secondary">
      <Sun className="theme-sun size-4" /><Moon className="theme-moon size-4" />
      <span className="theme-sun">Light mode</span><span className="theme-moon">Dark mode</span>
    </button>
  );
}
