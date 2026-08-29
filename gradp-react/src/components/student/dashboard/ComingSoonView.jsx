import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ComingSoonView({ isAr, setActiveView, viewportVariants }) {
  const { t } = useTranslation();
  return (
    <motion.div key="coming-soon" variants={viewportVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center h-[500px] text-center">
      {/* أيقونة تزيينية مع خلفية ملونة */}
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 text-blue-500">
        <Sparkles size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t("coming_soon.title")}</h2>
      <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
        {t("coming_soon.desc")}
      </p>
      {/* زر العودة للرئيسية */}
      <button
        onClick={() => setActiveView("overview")}
        className="mt-8 !text-blue-600 dark:!text-blue-400 font-bold flex items-center gap-2 hover:gap-3 transition-all"
      >
        <ArrowLeft size={16} />
        {t("coming_soon.back")}
      </button>
    </motion.div>
  );
}
