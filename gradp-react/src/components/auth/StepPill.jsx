/* 
 * مكون StepPill الخاص بواجهة المستخدم.
 */
import React from "react";
import { Check } from "lucide-react";

/*
  هون الـ Stepper الأنيق (بدل زرار الداوئر الكبيرة والمزعجة):
  عبارة عن دوائر صغيرة جداً (Minimal Points).
  الدائرة الحالية بتصير ملونة والباقي رمادي. الخط تم رسمه خلف الدوائر بالفورم.
*/
export default function StepPill({ item, currentStep, isAr }) {
  const active = currentStep === item.id;
  const done = currentStep > item.id;

  return (
    <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-slate-950 px-1">
      {/* الدائرة الناعمة (النقطة) */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out shadow-sm ${active
          ? "border-blue-600 bg-blue-600/5 text-blue-800 ring-2 ring-blue-800/15 dark:border-lime-500 dark:bg-lime-500/10 dark:text-lime-500 dark:ring-4 dark:ring-lime-500/15 scale-110"
          : done
            ? "border-lime-500 bg-lime-500 text-white dark:border-lime-500 dark:bg-lime-500 dark:text-slate-900"
            : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
          }`}
      >
        {done ? (
          <Check size={16} strokeWidth={4} />
        ) : (
          <span className="text-[12px] font-black">{item.id}</span>
        )}
      </div>

      {/* عنوان الخطوة */}
      <span className={`absolute top-10 text-[10px] sm:text-[11px] font-bold whitespace-nowrap hidden sm:block transition-colors duration-300 ${active
        ? "text-blue-800 dark:text-lime-500"
        : done
          ? "text-lime-500 dark:text-lime-500/80"
          : "text-slate-400"
        }`}>
        {item.title}
      </span>
    </div>
  );
}