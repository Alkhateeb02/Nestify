import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, CalendarDays, Phone, Home,
  CheckCircle, XCircle, Clock,
  ChevronDown, UserCheck, Sparkles, Lock
} from "lucide-react";
import { useTranslation } from "react-i18next";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
  accepted: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
  rejected: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20" },
};

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

export default function RoommateCard({ data, onAccept, onReject, onCancel }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const statusCfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const isPending = data.status === "pending";
  const isAccepted = data.status === "accepted";
  const isRejected = data.status === "rejected";
  const accent = ACCENTS[(data.id ?? 0) % ACCENTS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isPending
          ? "border-amber-100 dark:border-amber-500/10 bg-amber-50/20 dark:bg-amber-500/[0.01] border-s-4 border-s-amber-400 dark:border-s-amber-500"
          : isAccepted
            ? "border-emerald-100 dark:border-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-500/[0.01] border-s-4 border-s-emerald-400 dark:border-s-emerald-500"
            : "border-red-100 dark:border-red-500/10 bg-rose-50/10 dark:bg-red-500/[0.005] border-s-4 border-s-rose-400 dark:border-s-rose-500"
      }`}
    >
      {/* المحتوى الرئيسي (قابل للضغط) */}
      <div
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-start cursor-pointer select-none"
      >
        {/* Avatar وصورة الشريك مع شارة الحالة */}
        <div className="relative shrink-0">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent.avatar} flex items-center justify-center text-white font-black text-base shadow-sm`}>
            {data.name[0]}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-slate-900 ${
            isPending ? "bg-amber-500" : isAccepted ? "bg-emerald-500" : "bg-red-500"
          }`}>
            <StatusIcon size={9} strokeWidth={3} />
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

            {/* شارة الحالة الملّونة للطلب */}
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
              {t(`roommate_matching.status.${data.status}`)}
            </span>
            {/* شارة الاتجاه للطلب */}
            {data.direction && (
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide border ${
                data.direction === "incoming"
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                  : "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
              }`}>
                {data.direction === "incoming" ? t("roommate_matching.request.received") : t("roommate_matching.request.sent")}
              </span>
            )}
          </div>
        </div>

        {/* السهم الموسّع */}
        <div className="shrink-0 flex items-center gap-2">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.22 }}
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 ${
              isPending
                ? "bg-amber-100/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : isAccepted
                  ? "bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-100/50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
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
                  const isLocked = isSensitive && data.status !== "accepted";
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
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                  {t("roommate_matching.profile.habits_desc")}
                </p>
              </div>

              {/* 🔽 شاشة الطلب المعلق وأزرار القبول والرفض */}
              {isPending && (
                <div className="flex gap-2 pt-1 w-full">
                  {data.direction === "incoming" ? (
                    <>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onAccept && onAccept(data.id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition-all active:scale-95 shadow-sm shadow-emerald-500/10 cursor-pointer"
                      >
                        <CheckCircle size={13} />
                        {t("roommate_matching.request.accept")}
                      </button>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onReject && onReject(data.id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <XCircle size={13} />
                        {t("roommate_matching.request.reject")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onCancel && onCancel(data.id); }}
                      className="w-full flex items-center justify-center gap-1.5 h-9.5 rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <XCircle size={13} />
                      {t("roommate_matching.request.cancel")}
                    </button>
                  )}
                </div>
              )}

              {/* 🔽 شاشة تأكيد قبول الشراكة بنجاح */}
              {isAccepted && (
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/[0.02]">
                  <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t("roommate_matching.request.matched_success")}</span>
                </div>
              )}

              {/* 🔽 شاشة توضح أن الطلب مرفوض */}
              {isRejected && (
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-500/[0.02]">
                  <XCircle size={13} className="text-red-500 dark:text-red-400" />
                  <span className="text-xs font-bold text-red-500 dark:text-red-400">{t("roommate_matching.status.rejected")}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
