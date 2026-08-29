import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CompactPropertyCard from "./CompactPropertyCard";
import { Sparkles } from "lucide-react";
import api from "../../utils/api";

export default function SimilarProperties({ currentProperty }) {
  const { t } = useTranslation();
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await api.get("/properties");
        if (res.success && res.data) {
          const mappedDb = res.data.map(p => {
            const getDisplayPrice = () => {
              if (p.price !== undefined && p.price !== null && !isNaN(Number(p.price))) {
                return Number(p.price);
              }
              if (p.units && p.units.length > 0) {
                return Number(p.units[0].price);
              }
              return 0;
            };

            const resolvedGender = p.gender || p.aiTags?.gender || p.ai_tags?.gender || "Mixed";
            const resolvedCapacity = p.capacity || p.aiTags?.capacity || p.ai_tags?.capacity || 1;
            const resolvedImage = p.propertiesImage || p.properties_image || p.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";

            return {
              ...p,
              id: p.property_id?.toString() || p.id,
              title: p.title || "No Title",
              location: p.address || "No Address",
              price: getDisplayPrice(),
              currency: p.currency || "JOD",
              type: p.type || "Apartment",
              gender: resolvedGender,
              capacity: resolvedCapacity,
              rating: p.rating || 4.5,
              image: resolvedImage,
              available: p.available !== undefined ? p.available : (p.is_available !== undefined ? p.is_available : true),
              listingType: p.listing_type || p.type || "Solo",
              ownerName: p.owner?.fullName || p.owner_name || "Landlord"
            };
          });

          const filtered = mappedDb.filter(
            (p) =>
              p.id !== currentProperty.id?.toString() &&
              p.gender === currentProperty.gender &&
              p.title?.toLowerCase().trim() !== "maan dorm"
          ).slice(0, 3);

          setSimilar(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch similar properties:", err);
      }
    };

    if (currentProperty) {
      fetchSimilar();
    }
  }, [currentProperty]);

  if (similar.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">

      {/* عنوان القسم */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex bg-blue-50 p-2 rounded-xl dark:bg-lime-500/10 text-blue-800 dark:text-lime-500">
          <Sparkles size={20} />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          {t('property_details.listings.similar_properties')}
        </h3>
      </div>
      {/* عرض الكروت للمشابهين בـ (Grid) مريح ومصغر */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {similar.map((prop) => (
          <CompactPropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </div>
  );
}
