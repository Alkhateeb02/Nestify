import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function StepNearbyPlaces({ propData, nearbyCategories, addNearbyPlace, updateNearbyPlace, removeNearbyPlace, boxInput, t }) {
  return (
    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      
      {/* الأماكن المحيطة بالسكن */}
      {nearbyCategories.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={16} className={color} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
            </div>
            <button type="button" onClick={() => addNearbyPlace(key)} className="text-[10px] font-black text-blue-600 hover:underline">
              + {t("owner_dashboard.add_btn")}
            </button>
          </div>
          
          {/* قائمة الأماكن المضافة */}
          {(propData.nearby?.[key] || []).map((place, idx) => (
            <div key={idx} className="flex gap-2">
              <input type="text" value={place.name} onChange={e => updateNearbyPlace(key, idx, "name", e.target.value)} placeholder={t("owner_dashboard.place_name")} className={boxInput} />
              <input type="text" value={place.distance} onChange={e => updateNearbyPlace(key, idx, "distance", e.target.value)} placeholder={t("owner_dashboard.place_dist")} className={`${boxInput} w-24`} />
              <button type="button" onClick={() => removeNearbyPlace(key, idx)} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 grid place-items-center">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}
