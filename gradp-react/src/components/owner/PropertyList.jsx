
import React from "react";
import { Search, Building2, MapPin, Pencil, Trash2, MoreVertical } from "lucide-react";

export default function PropertyList({
  properties,
  isAr,
  t,
  openEdit,
  deleteProp
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* ── رأس القائمة مع البحث ── */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white">
          {t("owner_dashboard.active_board")}
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? "بحث..." : "Search..."}
              className="pl-8 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── عرض العقارات أو حالة "لا يوجد نتائج" ── */}
      {properties.length === 0 ? (
        <div className="py-20 text-center">
          <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">{t("owner_dashboard.no_props")}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {properties.map((prop, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              {/* صورة رمزية للعقار */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                {prop.propertiesImage || prop.properties_image || prop.image ? (
                  <img src={prop.propertiesImage || prop.properties_image || prop.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} />
                )}
              </div>

              {/* تفاصيل العقار (الاسم، الموقع، السعر) */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{prop.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {prop.address || prop.locationText || "—"}
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{isAr ? "السعر" : "Price"}</p>
                  <p className="text-sm font-black text-blue-600 dark:text-lime-400">
                    {prop.price} {prop.currency || "JOD"}
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {isAr ? "النوع / الإشغال" : "Type / Occupancy"}
                  </p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {prop.type}
                    {(prop.listingType === "PerBed" || prop.listingType === "Hybrid") && (
                      <span className="mx-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ({prop.currentOccupancy || 0}/{prop.capacity || 1} {isAr ? "مشغول" : "Occupied"})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* أزرار الأكشن (تعديل، حذف) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(idx)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 border border-transparent hover:border-slate-200 transition-all"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteProp(idx)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-600 border border-transparent hover:border-slate-200 transition-all"
                >
                  <Trash2 size={16} />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 border border-transparent hover:border-slate-200 transition-all">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
