/* 
 * الشريط الجانبي في صفحة تفاصيل العقار (StudentRPage).
 * يعرض: السعر، فترة الإيجار، معلومات المالك، زر الحجز، لوحة الحجز
 */

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import BookingPanel from "./BookingPanel";

export default function PropertySidebar({ property }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  
  // التحقق من حالة تسجيل الدخول لتمكين أو تعطيل زر الحجز
  const isLoggedIn = !!localStorage.getItem("token");

  // تنسيق السعر بفواصل أرقام
  const formattedPrice = new Intl.NumberFormat("en-US").format(property.price);
  // حالة إظهار/إخفاء لوحة الحجز
  const [showBooking, setShowBooking] = useState(false);

  // ترجمة فترة الإيجار
  const rentalLabel = (period) => {
    const map = {
      monthly: isAr ? "شهري" : "Monthly",
      daily: isAr ? "يومي" : "Daily",
      seasonal: isAr ? "فصلي" : "Seasonal",
    };
    return map[period] || map.monthly;
  };

  const rentalPeriod = property.rentalPeriod || "monthly";

  const periodLabel = () => {
    const map = {
      monthly: t("property_details.stats.monthly", "mo"),
      daily: isAr ? "يومي" : "day",
      seasonal: isAr ? "فصلي" : "season",
    };
    return map[rentalPeriod] || map.monthly;
  };

  const capacity = property.capacity || 1;
  const currentOccupancy = property.currentOccupancy || 0;
  const isFull = currentOccupancy >= capacity;

  return (
    <div
      className="rounded-3xl border border-slate-100 bg-white p-6 drop-shadow-sm shadow-xl shadow-blue-900/5 dark:border-white/5 dark:bg-slate-900/95"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── السعر ── */}
      <div className="mb-4 flex items-end gap-1 border-b border-slate-100 pb-4 dark:border-slate-800">
        <span className="text-3xl font-black text-slate-900 dark:text-white">
          {formattedPrice}
        </span>
        <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {property.currency || "JOD"} / {periodLabel()}
          {(property.listingType === "PerBed" || property.listingType === "Hybrid") && (
            <span className="ml-1 text-emerald-500 dark:text-emerald-400">
              / {isAr ? "سرير" : "Bed"}
            </span>
          )}
        </span>
      </div>

      {/* فترة الإيجار */}
      <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
        <Clock size={15} className="text-blue-600 dark:text-lime-400 shrink-0" />
        <span className="text-xs font-black text-blue-700 dark:text-lime-400">
          {isAr ? "فترة الإيجار:" : "Rental Period:"} {rentalLabel(rentalPeriod)}
        </span>
        {rentalPeriod === "seasonal" && (
          <span className="text-[10px] font-bold text-blue-500 dark:text-blue-300 ml-auto">
            {isAr ? "4 أشهر" : "4 months"}
          </span>
        )}
      </div>

      {/* Remaining beds badge */}
      {(property.listingType === "PerBed" || property.listingType === "Hybrid") && (
        <div className="mb-4 flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t("property_details.stats.beds_available")}
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            {Math.max(0, capacity - currentOccupancy)} / {capacity}
          </span>
        </div>
      )}

      {/* Dynamic Hybrid description */}
      {property.listingType === "Hybrid" && (
        <div className="mb-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <span>✨ {isAr ? "نظام تقسيم الفاتورة" : "Hybrid Split Bill"}</span>
          </div>
          <p className="leading-relaxed font-semibold text-slate-600 dark:text-slate-300">
            {isAr 
              ? "سكن هجين: يتم تقسيم الإيجار الإجمالي للمسكن بالتساوي على جميع الحجوزات النشطة. السعر المعروض حالياً محدث تلقائياً بناءً على الحجوزات الحالية."
              : "Hybrid dorm: The total property rent is split equally among all active bookings. The displayed rate updates dynamically as more students reserve."
            }
          </p>
        </div>
      )}

      {/* معلومات المالك والفئة المستهدفة */}
      <div className="mb-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t("property_details.landlord")}
          </span>
          <span className="text-xs font-black text-blue-800 dark:text-lime-500">
            {t("property_details.verified_owner")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t("property_details.stats.target")}
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white">
            {property.gender === "Female"
              ? t("property_details.stats.female_only")
              : property.gender === "Male"
                ? t("property_details.stats.male_only")
                : t("property_details.stats.any_gender")}
          </span>
        </div>
      </div>
      {/* زر الحجز - يتم تعطيله وتغيير لونه للرمادي إذا لم يكن مسجلاً دخوله أو كان السكن ممتلئاً */}
      <motion.div 
        whileHover={(isLoggedIn && !isFull) ? { scale: 1.015 } : {}} 
        whileTap={(isLoggedIn && !isFull) ? { scale: 0.97 } : {}}
      >
        <Button
          disabled={!isLoggedIn || isFull}
          onClick={() => setShowBooking(prev => !prev)}
          className={`mb-4 w-full justify-center h-12 rounded-xl text-base font-bold transition-all border-none ${
            (isLoggedIn && !isFull)
              ? "!bg-blue-800 dark:!bg-lime-500 dark:text-slate-900 text-white shadow-lg shadow-blue-800/20 cursor-pointer hover:opacity-90"
              : "!bg-slate-200 dark:!bg-slate-800 !text-slate-400 dark:!text-slate-600 cursor-not-allowed opacity-60"
          }`}
        >
          <span className="flex items-center gap-2">
            {t("property_details.reserve_now")}
            <ArrowRight size={16} className={`transition-transform ${(isLoggedIn && !isFull) ? "group-hover:translate-x-1" : ""}`} />
          </span>
        </Button>
      </motion.div>

      {/* نص تحذيري لمطالبة غير المسجلين بالدخول لإتمام الحجز */}
      {!isLoggedIn && (
        <p className="text-[11px] font-bold text-center text-rose-500 dark:text-rose-400 mb-4 animate-pulse">
          {isAr ? "⚠️ يرجى تسجيل الدخول كطالب لتتمكن من الحجز" : "⚠️ Please log in as a student to book"}
        </p>
      )}

      {/* نص تحذيري إذا كان السكن ممتلئاً */}
      {isLoggedIn && isFull && (
        <p className="text-[11px] font-bold text-center text-rose-500 dark:text-rose-400 mb-4 animate-pulse">
          {isAr ? "⚠️ هذا السكن ممتلئ بالكامل حالياً ولا يمكن حجزه" : "⚠️ This dormitory is fully occupied and cannot be reserved"}
        </p>
      )}
      {/* لوحة الحجز (تظهر/تختفي بانيميشن) */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            {/* BookingPanel يتولى منطق الدفع بالكامل */}
            <BookingPanel
              property={property}
              onClose={() => setShowBooking(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* ملاحظات وشروط الحجز */}
      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-blue-50/50 p-3 text-xs text-blue-900 dark:bg-indigo-900/20 dark:text-blue-300 font-medium">
          <ul className="space-y-2 list-disc pl-4">
            <li>{t("property_details.approval_disclaimer")}</li>
            <li>{t("property_details.pricing_disclaimer")}</li>
          </ul>
        </div>
        {/* شارة الأمان */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={14} />
          {t("property_details.secure_payment")}
        </div>
      </div>

    </div>
  );
}
