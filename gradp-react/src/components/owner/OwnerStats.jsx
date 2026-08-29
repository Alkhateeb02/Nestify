
import React from "react";

export default function OwnerStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map(({ label, value, icon: Icon }, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-blue-500/30 transition-colors group"
        >
          {/* الأيقونة مع خلفية خفيفة */}
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 grid place-items-center text-blue-600 dark:text-lime-400 group-hover:scale-110 transition-transform">
            <Icon size={24} />
          </div>

          {/* النصوص (الرقم والعنوان) */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {label}
            </p>
            <p className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
