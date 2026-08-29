
import React from "react";
import { ChevronRight, LogOut } from "lucide-react";

export default function OwnerSidebar({
  ownerInfo,
  navItems,
  activeTab,
  setActiveTab,
  isAr,
  t,
  handleLogout
}) {
  return (
    <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col rounded-2xl bg-white ml-[10px] dark:!bg-slate-900 border-e border-slate-200 dark:border-slate-800 sticky top-20 h-[calc(100vh-80px)]">

      {/* ── معلومات المالك (Profile Section) ── */}
      <div className="p-6">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white grid place-items-center font-black text-xl shadow-sm">
            {ownerInfo.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{ownerInfo.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {t("owner_dashboard.role")}
            </p>
          </div>
        </div>
      </div>

      {/* ── أزرار التنقل (Navigation Items) ── */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === id
              ? "!bg-lime-500 text-white shadow-md shadow-blue-600/10 dark:!bg-lime-500 "
              : "!text-slate-500 dark:text-slate-400 dark:!bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <Icon size={18} />
            {label}
            {activeTab === id && (
              <ChevronRight size={14} className={`${isAr ? "mr-auto rotate-180" : "ml-auto"}`} />
            )}
          </button>
        ))}
      </nav>

    </aside>
  );
}
