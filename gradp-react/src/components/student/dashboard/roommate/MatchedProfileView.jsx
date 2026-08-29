
import React from "react";
import { motion } from "framer-motion";
import { Phone, Home, GraduationCap, CalendarDays, UserCheck, RefreshCcw, Sparkles, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

function DetailTile({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/20 transition-all group">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

function PreferenceRow({ label, myVal, partnerVal, isAr }) {
  const isMatch = myVal?.toLowerCase() === partnerVal?.toLowerCase();
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0 text-xs">
      <span className="font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold capitalize">
          {myVal || (isAr ? 'غير محدد' : 'N/A')}
        </span>
        <span className="text-slate-300 dark:text-slate-600">→</span>
        <span className={`px-2 py-0.5 rounded-lg font-black capitalize ${
          isMatch 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
            : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
        }`}>
          {partnerVal || (isAr ? 'غير محدد' : 'N/A')}
        </span>
      </div>
    </div>
  );
}

export default function MatchedProfileView({ roommate, onUnmatch, viewportVariants, isAr }) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* ── Hero Card ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-700 to-blue-800 shadow-2xl shadow-violet-500/20">

        {/* background blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* top row: badge + unmatch button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <Heart size={12} className="text-pink-300 fill-pink-300" />
              </motion.div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {t("roommate_matching.request.matched_success")}
              </span>
            </div>

            <button
              onClick={onUnmatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/20 text-red-300 text-[10px] font-black transition-all active:scale-95"
            >
              <RefreshCcw size={11} />
              {isAr ? "إلغاء المطابقة" : "Unmatch"}
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-[1.5rem] bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {roommate.name[0]}
              </div>
              {/* Online dot */}
              <motion.span
                animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-400 border-2 border-white rounded-full shadow-md"
              />
            </div>

            <div className={`text-center sm:${isAr ? "text-right" : "text-left"} flex-1`}>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                {roommate.name}
              </h2>
              <p className="text-white/60 text-xs font-semibold">
                {roommate.major} · {roommate.year}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DetailTile
          icon={Phone}
          label={t("roommate_matching.profile.phone")}
          value={roommate.phone}
          colorClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <DetailTile
          icon={Home}
          label={t("roommate_matching.profile.reservation")}
          value={roommate.hasReservation ? t("roommate_matching.profile.yes") : t("roommate_matching.profile.no")}
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <DetailTile
          icon={GraduationCap}
          label={t("roommate_matching.profile.major")}
          value={roommate.major}
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <DetailTile
          icon={CalendarDays}
          label={t("roommate_matching.profile.year")}
          value={roommate.year}
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* ── Compatibility Breakdown ── */}
      <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1">
              {isAr ? "تحليل نسبة التوافق بالذكاء الاصطناعي" : "AI Compatibility Similarity Analysis"}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {isAr ? `نسبة التوافق الإجمالية: ${roommate.similarityScore}%` : `Overall Similarity Score: ${roommate.similarityScore}%`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${roommate.similarityScore || 90}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
          />
        </div>

        <div className="space-y-1">
          <PreferenceRow 
            label={isAr ? "جدول النوم" : "Sleep Schedule"} 
            myVal={roommate.myPrefs?.sleep_schedule} 
            partnerVal={roommate.partnerPrefs?.sleep_schedule} 
            isAr={isAr} 
          />
          <PreferenceRow 
            label={isAr ? "حالة التدخين" : "Smoking Status"} 
            myVal={roommate.myPrefs?.smoking_status} 
            partnerVal={roommate.partnerPrefs?.smoking_status} 
            isAr={isAr} 
          />
          <PreferenceRow 
            label={isAr ? "مستوى النظافة" : "Cleanliness Level"} 
            myVal={roommate.myPrefs?.cleanliness_level} 
            partnerVal={roommate.partnerPrefs?.cleanliness_level} 
            isAr={isAr} 
          />
          <PreferenceRow 
            label={isAr ? "تحمل الضوضاء" : "Noise Tolerance"} 
            myVal={roommate.myPrefs?.noise_tolerance} 
            partnerVal={roommate.partnerPrefs?.noise_tolerance} 
            isAr={isAr} 
          />
          <PreferenceRow 
            label={isAr ? "المستوى الاجتماعي" : "Social Level"} 
            myVal={roommate.myPrefs?.social_level} 
            partnerVal={roommate.partnerPrefs?.social_level} 
            isAr={isAr} 
          />
          <PreferenceRow 
            label={isAr ? "مستوى الدراسة" : "Study Habits"} 
            myVal={roommate.myPrefs?.study_level} 
            partnerVal={roommate.partnerPrefs?.study_level} 
            isAr={isAr} 
          />
          <PreferenceRow 
            label={isAr ? "تفضيل الضيوف" : "Guest Preference"} 
            myVal={roommate.myPrefs?.guest_preference} 
            partnerVal={roommate.partnerPrefs?.guest_preference} 
            isAr={isAr} 
          />
        </div>
      </div>
    </motion.div>
  );
}
