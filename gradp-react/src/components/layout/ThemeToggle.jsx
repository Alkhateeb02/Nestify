/* 
 * مكون ThemeToggle الخاص بواجهة المستخدم.
 */
import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-xl !bg-slate-800  dark:!bg-white transition-all shadow-sm cursor-pointer"
    >
      {darkMode ? (
        <Sun className="text-[#82BC00]" size={20} /> 
      ) : (
        <Moon className="text-white" size={20} />
      )}
    </button>
  );
}