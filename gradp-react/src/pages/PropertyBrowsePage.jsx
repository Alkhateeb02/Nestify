/* 
 * صفحة تصفح السكنات للطلاب (PropertyBrowsePage).
 */
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropertyFilters from "../components/property/PropertyFilters";
import PropertyGrid from "../components/property/PropertyGrid";
import { Sparkles, House } from "lucide-react";
import InnerNavbar from "../components/layout/InnerNavbar";
import { Button } from "../components/ui/Button";
import Footer from "../components/layout/Footer";
import api from "../utils/api";

// المكونات اللي فصلناها لملفات خارجية
import { PageBackground } from "../components/ui/BackgroundDecorations";
import FloatingShapes from "../components/ui/FloatingShapes";
import { AnimatedCount } from "../components/ui/AnimatedStats";
import PropertyStats from "../components/property/PropertyStats";

export default function PropertyBrowsePage() {
  const { t } = useTranslation();

  // ── الحالات (States) الخاصة بالبيانات والتحميل ──
  const [dbProperties, setDbProperties] = useState([]); // السكنات القادمة من قاعدة البيانات
  const [loading, setLoading] = useState(true);          // حالة التحميل (Loading)

  // ── حالات الفلترة والبحث (Filters & Search) ──
  const [search, setSearch] = useState("");              // نص البحث الحالي
  const [debouncedSearch, setDebounced] = useState("");  // البحث بعد التأخير (Debounce) لتحسين الأداء
  const [typeFilter, setTypeFilter] = useState("all");   // نوع السكن (شقة، ستوديو، إلخ)
  const [genderFilter, setGenderFilter] = useState("all"); // نوع الطلاب (ذكور، إناث، مختلط)
  const [priceFilter, setPriceFilter] = useState("all");   // نطاق السعر
  const [sortBy, setSortBy] = useState("newest");        // طريقة الترتيب

  // ── جلب البيانات من السيرفر عند فتح الصفحة ──
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // قراءة جنس الطالب المسجل لتمرير فلتر الجنس للسيرفر
        const userStr = localStorage.getItem("user");
        const userObj = userStr ? JSON.parse(userStr) : null;
        const rawGender = userObj?.gender || "";
        // Normalize to "Male" | "Female" (handles "male", "Male", "female", "Female", etc.)
        const userGender = rawGender
          ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
          : null;

        const endpoint = userGender
          ? `/properties?userGender=${encodeURIComponent(userGender)}`
          : "/properties";

        const res = await api.get(endpoint);
        if (res.success && res.data) {
          setDbProperties(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
    window.scrollTo({ top: 0, behavior: "smooth" }); // العودة لأعلى الصفحة
  }, []);

  // ── منطق تأخير البحث (Search Debouncing) ──
  // يمنع إعادة الفلترة مع كل حرف يكتبه المستخدم (يوفر أداء أفضل)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // ── دمج السكنات الثابتة مع سكنات قاعدة البيانات (Merging Data) ──
  const allProperties = useMemo(() => {
    const mappedDb = dbProperties.map(p => {
      const featuresObj = {};
      if (Array.isArray(p.features)) {
        p.features.forEach(feat => { featuresObj[feat] = true; });
      } else if (typeof p.features === 'object') {
        Object.assign(featuresObj, p.features);
      }

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
        // التحقق من حالة التوفر (Available/Rented)
        // بنفحص أكثر من مسمى للحقل لضمان التوافق مع الباك إند
        available: p.units && p.units.length > 0 
          ? p.units.some(u => u.availability_status === 'available') 
          : (p.available !== undefined ? p.available : (p.is_available !== undefined ? p.is_available : true)),
        listingType: p.listing_type || p.type || "Solo",
        features: featuresObj,
        ownerName: p.owner?.fullName || p.owner_name || "Landlord"
      };
    });
    const combined = mappedDb;
    // إخفاء سكن "maan dorm" نهائياً من العرض
    return combined.filter(p => p.title?.toLowerCase().trim() !== "maan dorm");
  }, [dbProperties]);

  const filteredProperties = useMemo(() => {
    let r = allProperties.filter(p => {
      const q = debouncedSearch.toLowerCase();
      const ms = p.title.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q));
      const mt = typeFilter === "all" || p.type === typeFilter;
      const mg = genderFilter === "all" || p.gender === genderFilter;
      const mp =
        priceFilter === "all" ||
        (priceFilter === "under100" && p.price < 100) ||
        (priceFilter === "100to150" && p.price >= 100 && p.price <= 150) ||
        (priceFilter === "above150" && p.price > 150);
      return ms && mt && mg && mp;
    });
    if (sortBy === "price-low") r = [...r].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") r = [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [allProperties, debouncedSearch, typeFilter, genderFilter, priceFilter, sortBy]);

  function clearFilters() {
    setSearch(""); setTypeFilter("all");
    setGenderFilter("all"); setPriceFilter("all"); setSortBy("newest");
  }

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden font-sans bg-white dark:bg-[#070b14] transition-colors duration-500">

      <PageBackground />
      <FloatingShapes />
      <InnerNavbar />

      {/* ───── القسم الرئيسي (Hero Section) ───── */}
      <section className="relative z-10 pt-32 pb-4 px-4 sm:px-8 max-w-[1400px] mx-auto text-center">

        {/* شارة تجميلية (Badge) */}
        <div className="flex justify-center mb-5 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#004A8D]/20 dark:border-blue-500/30 bg-[#004A8D]/5 dark:bg-blue-500/10 px-5 py-2">
            <Sparkles size={13} className="text-[#004A8D] dark:text-lime-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#004A8D] dark:text-lime-400">
              {t('property_details.listings.badge')}
            </span>
          </div>
        </div>

        {/* العنوان الضخم */}
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
            {t('property_details.listings.title_main')}
            <br />
            <span className="animate-shimmer-x bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #004A8D 0%, #3b82f6 30%, #82BC00 55%, #004A8D 100%)", backgroundSize: "200% auto" }}>
              {t('property_details.listings.title_sub')}
            </span>
          </h1>
          <p className="mt-4 mx-auto max-w-lg text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {t('property_details.listings.verified_listings')}
          </p>
        </div>

        {/* شريط الإحصاء (المكون الجديد) */}
        <PropertyStats properties={allProperties} />
      </section>

      {/* ───── قسم الفلاتر وعرض العقارات ───── */}
      <section className="relative z-20 px-4 sm:px-8 max-w-[1400px] mx-auto pb-20">
        {/* مكون الفلاتر (Filters Component) */}
        <PropertyFilters
          search={search} setSearch={setSearch}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          genderFilter={genderFilter} setGenderFilter={setGenderFilter}
          priceFilter={priceFilter} setPriceFilter={setPriceFilter}
          sortBy={sortBy} setSortBy={setSortBy}
          clearFilters={clearFilters}
        />

        {/* تيتل + عداد */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-gradient-to-b from-[#004A8D] to-[#82BC00]" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('property_details.listings.available_homes')}
            </h2>
          </div>
          <AnimatedCount value={filteredProperties.length} label={t('property_details.listings.available_now')} />
        </div>

        {/* الجريد / Empty State */}
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl py-28 text-center animate-scale-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#004A8D]/10 to-[#82BC00]/10 mb-5">
              <House size={36} className="text-[#004A8D] dark:text-lime-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('property_details.listings.no_results')}</h3>
            <Button onClick={clearFilters} className="mt-6 !bg-[#004A8D] hover:!bg-blue-900 dark:!bg-lime-500 dark:!text-slate-900 !rounded-2xl !px-8">
              {t('property_details.listings.reset_filters')}
            </Button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <PropertyGrid properties={filteredProperties} clearFilters={clearFilters} />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
