
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Navigation, User } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * مكون القائمة الجانبية (Sidebar) لتبديل العرض في لوحة التحكم
 * يحتوي على أزرار التنقل الرئيسية وزر تصفح الوحدات
 */
export default function Sidebar({ activeView, setActiveView, navItems, userName, profileImage }) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-3 space-y-6">
      {/* قسم الترحيب العلوي مع صورة البروفايل */}
      <div className="p-2 mb-4">
        {/* عرض صورة البروفايل إذا وجدت، أو أيقونة افتراضية */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-white/10 shadow-lg bg-blue-500/10 flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={30} className="text-blue-500" />
              )}
            </div>
            {/* نقطة خضراء بتدل إن المستخدم "Online" */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">
              <Sparkles size={10} />
              {t("student_sidebar.hub")}
            </div>
            <h1 className="!text-[33px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t("student_sidebar.hey")} <span className="text-blue-600">{userName.split(" ")[0]}</span>
            </h1>
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
          {t("student_sidebar.quick_look")}
        </p>
      </div>

      {/* قائمة أزرار التنقل (Switchboard) */}
      <div className="space-y-2">
        {navItems.map((nav) => (
          <button
            key={nav.id}
            onClick={() => setActiveView(nav.id)}
            className={`w-full group flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 border ${activeView === nav.id
              ? "!bg-white dark:!bg-white/10 text-slate-900 dark:text-white shadow-xl dark:shadow-black/20 border-slate-100 dark:border-white/10"
              : "!bg-transparent border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
          >
            {/* أيقونة الزر مع خلفية متغيرة حسب الحالة */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeView === nav.id ? `${nav.color} text-white shadow-lg` : "bg-slate-100 dark:bg-slate-900 group-hover:bg-slate-200 dark:group-hover:bg-slate-800"
              }`}>
              <nav.icon size={20} />
            </div>
            <span className="font-bold text-sm tracking-tight">{nav.label}</span>
            {/* مؤشر النقطة للزر الي بتححررككك */}
            {activeView === nav.id && (
              <motion.div layoutId="activeNav" className="ms-auto w-1.5 h-1.5 rounded-full bg-lime-500"></motion.div>
            )}
          </button>
        ))}
      </div>

      {/* زر التصفح الخارجي  */}
      <div className="pt-6">
        <button
          onClick={() => window.location.href = '/student'}
          className="w-full p-6 rounded-[2rem] !bg-slate-900 dark:!bg-gradient-to-br dark:from-blue-600 dark:to-indigo-700 text-white shadow-xl shadow-slate-300 dark:shadow-blue-900/20 group hover:scale-[1.02] transition-all overflow-hidden relative text-start"
        >
          <div className="relative z-10 flex flex-col items-start gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Navigation size={20} />
            </div>
            <span className="!font-black text-lg leading-tight">{t("student_sidebar.explore")}</span>
          </div>
          {/* دائرة تزيينية خلف الزر */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  );
}
