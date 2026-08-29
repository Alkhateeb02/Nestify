import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import PropertyCard from "../../property/PropertyCard";
import api from "../../../utils/api";

export default function FavoritesView({ isAr, viewportVariants }) {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);

  const loadFavoritesFromApi = async () => {
    try {
      const response = await api.get("/favorites");
      const data = response && response.success && Array.isArray(response.data) ? response.data : [];
      setFavorites(data);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      if (userId) {
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(data));
      }
    } catch (_) {
      // Fallback to student-specific local storage
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id || user.user_id;
        if (userId) {
          const favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
          setFavorites(Array.isArray(favs) ? favs : []);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        setFavorites([]);
      }
    }
  };

  // Lightweight sync from local cache (used on favoritesUpdate event to avoid re-fetch loop)
  const syncFromCache = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;
      if (userId) {
        const favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
        setFavorites(Array.isArray(favs) ? favs : []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadFavoritesFromApi();
    window.addEventListener("favoritesUpdate", syncFromCache);
    return () => window.removeEventListener("favoritesUpdate", syncFromCache);
  }, []);

  if (favorites.length === 0) {
    return (
      <motion.div
        key="favorites-empty"
        variants={viewportVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center h-[450px] text-center space-y-6"
      >
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner animate-wiggle">
          <Heart size={42} className="text-slate-300 dark:text-slate-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "قائمتك المفضلة فارغة" : "Your Favorites List is Empty"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm font-semibold">
            {isAr
              ? "ابدأ بتصفح المساكن الطلابية واضغط على رمز القلب لحفظ خياراتك المفضلة هنا."
              : "Start browsing student dorms and tap the heart icon to save your preferred listings here."
            }
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/student")}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
        >
          {isAr ? "تصفح المساكن الآن" : "Browse Dorms Now"}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="favorites"
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* هيدر الصفحة (Header) */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <Heart size={24} className="fill-rose-500 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "السكنات المفضلة" : "My Favorite Dorms"}
          </h2>
          <p className="text-slate-500 text-sm font-bold">
            {isAr
              ? `لديك ${favorites.length} مسكن محفوظ في المفضلة`
              : `You have ${favorites.length} saved properties`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {favorites.filter(Boolean).map((property) => (
          <PropertyCard key={property.id || property} property={property} />
        ))}
      </div>
    </motion.div>
  );
}
