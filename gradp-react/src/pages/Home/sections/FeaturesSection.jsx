/* 
 * مكون FeaturesSection الخاص بواجهة المستخدم.
 */
import React from "react";
import { ShieldCheck, Search, Zap, Award, Heart, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/ui/Badge";

const ICON_MAP = {
  safe: ShieldCheck,
  search: Search,
  contact: Zap,
  prices: Award,
  support: Heart,
  hub: Users
};

export default function FeaturesSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const featuresList = [
    { key: "safe", theme: "from-indigo-900 to-blue-500", glowColor: "#4f46e5" },
    { key: "search", theme: "from-lime-300 to-green-400", glowColor: "#bef264" },
    { key: "contact", theme: "from-blue-500 to-green-500", glowColor: "#22c55e" },
    { key: "prices", theme: "from-rose-500 to-blue-700", glowColor: "#e11d48" },
    { key: "support", theme: "from-emerald-500 to-teal-400", glowColor: "#10b981" },
    { key: "hub", theme: "from-sky-500 to-blue-400", glowColor: "#0ea5e9" },
  ];

  return (
    <section id="Fe-grid-main" className="relative py-20 bg-[#F9FAFB] dark:bg-slate-950 transition-all duration-1000 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-8">

        <div className="mb-24 flex flex-col items-center">
          <Badge className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-5 py-1.5 shadow-sm mb-8">
            <Sparkles size={13} className={`me-2 ${isArabic ? 'text-lime-500' : 'text-indigo-600'}`} />
            <span className="text-[13px] font-bold uppercase tracking-widest">{t("Fe.badge")}</span>
          </Badge>

          <h2 className="text-[30px] leading-[1.15] md:text-5xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tighter">
            {t("Fe.title_part1")} <br />
            <span className="text-lime-500 drop-shadow-[0_2px_10px_rgba(190,242,100,0.3)]">
              {t("Fe.title_part2")}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
          {featuresList.map((feat, i) => {
            const IconComponent = ICON_MAP[feat.key];


            const title = t(`Fe.items.${feat.key}.title`);
            const desc = t(`Fe.items.${feat.key}.desc`);

            return (
              <div
                key={`${feat.key}-${i}`}
                onMouseEnter={() => {

                  if (import.meta.env.MODE === 'development') console.debug('Hovering:', feat.key);
                }}
                className={`group relative z-1 p-[1.5px] rounded-[3.2rem] transition-transform duration-500 hover:-translate-y-2.5 
                  ${isArabic ? 'text-right' : 'text-left'} 
                  ${i === 1 ? 'lg:scale-105' : ''}`}
              >
                <div className="absolute inset-0 rounded-[3.2rem] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_40%,#bef264_50%,transparent_60%)]" />
                </div>

                <div className="relative h-full bg-white dark:bg-[#0f172a] rounded-[calc(3.2rem-1.5px)] p-9 z-10 border border-slate-100/50 dark:border-transparent">
                  <div className={`w-14 h-14 mb-8 flex items-center justify-center rounded-2xl bg-gradient-to-br ${feat.theme} shadow-2xl transition-all duration-500 group-hover:rotate-[12deg] group-hover:scale-110`}>
                    {IconComponent && <IconComponent className="text-white w-7 h-7" strokeWidth={1.8} />}
                  </div>

                  <h3 className="text-2xl font-[850] text-slate-900 dark:text-white mb-4 leading-none">
                    {title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed opacity-90 font-medium">
                    {desc}
                  </p>
                </div>

                <div
                  className="absolute inset-10 opacity-0 group-hover:opacity-20 blur-[50px] transition-all duration-700 -z-10"
                  style={{ backgroundColor: feat.glowColor }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section >
  );
}