/* 
 * مكون AnimatedStats الخاص بواجهة المستخدم.
 */
import React, { useState, useEffect, useRef } from "react";
import { useCountUp } from "../../hooks/useCountUp";

/*ف AnimatedStats.jsx وظيفته الأساسية هي إضافة حركات (Animations) 
حلوة لأي أرقام 
أو حصائيات بتظهر بالصفحة عشان تبين احترافية و"Premium". */

export function FlipDigit({ digit, delay = 0 }) {
  const [key, setKey] = useState(0);
  const prevDigit = useRef(digit);

  // تحديث المفتاح (key) عشان نرجع نشغل الأنيميشن لما يتغير الرقم
  useEffect(() => {
    if (prevDigit.current !== digit) {
      prevDigit.current = digit;
      setKey(k => k + 1);
    }
  }, [digit]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden"
      style={{ width: digit === "," ? "0.35em" : "0.65em", lineHeight: 1 }}
    >
      <span
        key={key}
        className="animate-digit-in inline-block"
        style={{ animationDelay: `${delay}ms` }}
      >
        {digit}
      </span>
    </span>
  );
}

/* ── رقم إحصائي كامل مع تأثير الدوران (Flip) لكل خانة لوحدها ── */
export function StatNum({ count, label, accent }) {
  // نقسم الرقم لخانات فردية عشان نعمل أنيميشن لكل خانة
  const digits = String(count).split("");

  return (
    <div className="group flex flex-col items-center justify-center px-5 py-3 gap-0.5
      hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors duration-200 cursor-default">
      <span
        className="text-2xl font-black leading-none tabular-nums inline-flex items-center"
        style={{ color: accent }}
      >
        {/* نمرر تأخير زمني مختلف لكل خانة عشان يتحركوا ورا بعض بشكل حلو */}
        {digits.map((d, i) => (
          <FlipDigit key={i} digit={d} delay={i * 60} />
        ))}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap mt-0.5">
        {label}
      </span>
    </div>
  );
}

/* ── عداد النتائج المتحرك (اللي بيظهر تحت الفلاتر) ── */
export function AnimatedCount({ value, label }) {
  // بنستخدم الهوك اللي عملناه عشان نخليه يعد لفوق
  const animated = useCountUp(value, 600);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold
      bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60
      px-3 py-1.5 rounded-xl backdrop-blur-sm">
      <span className="tabular-nums text-[#004A8D] dark:text-lime-400 font-black text-sm">{animated}</span>
      <span className="text-slate-400 dark:text-slate-500">{label}</span>
    </span>
  );
}
