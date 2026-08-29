import React from "react";
import { motion } from "framer-motion";
import { MapPin, User, CreditCard, Calendar, Clock, Sparkles, Send, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * مكون عرض نظرة عامة (Overview)
 * يعرض تفاصيل السكن الحالي للطالب وبيانات العقد
 */
export default function OverviewView({ booking, bookedProperty, isApproved, formatD, startDate, endDate, setActiveView, viewportVariants }) {
  const { t } = useTranslation();
  // في حال عدم وجود حجز، نعرض حالة فارغة
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
          <Home size={42} className="text-blue-600/30" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t("student_overview.no_booking_title")}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{t("student_overview.no_booking_desc")}</p>
        </div>
        <button onClick={() => window.location.href = '/student'} className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-200 dark:shadow-blue-900/40 hover:scale-[1.02] active:scale-95 transition-all">
          {t("student_overview.browse_units")}
        </button>
      </div>
    );
  }

  return (
    <motion.div key="overview" variants={viewportVariants} initial="initial" animate="animate" exit="exit" className="space-y-5">
      <div className="flex flex-col md:flex-row gap-10">
        {/* قسم الصورة مع تأثيرات التحويم */}
        <div className="w-full md:w-5/12 group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
            <img
              src={bookedProperty?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              alt="Residence"
            />
            {/* تدرج لوني لتوضيح الموقع فوق الصورة */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-start">
              <div className="flex items-center gap-2 text-white/90 mb-1">
                <MapPin size={14} className="text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider">{booking.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* قسم تفاصيل البيانات */}
        <div className="w-full md:w-7/12 flex flex-col justify-between py-2 text-start">
          <div className="space-y-6">
            <div>
              {/* شارات الحالة (نشط/معلق) */}
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  {t("student_overview.current_unit")}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isApproved ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                  {isApproved ? t("student_overview.active_contract") : t("student_overview.pending")}
                </span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{booking.propertyTitle}</h2>
            </div>

            {/* شبكة المعلومات المصغرة */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <User size={12} className="text-blue-500" />
                  {t("student_overview.owner_name")}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{booking.ownerName}</p>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <CreditCard size={12} className="text-blue-500" />
                  {t("student_overview.payment_method")}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                  {(() => {
                    const mLower = (booking.payMethod || "").toLowerCase();
                    const isCard = mLower.includes("visa") || mLower.includes("card") || mLower.includes("credit");
                    return isCard ? t("student_overview.visa_card") : t("student_overview.cash");
                  })()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Calendar size={12} className="text-blue-500" />
                  {t("student_overview.start_date")}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatD(startDate)}</p>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Clock size={12} className="text-blue-500" />
                  {t("student_overview.end_date")}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatD(endDate)}</p>
              </div>

              <div className="col-span-2 space-y-1 pt-4 border-t border-slate-50 dark:border-white/5">
                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <MapPin size={12} className="text-blue-500" />
                  {t("student_overview.full_location")}
                </p>
                <p className="text-md font-bold text-slate-700 dark:text-slate-300">{booking.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
