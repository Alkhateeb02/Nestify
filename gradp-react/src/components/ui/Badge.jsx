/* 
 * مكون Badge الخاص بواجهة المستخدم.
 */
import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-blue-50 border border-blue-100 text-blue-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200",
    outline: "border-2 border-slate-200 text-slate-700 bg-transparent",
    success: "bg-emerald-50 border border-emerald-100 text-emerald-700",
    glass:
      "text-slate-700 border border-white/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 dark:text-slate-200",
    brand:
      "bg-[#004A8D]/5 dark:bg-[#82BC00]/10 border border-[#004A8D]/10 dark:border-[#82BC00]/20 text-[#004A8D] dark:text-[#82BC00]",
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}