import React from "react";
import { motion } from "framer-motion";

export default function StepFeatures({ propData, toggleFeature, features, t, isAr, isLoading }) {
  if (isLoading) {
    return (
      <motion.div key="step3-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-[300px] space-y-4 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl p-8 border border-slate-100 dark:border-slate-800"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-400 animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 rounded-full bg-blue-500/15 blur-md animate-pulse"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">
            {isAr ? "جاري توليد المميزات ذكياً..." : "AI Auto-Generating Features..."}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            {isAr ? "نحلل وصف السكن لنقترح أفضل التاغات المناسبة" : "Analyzing property description to suggest the best tags"}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {/* شبكة المميزات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* بنلف على كل المميزات (واي فاي، كراج، إلخ) وبنرسم كبسة لكل وحدة */}
        {features.map((feature) => {
          const { key, icon: Icon, labelAr, labelEn } = feature;
          const featuresArr = Array.isArray(propData.features)
            ? propData.features
            : (propData.features && typeof propData.features === 'object' 
                ? Object.keys(propData.features).filter(k => propData.features[k] === true) 
                : []);
          const on = featuresArr.includes(key);
          const i18nKey = `property_details.features.${key}`;
          const label = t(i18nKey) !== i18nKey ? t(i18nKey) : (isAr ? labelAr : labelEn);

          return (
            <button key={key} type="button" onClick={() => toggleFeature(key)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 ${on
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/40 shadow-md shadow-blue-500/5"
                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                }`}>
              {/* أيقونة الميزة واسمها بالعربي/إنجليزي */}
              {Icon && <Icon size={18} />}
              <span className="text-xs font-bold truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
