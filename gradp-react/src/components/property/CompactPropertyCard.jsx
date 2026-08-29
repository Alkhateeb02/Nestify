
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, UserCircle2, Bed, Users } from "lucide-react";

export default function CompactPropertyCard({ property }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const formattedPrice = new Intl.NumberFormat("en-US").format(property.price);

  return (
    <Link
      to={`/property/${property.id}`}
      className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:border-blue-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-lime-500/30"
    >
      {/* الصورة المصغرة */}
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* المعلومات */}
      <div className="min-w-0 flex-1 space-y-1">
        <h4 className="truncate text-sm font-black text-slate-900 dark:text-white">
          {property.title}
        </h4>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          <MapPin size={10} className="text-blue-700 dark:text-lime-500" />
          <span className="truncate">
            {typeof property.location === 'object' 
              ? (property.location?.formatted_address || property.address || property.locationText || 'No Address') 
              : (property.location || property.address || 'No Address')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-black text-blue-800 dark:text-lime-400">
              {formattedPrice}
            </span>
            <span className="text-[8px] font-bold uppercase text-slate-400">
              {property.currency}
              {(property.listingType === 'PerBed' || property.listingType === 'Hybrid') && (
                <span className="text-emerald-500 ml-0.5">/ {isAr ? 'سرير' : 'Bed'}</span>
              )}
            </span>
          </div>

          {/* شارة الإشغال */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-0.5 dark:bg-slate-800">
            {property.listingType === "Solo" ? (
              <UserCircle2 size={10} className="text-blue-600" />
            ) : property.listingType === "PerBed" ? (
              <Bed size={10} className="text-emerald-600" />
            ) : (
              <Users size={10} className="text-amber-600" />
            )}
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-300">
              {property.listingType === "Solo"
                ? t('property_details.stats.solo')
                : `${Math.max(0, (property.capacity || 1) - (property.currentOccupancy || 0))} / ${property.capacity || 1} ${t('property_details.stats.beds_left')}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
