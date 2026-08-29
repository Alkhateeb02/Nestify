
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/Badge";
import { Grid2X2, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function PropertyGallery({ property }) {
    const { t } = useTranslation();

    // التأكد من وجود 5 صور على الأقل لملء الشبكة (بتكرار الصور إذا لزم الأمر)
    const baseImages = property.images && property.images.length > 0 ? property.images : [property.image];
    const displayImages = [...baseImages];
    while (displayImages.length < 5) {
        displayImages.push(baseImages[displayImages.length % baseImages.length]);
    }

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // إغلاق المعرض عند الضغط على Esc
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setLightboxOpen(false);
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
        };
        if (lightboxOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [lightboxOpen, currentIndex]);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const showNext = () => setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    const showPrev = () => setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

    return (
        <>
            {/* ── شبكة الصور (Airbnb Grid) ── */}
            <div className="relative h-[300px] md:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden group">
                <div className="grid grid-cols-4 grid-rows-2 h-full gap-2">
                    {/* الصورة الكبيرة */}
                    <div
                        className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(0)}
                    >
                        <img
                            src={displayImages[0]}
                            alt="Main Property"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />

                        {/* البادجات (حالة التوفر) */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                            <Badge className={`px-3 py-1.5 text-[10px] font-black uppercase shadow-lg ${property.available ? "bg-emerald-500 text-white border-none" : "bg-rose-500 text-white border-none"}`}>
                                {property.available ? t("property_details.gallery.available_now") : t("property_details.gallery.fully_rented")}
                            </Badge>
                        </div>
                    </div>

                    {/* الصور الجانبية */}
                    <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer" onClick={() => openLightbox(1)}>
                        <img src={displayImages[1]} alt="View 2" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer" onClick={() => openLightbox(2)}>
                        <img src={displayImages[2]} alt="View 3" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer" onClick={() => openLightbox(3)}>
                        <img src={displayImages[3]} alt="View 4" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer" onClick={() => openLightbox(4)}>
                        <img src={displayImages[4]} alt="View 5" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />
                    </div>
                </div>

                {/* زر عرض كل الصور */}
                <button
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-6 right-6 flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 text-sm font-black text-slate-900 dark:text-white shadow-lg border border-white/50 dark:border-slate-700/50 hover:scale-105 active:scale-95 transition-all z-20"
                >
                    <Grid2X2 size={16} />
                    {t("property_details.gallery.show_all")}
                </button>
            </div>

            {/* ── معرض ملء الشاشة (Lightbox) ── */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/98 backdrop-blur-xl cursor-pointer"
                        onClick={() => setLightboxOpen(false)}
                    >
                        {/* زر الإغلاق الضخم - دائماً في الأعلى واليمين */}
                        <div className="absolute top-10 right-10 z-[1000000]">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setLightboxOpen(false);
                                }}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-600 text-4xl shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-90 transition-all cursor-pointer border-4 border-rose-500"
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* مؤشر الأرقام */}
                        <div className="absolute top-10 left-10 z-[1000000]">
                            <span className="bg-white/90 px-6 py-3 rounded-2xl text-black font-black text-lg tracking-widest shadow-xl">
                                {currentIndex + 1} / {displayImages.length}
                            </span>
                        </div>

                        {/* الصورة المعروضة */}
                        <div
                            className="relative w-full max-w-5xl h-full max-h-[70vh] flex items-center justify-center p-4 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                src={displayImages[currentIndex]}
                                alt={`Gallery ${currentIndex + 1}`}
                                className="max-w-full max-h-full object-contain drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] rounded-2xl border-2 border-white/10"
                            />
                        </div>

                        {/* أزرار التنقل - جعلها ضخمة وواضحة جداً */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                showPrev();
                            }}
                            className="absolute left-10 top-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-110 active:scale-95 transition-all z-[1000000]"
                        >
                            <ChevronLeft size={48} strokeWidth={3} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                showNext();
                            }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-110 active:scale-95 transition-all z-[1000000]"
                        >
                            <ChevronRight size={48} strokeWidth={3} />
                        </button>

                        {/* شريط الصور المصغرة */}
                        <div
                            className="absolute bottom-8 max-w-full px-8 flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar z-[100000] cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {displayImages.map((src, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    className={`relative shrink-0 overflow-hidden rounded-xl h-20 w-28 transition-all ${currentIndex === idx ? "ring-4 ring-white scale-110 opacity-100 shadow-2xl" : "opacity-40 hover:opacity-100"
                                        }`}
                                >
                                    <img src={src} alt="Thumb" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
}
