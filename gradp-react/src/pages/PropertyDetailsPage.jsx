/* 
 * صفحة تفاصيل العقار للطلاب (PropertyDetailsPage).
 * التصحيح النهائي للسلوك: Sidebar (Sticky - يلحق السكرول) و Rules (Fixed - ثابتة في مكانها).
 * ملاحظة: تم إزالة items-start لتمكين السايد بار من الحركة على طول العمود الجانبي.
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InnerNavbar from "../components/layout/InnerNavbar";
import {
    MapPin, Star, UserCircle2, ShieldCheck, Share, Heart,
    Award, ArrowLeft, Bed, Users, Sparkles, CheckCircle2,
    Maximize, Shield, Info, Map as MapIcon, ClipboardList,
    ShieldAlert, Headphones, Phone, MessageSquare
} from "lucide-react";
import PropertySidebar from "../components/property/PropertySidebar";
import SimilarProperties from "../components/property/SimilarProperties";
import PropertyMap from "../components/property/PropertyMap";
import NearbyPlaces from "../components/property/NearbyPlaces";
import PropertyFeatures from "../components/property/PropertyFeatures";
import PropertyRules from "../components/property/PropertyRules";
import PropertyGallery from "../components/property/PropertyGallery";
import api from "../utils/api";

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [genderBlocked, setGenderBlocked] = useState(false);
    const isLoggedIn = !!localStorage.getItem("token");

    // استخراج جنس الطالب المسجل من الذاكرة المحلية
    const currentUserGender = (() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        try {
            const u = JSON.parse(userStr);
            const g = u?.gender || "";
            return g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : null;
        } catch { return null; }
    })();

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/properties/${id}`);
                if (res.success && res.data) {
                    const p = res.data;
                        const resolvedPrice = (p.price !== undefined && p.price !== null && !isNaN(Number(p.price)))
                            ? Number(p.price)
                            : (p.units && p.units.length > 0 ? Number(p.units[0].price) : 0);
                        const resolvedImage = p.propertiesImage || p.properties_image || p.image || null;
                        const resolvedGender = p.gender || p.aiTags?.gender || p.ai_tags?.gender || "Mixed";
                        const resolvedCapacity = p.capacity || p.aiTags?.capacity || p.ai_tags?.capacity || 1;

                        const mapped = {
                            ...p,
                            id: p.property_id?.toString() || p.id,
                            title: p.title,
                            location: p.address,
                            price: resolvedPrice,
                            type: p.type,
                            gender: resolvedGender,
                            capacity: resolvedCapacity,
                            rating: p.rating || 4.5,
                            image: resolvedImage,
                            features: p.features || [],
                            description: p.description || "",
                            nearby: p.nearby || {},
                            available: p.units && p.units.length > 0 ? p.units.some(u => u.availability_status === 'available') : (p.available !== undefined ? p.available : true),
                            images: p.images || [],
                            listingType: p.listingType || p.type || "Solo",
                            area: p.area || p.sqft || p.aiTags?.area || p.ai_tags?.area || null,
                            currency: p.currency || p.aiTags?.currency || p.ai_tags?.currency || "JOD",
                            rentalPeriod: p.rentalPeriod || p.aiTags?.rentalPeriod || p.ai_tags?.rentalPeriod || "monthly",
                            rules: p.rules || p.aiTags?.rules || p.ai_tags?.rules || []
                        };
                        // فحص تطابق الجنس بعد تحديد خصائص العقار
                        // إذا كان الطالب ذكراً ومبنى السكن مخصص للإناث (أو العكس) → حجب الوصول
                        if (currentUserGender && mapped.gender && mapped.gender !== 'Mixed' && mapped.gender !== 'Any') {
                            if (mapped.gender !== currentUserGender) {
                                setGenderBlocked(true);
                            }
                        }
                        if (isLoggedIn) {
                            try {
                                const resFav = await api.get("/favorites");
                                if (resFav.success && resFav.data) {
                                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                                    const userId = user.id || user.user_id;
                                    if (userId) {
                                        localStorage.setItem(`favorites_${userId}`, JSON.stringify(resFav.data));
                                    }
                                    const isFav = resFav.data.some(fav => (fav.id?.toString() === mapped.id?.toString()) || (fav?.toString() === mapped.id?.toString()));
                                    setIsFavorite(isFav);
                                }
                            } catch (err) {
                                console.error("Failed to check favorite status:", err);
                            }
                        }
                        setProperty(mapped);
                    }
                } catch (err) {
                    console.error("Failed to fetch property details:", err);
                } finally {
                    setLoading(false);
                }
        };

        fetchProperty();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    <p className="font-bold">{t('common.loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    // ── حالة عدم وجود العقار (Error State) ──
    if (!property) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-2xl font-black">{t('property_details.not_found', 'Property Not Found')}</h2>
                    {/* زر العودة للرئيسية */}
                    <button onClick={() => navigate("/student")} className="underline font-bold">← Back</button>
                </div>
            </div>
        );
    }

    // ── شاشة الحجب (Gender Restricted) ──
    if (genderBlocked) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center space-y-6 px-6 max-w-md">
                    <div className="mx-auto h-20 w-20 rounded-3xl flex items-center justify-center text-4xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700">
                        🚫
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                        {t('property_details.gender_restricted_title', 'Access Restricted')}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t('property_details.gender_restricted_msg', 'This dorm is not available for your gender. Please browse listings that match your profile.')}
                    </p>
                    <button
                        onClick={() => navigate("/student")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 dark:bg-lime-500 text-white dark:text-slate-900 font-black px-8 py-3 hover:opacity-90 transition-opacity"
                    >
                        ← {t('property_details.back_to_listings', 'Back to Listings')}
                    </button>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
        const nextVal = !isFavorite;
        setIsFavorite(nextVal);

        try {
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
                window.dispatchEvent(new Event("favoritesUpdate"));
            }
        } catch (err) {
            console.error("Failed to toggle favorite:", err);
            setIsFavorite(!nextVal); // Revert state
        }
    };

    const displayGender = property.gender === "Female"
        ? t("property_details.stats.female_only")
        : property.gender === "Male"
            ? t("property_details.stats.male_only")
            : t("property_details.stats.any_gender");

    const statsList = [
        { icon: Bed, label: t("property_details.stats.occupancy"), value: property.listingType || property.type },
        { icon: Users, label: t("property_details.stats.capacity"), value: `${property.capacity || 1} ${t("owner_dashboard.beds")}` },
        { icon: Heart, label: t("property_details.stats.target"), value: displayGender },
        { icon: Maximize, label: t("property_details.stats.area"), value: `${property.area || property.sqft || 120} m²` },
    ];

    return (
        <section className="relative min-h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 text-slate-900 dark:text-white">
            <InnerNavbar hideDashboard={false} />

            <div className="relative pt-28 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. رأس الصفحة (Header): يحتوي على العنوان والموقع والتقييم */}
                <div className="mb-8 space-y-4">
                    {/* زر الرجوع */}
                    <button
                        onClick={() => navigate("/student")}
                        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft size={16} /> {t("property_details.back_to_listings")}
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                                {property.title}
                            </h1>
                            {/* معلومات الموقع والتقييم */}
                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                                <span className="flex items-center gap-1.5 text-blue-600 dark:text-lime-400 text-base">
                                    <MapPin size={18} /> {property.location}
                                </span>
                                <span className="flex items-center gap-1.5 text-base text-slate-700 dark:text-slate-300">
                                    <Star size={18} className="fill-amber-500 text-amber-500" /> {property.rating}
                                </span>
                            </div>
                        </div>

                        {/* Save/Favorite button */}
                        {isLoggedIn && (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 font-black text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                            >
                                <Heart
                                    size={18}
                                    className={`transition-colors duration-300 ${
                                        isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"
                                    }`}
                                />
                                <span>{isFavorite ? (isAr ? "محفوظ في المفضلة" : "Saved in Favorites") : (isAr ? "حفظ في المفضلة" : "Save to Favorites")}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. معرض الصور (Gallery Section) */}
                <div className="mb-14">
                    <PropertyGallery property={property} />
                </div>

                {/* 3. MAIN CONTENT (Removing items-start is critical for stretching the track) */}
                <div className="grid lg:grid-cols-[1fr_400px] gap-16 relative">

                    {/* ── LEFT COLUMN ── */}
                    <div className="flex-1 min-w-0 space-y-20">

                        {/* Stats Strip */}
                        <div className="flex flex-wrap gap-10 py-6 border-b border-slate-100 dark:border-slate-800">
                            {statsList.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                                        <p className="text-base font-black leading-tight">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Host Info */}
                        <div className="flex items-center justify-between py-1 mt-[-55px]">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                                    <UserCircle2 size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black tracking-tight">
                                        {t("property_details.hosted_by", { name: property.landlord?.user?.name || property.landlord?.business_name || "Ahmad Al-Saad" })}
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <Phone size={10} className="text-blue-600" /> {property.landlord?.user?.phone_number || "+962 79 123 4567"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4 mt-[-30px]">
                            <h2 className="text-lg font-black flex items-center gap-3">
                                <Info size={22} className="text-blue-600" /> {t("property_details.about_this_place")}
                            </h2>
                            <p className="text-md leading-8 text-slate-600 dark:text-slate-300 font-medium max-w-4xl">
                                {property.description}
                            </p>
                        </div>

                        {/* Amenities Section */}
                        <div className="space-y-5 pt-3 mt-[-30px]">
                            <h2 className="text-lg font-black flex items-center gap-3">
                                <Sparkles size={22} className="text-amber-500" /> {t("property_details.amenities")}
                            </h2>
                            <PropertyFeatures features={property.features} />
                        </div>

                        {/* Nearby Places */}
                        <div className="space-y-8 pt-5 mt-[-30px] border-t border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-black flex items-center gap-3">
                                <MapPin size={22} className="text-emerald-500" /> {t("property_details.nearby_places")}
                            </h2>
                            <NearbyPlaces nearby={property.nearby} />
                        </div>

                        {/* Location Map */}
                        <div className="space-y-10 pt-16 border-t border-slate-100 dark:border-slate-800 pb-20">
                            <h2 className="text-lg font-black flex items-center gap-3">
                                <MapIcon size={22} className="text-blue-600" /> {t("property_details.location")}
                            </h2>
                            <PropertyMap locationName={property.location} />
                        </div>
                    </div>

                    {/* ── العمود الأيمن (Right Column): يحتوي على القوانين وشريط الحجز ── */}
                    <div className="w-full space-y-10 pb-20">
                        {/* القوانين (House Rules) */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <ClipboardList size={22} className="text-blue-600" /> {t("property_details.house_rules")}
                            </h2>
                            <PropertyRules rules={property.rules} />
                        </div>

                        {/* شريط الحجز الجانبي (Booking Sidebar) - يتحرك مع السكرول */}
                        <div className="sticky top-28 h-fit z-30 shadow-2xl shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
                            <PropertySidebar property={property} />
                        </div>
                    </div>

                </div>

                {/* Similar Properties */}
                <div className="mt-2 pt-10 ">
                    <SimilarProperties currentProperty={property} />
                </div>

            </div>
        </section>
    );
}