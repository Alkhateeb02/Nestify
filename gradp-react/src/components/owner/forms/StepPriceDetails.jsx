
import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar } from "lucide-react";

export default function StepPriceDetails({ propData, setPropData, boxInput, labelCls, t, isAr }) {
  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">

      {/* تفاصيل السعر والمساحة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* إدخال السعر */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.price")}</label>
          <div className="relative">
            <DollarSign size={16} className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input required type="number" value={propData.price || ""} onChange={e => setPropData({ ...propData, price: e.target.value })} className={`${boxInput} ${isAr ? "pr-10" : "pl-10"}`} />
          </div>
        </div>
        {/* اختيار العملة */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.currency")}</label>
          <select value={propData.currency || "JOD"} onChange={e => setPropData({ ...propData, currency: e.target.value })} className={boxInput}>
            <option value="JOD">JOD</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {/* إدخال المساحة */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.area")}</label>
          <input type="number" value={propData.area || ""} onChange={e => setPropData({ ...propData, area: e.target.value })} className={boxInput} />
        </div>
      </div>

      {/* خيارات مدة الإيجار */}
      <div className="space-y-3">
        <label className={labelCls}>{t("owner_dashboard.rental_period")}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* بنلف على الخيارات (يومي، شهري، فصلي) وبنرسم الكبسات */}
          {[
            { val: "monthly", label: t("owner_dashboard.monthly") },
            { val: "daily", label: t("owner_dashboard.daily") },
            { val: "seasonal", label: t("owner_dashboard.seasonal") },
          ].map(({ val, label }) => (
            <button key={val} type="button" onClick={() => setPropData({ ...propData, rentalPeriod: val })}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${propData.rentalPeriod === val
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10"
                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400"
                }`}>
              <Calendar size={20} className="mb-2" />
              <span className="text-xs font-black uppercase tracking-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
