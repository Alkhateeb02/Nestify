
import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Star, ArrowUpRight, UserCircle2, CheckCircle2, BedDouble, Users, Heart } from "lucide-react";
import { FEATURE_CONFIG } from "../../constants/featureConfig";
import api from "../../utils/api";

let favoritesCachePromise = null;
let favoritesCacheData = null;

async function getOrFetchFavorites(userId) {
  if (favoritesCacheData) return favoritesCacheData;
  if (favoritesCachePromise) return favoritesCachePromise;

  favoritesCachePromise = api.get("/favorites")
    .then(res => {
      if (res.success && res.data) {
        favoritesCacheData = res.data;
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(res.data));
        return res.data;
      }
      return [];
    })
    .catch((err) => {
      console.warn("Failed to fetch favorites, using cache:", err);
      const cached = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
      favoritesCacheData = cached;
      return cached;
    });

  return favoritesCachePromise;
}
export function invalidateFavoritesCache() {
  favoritesCacheData = null;
  favoritesCachePromise = null;
}

export default function PropertyCard({ property }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  if (!property) return null;

  const [imageError, setImageError] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      if (!userId) return false;
      const favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
      return favs.some(fav => (fav.id?.toString() === property.id?.toString()) || (fav?.toString() === property.id?.toString()));
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkFavoriteStatus = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      if (!userId) return;

      const favs = await getOrFetchFavorites(userId);
      const isFav = favs.some(fav => (fav.id?.toString() === property.id?.toString()) || (fav?.toString() === property.id?.toString()));
      setIsFavorite(isFav);
    };

    checkFavoriteStatus();

    const handleUpdate = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      if (userId) {
        const favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
        const isFav = favs.some(fav => (fav.id?.toString() === property.id?.toString()) || (fav?.toString() === property.id?.toString()));
        setIsFavorite(isFav);
      }
    };

    window.addEventListener("favoritesUpdate", handleUpdate);
    return () => window.removeEventListener("favoritesUpdate", handleUpdate);
  }, [property.id, isLoggedIn]);

  // دالة التعامل مع ضغطة القلب (الفيفوريت)
  const handleFavorite = async (e) => {
    e.stopPropagation(); // منع الانتقال لصفحة التفاصيل عند الضغط على القلب
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);

    try {
      // Toggle favorite on the backend
      await api.post("/favorites/toggle", { propertyId: property.id });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      if (userId) {
        let favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
        if (nextVal) {
          if (!favs.some(fav => fav.id?.toString() === property.id?.toString())) {
            favs.push(property);
          }
        } else {
          favs = favs.filter(fav => fav.id?.toString() !== property.id?.toString());
        }
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(favs));
        favoritesCacheData = favs; // Update global memory cache
        window.dispatchEvent(new Event("favoritesUpdate"));
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorite(!nextVal); // Revert on failure
    }
  };

  const displayPrice = isNaN(property.price) ? "0" : new Intl.NumberFormat("en-US").format(property.price);
  const activeFeatures = FEATURE_CONFIG.filter(f => property.features?.[f.key]).slice(0, 4);

  return (
    <article
      onClick={() => navigate(`/property/${property.id}`)}
      className="group cursor-pointer flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10"
    >
      {/* ── IMAGE ── */}
      <div className="relative overflow-hidden h-52 shrink-0">
        <img
          src={imageError || !property.image ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200" : property.image}
          alt={property.title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* تأثير التعتيم المحيطي */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* شارة الحالة */}
        <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg ${property.available
          ? "bg-emerald-500 text-white"
          : "bg-rose-500   text-white"
          }`}>
          {property.available ? t('property_details.listings.available') : t('property_details.listings.rented')}
        </span>

        {/* زر الفيفوريت ( شفاف تماماً - بدون أي خلفية ) */}
        <button
          onClick={handleFavorite}
          className="absolute top-4 right-4 z-20 transition-all hover:scale-125 active:scale-90 group/heart bg-transparent border-none p-0"
        >
          <Heart
            size={22}
            strokeWidth={1.5}
            stroke="red" // حدود بيضاء رقيقة عشان يبرز ع الصور
            className={`transition-all drop-shadow-md ${isFavorite ? "!fill-rose-500 !text-rose-500" : "text-black/30 group-hover/heart:text-rose-500"}`}
          />
        </button>

        {/* السعر على الصورة */}
        <div className="absolute bottom-4 left-4 flex items-baseline gap-1 text-white">
          <span className="text-2xl font-black drop-shadow">{displayPrice}</span>
          <span className="text-xs font-bold opacity-75 uppercase">
            {property.currency || 'JOD'}/{(() => {
              const map = {
                monthly: t('property_details.stats.monthly', 'mo'),
                daily: t('property_details.stats.daily', 'day') || 'day',
                seasonal: t('property_details.stats.seasonal', 'season') || 'season'
              };
              return map[property.rentalPeriod] || map.monthly;
            })()}
            {(property.listingType === 'PerBed' || property.listingType === 'Hybrid') && (
              <span className="ml-1 text-emerald-300">/ {isAr ? 'سرير' : 'Bed'}</span>
            )}
          </span>
        </div>

        {/* التقييم على الصورة */}
        {property.rating && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-white">{property.rating}</span>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 flex-col p-5 gap-4">

        {/* صف المالك */}
        <div className="flex items-center gap-2">
          <div className="grid place-items-center h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <UserCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {property.ownerName ?? t('property_details.landlord')}
          </span>
          <CheckCircle2 size={12} className="text-emerald-500 mt-px" />

          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            {property.listingType === "Solo" && (
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-lime-400">
                <UserCircle2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">{t('property_details.stats.solo')}</span>
              </div>
            )}
            {property.listingType === "PerBed" && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <BedDouble size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {Math.max(0, (property.capacity || 1) - (property.currentOccupancy || 0))} / {property.capacity || 1} {t('property_details.stats.beds_left')}
                </span>
              </div>
            )}
            {property.listingType === "Hybrid" && (
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <Users size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {Math.max(0, (property.capacity || 1) - (property.currentOccupancy || 0))} / {property.capacity || 1} {t('property_details.stats.beds_left')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* title + location */}
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 tracking-tight">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400">
            <MapPin size={14} className="text-blue-700 dark:text-lime-500 shrink-0" />
            <span className="text-sm font-semibold truncate">
              {typeof property.location === 'object' 
                ? (property.location?.formatted_address || property.address || property.locationText || 'No Address') 
                : (property.location || property.address || 'No Address')}
            </span>
          </div>
        </div>

        {/* أزرار المميزات */}
        {activeFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFeatures.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                <Icon size={13} />
                {t(`property_details.features.${key}`)}
              </div>
            ))}
          </div>
        )}

        {/* زر اتخاذ الإجراء (CTA) */}
        <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
          <Button
            onClick={e => { e.stopPropagation(); navigate(`/property/${property.id}`); }}
            className="w-full !flex !items-center !justify-between !rounded-2xl !bg-blue-800 !px-5 !py-3 !text-white hover:!bg-blue-900 active:scale-95 border-none shadow-none"
          >
            <span className="text-sm font-black">{t('property_details.listings.view_details')}</span>
            <span className="grid place-items-center h-8 w-8 rounded-xl bg-white/20">
              <ArrowUpRight size={18} />
            </span>
          </Button>
        </div>
      </div>
    </article>
  );
}