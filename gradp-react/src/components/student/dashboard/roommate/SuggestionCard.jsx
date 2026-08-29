import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, CalendarDays, Phone, Home,
  Send, ChevronDown, Sparkles, Lock
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* كل شخص له لون accent مختلف بناء على id */
const ACCENTS = [
  { dot: "bg-violet-500", avatar: "from-violet-500 to-indigo-600" },
  { dot: "bg-blue-500", avatar: "from-blue-500   to-cyan-600" },
  { dot: "bg-rose-500", avatar: "from-rose-500   to-pink-600" },
  { dot: "bg-emerald-500", avatar: "from-emerald-500 to-teal-600" },
  { dot: "bg-amber-500", avatar: "from-amber-500  to-orange-500" },
];

const DETAIL_FIELDS = [
  {
    icon: Phone,
    labelKey: "roommate_matching.profile.phone",
    resolve: (data) => data.phone,
    isSensitive: true,
  },
  {
    icon: Home,
    labelKey: "roommate_matching.profile.reservation",
    resolve: (data, t) => data.hasReservation ? t("roommate_matching.profile.yes") : t("roommate_matching.profile.no"),
  },
  {
    icon: GraduationCap,
    labelKey: "roommate_matching.profile.major",
    resolve: (data) => data.major,
  },
  {
    icon: CalendarDays,
    labelKey: "roommate_matching.profile.year",
    resolve: (data) => data.year,
  },
];

export default function SuggestionCard({ data, onPair, alreadySent }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const accent = ACCENTS[(data.id ?? 0) % ACCENTS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-slate-900/60 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-black/20 overflow-hidden transition-all"
    >
      {/* المحتوى الرئيسي (قابل للضغط) */}
      <div
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-start cursor-pointer select-none"
      >
        {/* Avatar وصورة الشريك */}
        <div className="relative shrink-0">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent.avatar} flex items-center justify-center text-white font-black text-base shadow-sm`}>
            {data.name[0]}
          </div>
        </div>

        {/* الاسم والمعلومات */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate leading-tight">
            {data.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <GraduationCap size={11} className="text-slate-300 dark:text-slate-600" />
              {data.major}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <CalendarDays size={11} className="text-slate-300 dark:text-slate-600" />
              {data.year}
            </span>

            {/* شارة الحجز المميزة */}
            {data.hasReservation && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                {t("roommate_matching.card.reserved")}
              </span>
            )}
          </div>
        </div>

        {/* زر الإرسال أو السهم الموسّع */}
        <div className="shrink-0 flex items-center gap-2">
          {/* زر إرسال طلب المطابقة */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onPair && onPair(data); }}
            disabled={alreadySent}
            title={alreadySent ? t("roommate_matching.status.pending") : t("roommate_matching.card.pair_btn")}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${alreadySent
              ? "!bg-slate-100 dark:!bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : `bg-gradient-to-br ${accent.avatar} text-white shadow-sm hover:opacity-90 active:scale-95`
              }`}
          >
            <Send size={13} className="absolute z-10" />
          </button>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.22 }}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/[0.04]"
          >
            <ChevronDown size={14} />
          </motion.div>
        </div>
      </div>

      {/* ── الجزء الموسّع (Accordion) ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-50 dark:border-white/[0.04] pt-3">
               {/* تفاصيل الشخص المقترح */}
              <div className="grid grid-cols-2 gap-2">
                {DETAIL_FIELDS.map(({ icon: Icon, labelKey, resolve, isSensitive }) => {
                  const isLocked = isSensitive; // suggestions are never accepted yet
                  const displayValue = isLocked 
                    ? t("roommate_matching.profile.locked", "Hidden until accepted") 
                    : resolve(data, t);

                  return (
                    <div key={labelKey} className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/80 dark:border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1">{t(labelKey)}</p>
                      <div className="flex items-center gap-1.5">
                        {isLocked ? (
                          <Lock size={11} className="text-amber-500 dark:text-amber-400 shrink-0" />
                        ) : (
                          <Icon size={11} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        )}
                        <p className={`text-xs font-bold truncate ${isLocked ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
                          {displayValue}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ملاحظة عادات السكن والتوافق */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/80 dark:border-white/5">
                <Sparkles size={12} className="text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-slate-600 dark:text-slate-500 leading-relaxed font-medium">
                  {t("roommate_matching.profile.habits_desc")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
