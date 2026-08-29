/* 
 * مكون يعرض الجانب البصري والتسويقي في صفحة تسجيل الدخول (صور، نصوص متحركة).
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/Badge";
import { Sparkles } from "lucide-react";

// هاي بتفصل الكلمة الأخيرة من العنوان عشان نلونها أخضر لحالها
const SplitTitle = ({ title }) => {
  if (!title) return null; // نتأكد إنو في نص أصلاً
  // بنفصل الكلمات عن بعض عن طريق المسافة
  const words = title.trim().split(" ");
  // إذا العنوان بس كلمة وحدة، بنرجعه زي ما هو
  if (words.length <= 1) return title;
  // بناخذ آخر كلمة
  const lastWord = words.pop();
  return (
    <>
      {words.join(" ")}{" "}
      {/* بنطبع الجملة وبعدها الكلمة الأخيرة بلون أخضر */}
      <span className="text-[#82BC00] dark:text-[#97db00]">
        {lastWord}
      </span>
    </>
  );
};
// هاد المكون اللي بعرض الحركات والصورة على جنب بصفحة الدخول والتسجيل
export default function AuthShowcase({ content, step, isLogin }) {
  // بناخذ الداتا اللي بدنا نعرضها من الـ content
  const { title, subtitle, badge, img } = content;
  return (
    // مخفية عالموبايلات وبتطلع عادي بالشاشات الكبيرة
    <div className="hidden lg:flex items-center justify-center relative p-10 xl:p-16 overflow-hidden">
      {/* حاوية المحتوى، z-10 عشان تضل فوق الخلفية */}
      <div className="relative z-10 w-full max-w-lg text-center">
        {/* هاد عشان نشغل الانيميشن بس يتغير المحتوى */}
        <AnimatePresence mode="wait">
          <motion.div
            // ضروري عشان الأنيميشن يشتغل كل ما تتغير الخطوة أو نوع الصفحة
            key={`${step}-${isLogin}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // سرعة وشكل الأنيميشن
            className="flex flex-col items-center"
          >
            {/* الشارة الصغيرة (الباج) */}
            <Badge className="mb-5 text-[11px] font-black tracking-widest py-2.5 px-4 shadow-lg shadow-[#82BC00]/10">
              <Sparkles size={14} className="mr-1" />
              {badge}
            </Badge>
            {/* العنوان (وبنستخدم SplitTitle عشان يلون آخر كلمة) */}
            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              <SplitTitle title={title} />
            </h1>
            {/* النص الصغير تحت العنوان */}
            <p className="text-base xl:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-md">
              {subtitle}
            </p>
            {/* قسم الصورة */}
            <div className="relative w-full max-w-[340px] mt-4">
              {/* ضوء أخضر خفيف (Blur) ورى الصورة */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#82BC00]/15 to-transparent blur-3xl rounded-full" />
              {/* الصورة مع تأثير بتكبر نتفة بس تحط الماوس عليها */}
              <img
                src={img}
                alt="Auth Illustration"
                className="relative w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] hover:scale-110 transition duration-700"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
