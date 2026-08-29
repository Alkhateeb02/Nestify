import React from "react";
import { useTranslation } from "react-i18next";
import { StatNum } from "../ui/AnimatedStats";

export default function PropertyStats({ properties = [] }) {
  const { t } = useTranslation();

  // مصفوفة الإحصائيات المحسوبة بناءً على البيانات الحقيقية
  const stats = [
    {
      count: properties.length,
      label: t('property_details.listings.all_properties'),
      accent: "#004A8D"
    },
    {
      count: properties.filter(p => p.type === "Apartment").length,
      label: t('property_details.listings.apartments'),
      accent: "#6366f1"
    },
    {
      count: properties.filter(p => p.type === "Studio").length,
      label: t('property_details.listings.studios'),
      accent: "#10b981"
    },
    {
      count: properties.filter(p => p.type === "Shared Room").length,
      label: t('property_details.listings.shared'),
      accent: "#f59e0b"
    },
  ];

  return (
    <div className="mt-6 flex justify-center animate-fade-up" style={{ animationDelay: "160ms" }}>
      <div className="inline-flex items-stretch rounded-2xl border border-slate-200/70 dark:border-slate-700/50
        bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40
        overflow-hidden divide-x divide-slate-100 dark:divide-slate-800">

        {stats.map((s, i) => (
          <StatNum
            key={i}
            count={s.count}
            label={s.label}
            accent={s.accent}
          />
        ))}

      </div>
    </div>
  );
}
