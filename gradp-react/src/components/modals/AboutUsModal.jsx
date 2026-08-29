
import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Scale, Info, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";

export default function AboutUsModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* خلفية داكنة خفيفة وراقية */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* الكارد الرئيسي - حجم رشيق (Compact) */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-[480px] bg-white dark:bg-slate-950 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-slate-100 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هيدر ناعم وبسيط */}
        <div className="p-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
              {t("policies.title")}
            </h2>
          </div>
        </div>

        {/* محتوى السياسات بأسلوب منظم (Minimal) */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[50vh] no-scrollbar">

          {/* إخلاء المسؤولية */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-500">
              <Scale size={14} />
              <h3 className="text-sm font-black uppercase tracking-widest">{t("policies.disclaimer_title")}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t("policies.disclaimer_desc")}
            </p>
          </div>

          {/* تنبيه الضمانات */}
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex gap-3 items-start">
            <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200/70 font-bold leading-tight">
              {t("policies.guarantee_note")}
            </p>
          </div>

          {/* سياسة الخصوصية */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-500">
              <CheckCircle2 size={14} />
              <h3 className="text-sm font-black uppercase tracking-widest">{t("policies.privacy_title")}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                {t("policies.privacy_item1")}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                {t("policies.privacy_item2")}
              </div>
            </div>
          </div>

        </div>

        {/* فوتر بسيط مع الموافقة */}
        <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 space-y-4">

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-800 checked:bg-indigo-600 checked:border-indigo-600 transition-all appearance-none cursor-pointer"
              />
              <CheckCircle2 size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
              {t("policies.agree_checkbox")}
            </span>
          </label>

          <Button
            onClick={onClose}
            disabled={!agreed}
            className={`w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${agreed
                ? "!bg-indigo-600 !text-white shadow-lg shadow-indigo-500/20"
                : "!bg-slate-200 !text-slate-400 opacity-50 cursor-not-allowed"
              }`}
          >
            {t("policies.continue_btn")}
          </Button>

        </div>
      </motion.div>
    </div>
  );
}
