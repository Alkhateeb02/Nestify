
import React from "react";
import { ShoppingCart, Waves, HeartPulse, Fuel } from "lucide-react";
import { useTranslation } from "react-i18next";

const categories = [
  { key: "supermarkets", labelKey: "property_details.categories.supermarkets", icon: ShoppingCart, color: "text-emerald-500" },
  { key: "laundry", labelKey: "property_details.categories.laundry", icon: Waves, color: "text-blue-500" },
  { key: "hospitals", labelKey: "property_details.categories.hospitals", icon: HeartPulse, color: "text-rose-500" },
  { key: "gasStations", labelKey: "property_details.categories.gasStations", icon: Fuel, color: "text-amber-500" },
];

export default function NearbyPlaces({ nearby }) {
  const { t } = useTranslation();

  // لو ما في بيانات، ما تعرض إشي
  if (!nearby) return null;

  return (
    // الحاوية اللي بتجمع كل الأنواع تحت بعض
    <div className="flex flex-col gap-8 py-2">
      {/* لفّة على كل نوع (سوبر ماركت، غسيل، إلخ) */}
      {categories.map(({ key, labelKey, icon: Icon, color }) => {
        const places = nearby[key];
        // لو النوع هاد فاضي، طنشه
        if (!places || places.length === 0) return null;
        return (
          // حاوية النوع الواحد (العنوان + القائمة)
          <div key={key} className="space-y-4">
            {/* أيقونة واسم النوع (زي سوبر ماركت) */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${color}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                {t(labelKey)}
              </span>
            </div>
            {/* قائمة أول 3 أماكن بس عشان الزحمة */}
            <div className="space-y-3 pl-11">
              {places.slice(0, 3).map((place, i) => (
                // سطر المكان الواحد (الاسم والمسافة)
                <div key={i} className="flex items-center justify-between group">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                    {place.name}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {place.distance}
                  </span>
                </div>
              ))}
            </div>

          </div>
        );
      })}
    </div>
  );
}
