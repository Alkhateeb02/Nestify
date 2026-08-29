/* 
 * مكون يعرض أشكال هندسية عائمة في الخلفية لزيادة جمالية الصفحة.
 */
import React from "react";

/**
 * الأشكال الهندسية الطافية 
 */
export default function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* مثلث — يمين أعلى */}
      <div className="absolute top-36 right-16 hidden lg:block animate-float-slow opacity-[0.1] dark:opacity-[0.15]"
        style={{ animationDelay: "0s" }}>
        <svg width="80" height="80" viewBox="0 0 80 80"><polygon points="40,4 76,76 4,76" fill="#004A8D" /></svg>
      </div>

      {/* دائرة مفرغة — يسار وسط */}
      <div className="absolute top-56 left-10 hidden lg:block animate-float-med opacity-[0.13] dark:opacity-[0.5]"
        style={{ animationDelay: "1.5s" }}>
        <svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="none" stroke="#82BC00" strokeWidth="3" /></svg>
      </div>

      {/* مربع مائل — يمين وسط */}
      <div className="absolute top-80 right-24 hidden xl:block animate-float-slow opacity-[0.08] dark:opacity-[0.14]"
        style={{ animationDelay: "3s" }}>
        <svg width="44" height="44" viewBox="0 0 44 44"><rect x="6" y="6" width="32" height="32" fill="none" stroke="#6366f1" strokeWidth="2.5" transform="rotate(20 22 22)" /></svg>
      </div>

      {/* خط متموج — يسار أسفل */}
      <div className="absolute bottom-[30%] left-20 hidden xl:block animate-float-med opacity-[0.7] dark:opacity-[0.12]"
        style={{ animationDelay: "2s" }}>
        <svg width="100" height="40" viewBox="0 0 100 40"><path d="M0,20 Q25,5 50,20 Q75,35 100,20" fill="none" stroke="#004A8D" strokeWidth="2.5" /></svg>
      </div>
    </div>
  );
}
