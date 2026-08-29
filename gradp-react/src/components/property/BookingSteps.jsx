import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Info, ArrowRight, CreditCard, Banknote, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { useTranslation } from "react-i18next";

export function BookingDatesStep({ startDate, setStartDate, numberOfDays, setNumberOfDays, endDate, formattedEnd, rentalPeriod, listingType, onContinue }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const isPerBed = listingType === "PerBed" || listingType === "Hybrid";

  return (
    <motion.div key="dates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          {t("booking_panel.dates.start_label")}
        </p>

        <div className="relative">
          <Calendar size={16} className={`absolute ${isAr ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            min={(() => {
              const d = new Date();
              d.setDate(d.getDate() + 2);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            })()}
            className={`w-full px-4 py-3 ${isAr ? "pr-10" : "pl-10"} rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-lime-400 text-slate-900 dark:text-white transition-all`}
          />
        </div>
      </div>

      {rentalPeriod === "daily" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {t("booking_panel.dates.num_days_label")}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={numberOfDays}
              onChange={e => setNumberOfDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-lime-400 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </motion.div>
      )}

      {startDate && endDate && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              {t("booking_panel.dates.last_day")}
            </p>
          </div>
          <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 pl-6">
            {formattedEnd}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 pl-6">
            {rentalPeriod === "seasonal" && t("booking_panel.dates.duration_seasonal")}
            {rentalPeriod === "monthly" && t("booking_panel.dates.duration_monthly")}
            {rentalPeriod === "daily" && (numberOfDays > 1 ? t("booking_panel.dates.duration_daily_plural", { count: numberOfDays }) : t("booking_panel.dates.duration_daily"))}
          </p>
        </motion.div>
      )}

      {/* Per-Bed clarity note */}
      {isPerBed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl px-3 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
        >
          <Info size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
            {isAr
              ? "⚪️ حجز سرير فردي: السعر المعروض مخصص لسريرك الخاص فقط. أنت لا تدفع سوى مقابل سريرك، وليس بقية أسرة الغرفة."
              : "⚪️ Per-Bed Booking: The price shown is for your individual bed only. You are not charged for other beds in the room."}
          </p>
        </motion.div>
      )}

      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
        <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
          {t("booking_panel.dates.note")}
        </p>
      </div>

      <Button onClick={onContinue} disabled={!startDate} className="w-full !rounded-xl !bg-blue-800 hover:!bg-blue-900 dark:!bg-lime-500 dark:hover:!bg-lime-600 !text-white dark:!text-slate-900 font-bold border-none disabled:opacity-50">
        <span className="flex items-center gap-2 justify-center">
          {t("booking_panel.dates.continue")} <ArrowRight size={14} />
        </span>
      </Button>
    </motion.div>
  );
}

export function BookingMethodStep({ payMethod, setPayMethod, onBack, onContinue }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <motion.div key="method" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
        {t("booking_panel.method.label")}
      </p>

      <button
        onClick={() => setPayMethod("visa")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold  transition-all ${payMethod === "visa" ? "border-blue-600 !bg-blue-50 text-blue-700 dark:border-lime-500 dark:!bg-lime-500/10 dark:!text-lime-400" : "border-slate-200 dark:border-slate-700 !bg-white dark:!bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"}`}
      >
        <CreditCard size={18} /> {t("booking_panel.method.credit_card")}
        {payMethod === "visa" && <CheckCircle2 size={16} className={`${isAr ? "mr-auto" : "ml-auto"}  text-blue-600 dark:text-lime-400`} />}
      </button>

      <button
        onClick={() => setPayMethod("cash")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${payMethod === "cash" ? "border-blue-600 !bg-blue-50 text-blue-700 dark:border-lime-500 dark:!bg-lime-500/10 dark:!text-lime-400" : "border-slate-200 dark:border-slate-700 bg-white dark:!bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"}`}
      >
        <Banknote size={18} /> {t("booking_panel.method.cash")}
        {payMethod === "cash" && <CheckCircle2 size={16} className={`${isAr ? "mr-auto" : "ml-auto"} text-blue-600 dark:text-lime-400`} />}
      </button>

      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-colors">
          {t("booking_panel.method.back")}
        </button>
        <Button onClick={onContinue} disabled={!payMethod} className="flex-1 !rounded-xl !bg-blue-800 hover:!bg-blue-900 dark:!bg-lime-500 dark:hover:!bg-lime-600 !text-white dark:!text-slate-900 font-bold border-none disabled:opacity-50">
          {t("booking_panel.method.continue")}
        </Button>
      </div>
    </motion.div>
  );
}

export function BookingCashStep({ onBack, onComplete }) {
  const { t } = useTranslation();

  return (
    <motion.div key="cash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-black text-amber-800 dark:text-amber-400 mb-1">{t("booking_panel.cash.notice_title")}</p>
          <p className="text-xs text-amber-700 dark:text-amber-500 font-medium leading-relaxed">
            {t("booking_panel.cash.notice_desc")}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onComplete} className="flex-1 !rounded-xl !bg-blue-800 hover:!bg-blue-900 dark:!bg-lime-500 dark:hover:!bg-lime-600 !text-white dark:!text-slate-900 font-bold border-none text-sm">
          {t("booking_panel.cash.book_now")}
        </Button>
        <button type="button" onClick={onBack} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-colors">
          {t("booking_panel.cash.back")}
        </button>
      </div>
    </motion.div>
  );
}

export function BookingSuccessStep() {
  const { t } = useTranslation();

  return (
    <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-3">
      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center mx-auto">
        <CheckCircle2 size={28} className="text-emerald-500" />
      </div>
      <p className="font-black text-slate-900 dark:text-white text-sm">{t("booking_panel.done.title")}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t("booking_panel.done.redirecting")}</p>
    </motion.div>
  );
}
