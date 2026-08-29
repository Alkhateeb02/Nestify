/* 
 * مكون CompactChip الخاص بواجهة المستخدم.
 */
import React from "react";
import { cn } from "./cn";

/* ── CompactChip: تصميم مصغر وبسيط (بدون عجقة) ── */
export function CompactChip({ icon: Icon, label, active, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 h-10 px-4 rounded-xl border text-xs font-bold transition-all duration-200",
        active 
          ? "border-[#004A8D] bg-[#004A8D] text-white shadow-sm dark:border-lime-500 dark:bg-lime-500 dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800",
        className
      )}
    >
      {Icon && <Icon size={14} className={active ? "opacity-100" : "opacity-60"} />}
      <span className="truncate">{label}</span>
    </button>
  );
}
