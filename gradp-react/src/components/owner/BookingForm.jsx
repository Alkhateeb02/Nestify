import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, CheckCircle2, DollarSign, FileText, ShoppingCart, Ban,
  Waves, HeartPulse, Fuel, Wifi, AirVent, BedDouble, CookingPot,
  Droplets, Car, WashingMachineIcon, Tv, Dumbbell, ShowerHead,
  Receipt, GraduationCap, Store, Map as MapIcon, Bus, Dog, Flame, User, Users, Lock
} from "lucide-react";
import { Button } from "../ui/Button";
import StepBasicInfo from "./forms/StepBasicInfo";
import StepPriceDetails from "./forms/StepPriceDetails";
import StepLocationPhotos from "./forms/StepLocationPhotos";
import StepFeatures from "./forms/StepFeatures";
import StepHouseRules from "./forms/StepHouseRules";
import StepNearbyPlaces from "./forms/StepNearbyPlaces";
import api from "../../utils/api";

const TAG_TO_FEATURE_MAP = {
  wifi: { key: "wifi", icon: Wifi, labelEn: "WiFi", labelAr: "واي فاي" },
  ac: { key: "ac", icon: AirVent, labelEn: "Air Conditioning", labelAr: "تكييف" },
  furnished: { key: "furnished", icon: BedDouble, labelEn: "Furnished", labelAr: "مفروش" },
  kitchen: { key: "kitchen", icon: CookingPot, labelEn: "Kitchen", labelAr: "مطبخ" },
  laundry: { key: "laundry", icon: Droplets, labelEn: "Laundry", labelAr: "غسيل ملابس" },
  parking: { key: "parking", icon: Car, labelEn: "Parking", labelAr: "موقف سيارات" },
  washing_machine: { key: "washing_machine", icon: WashingMachineIcon, labelEn: "Washing Machine", labelAr: "غسالة" },
  tv: { key: "tv", icon: Tv, labelEn: "TV", labelAr: "تلفزيون" },
  gym: { key: "gym", icon: Dumbbell, labelEn: "Gym", labelAr: "صالة رياضية" },
  privateBathroom: { key: "privateBathroom", icon: ShowerHead, labelEn: "Private Bathroom", labelAr: "حمام خاص" },
  utilities_included: { key: "utilities_included", icon: Receipt, labelEn: "Utilities Included", labelAr: "شامل الخدمات" },
  near_uni: { key: "near_uni", icon: GraduationCap, labelEn: "Near University", labelAr: "قريب من الجامعة" },
  near_services: { key: "near_services", icon: Store, labelEn: "Near Services", labelAr: "قريب من الخدمات" },
  near_center: { key: "near_center", icon: MapIcon, labelEn: "Near City Center", labelAr: "قريب من وسط البلد" },
  near_connectors: { key: "near_connectors", icon: Bus, labelEn: "Near Transport", labelAr: "قريب من المواصلات" },
  pets_allowed: { key: "pets_allowed", icon: Dog, labelEn: "Pets Allowed", labelAr: "مسموح بالحيوانات الأليفة" },
  smoking_allowed: { key: "smoking_allowed", icon: Flame, labelEn: "Smoking Allowed", labelAr: "مسموح بالتدخين" },
  private_room: { key: "private_room", icon: User, labelEn: "Private Room", labelAr: "غرفة خاصة" },
  shared_room: { key: "shared_room", icon: Users, labelEn: "Shared Room", labelAr: "غرفة مشتركة" },
  security: { key: "security", icon: Lock, labelEn: "Security", labelAr: "حراسة وأمن" },
};

export default function BookingForm({
  propData,      // بيانات السكن الحالية
  setPropData,   // تحديث بيانات السكن
  editingIdx,    // رقم السكن بحال التعديل
  onSave,        // حفظ الفورم
  onClose,       // إغلاق الفورم
  isAr,          // فحص لغة العرض
  t,             // دالة الترجمة
  features       // قائمة المميزات المتاحة
}) {
  // تتبع رقم الخطوة الحالية
  const [currentStep, setCurrentStep] = useState(0);
  const [suggesting, setSuggesting] = useState(false);

  // منطق توليد التاغات ذكياً
  const [fetchedDesc, setFetchedDesc] = useState("");
  const [activeFeatures, setActiveFeatures] = useState(features);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setActiveFeatures(features);
  }, [features]);

  useEffect(() => {
    // خطوة المميزات هي الخطوة 3 (الفهرس 3، الخطوة الرابعة)
    if (currentStep === 3 && propData.description?.trim()) {
      if (propData.description !== fetchedDesc) {
        const fetchAiTags = async () => {
          setAiLoading(true);
          try {
            const response = await api.post("/ai/tag-property", {
              propertyDetails: {
                title: propData.title || "",
                description: propData.description
              }
            });
            if (response.success && response.data) {
              const rawTags = response.data;
              const generated = [];
              rawTags.forEach(tagKey => {
                if (TAG_TO_FEATURE_MAP[tagKey]) {
                  generated.push(TAG_TO_FEATURE_MAP[tagKey]);
                }
              });

              if (generated.length >= 3) {
                // إذا كان عدد التاغات المولدة 3 أو أكثر، نعرضها هي فقط
                setActiveFeatures(generated);
              } else {
                // إذا أقل من 3، نعرض التاغات القديمة (الافتراضية)
                setActiveFeatures(features);
              }
              setFetchedDesc(propData.description);
            } else {
              setActiveFeatures(features);
            }
          } catch (err) {
            console.error("Auto AI Tagging failed:", err);
            setActiveFeatures(features);
          } finally {
            setAiLoading(false);
          }
        };
        fetchAiTags();
      }
    }
  }, [currentStep, propData.description, features, fetchedDesc]);

  const handleAiSuggestTags = async () => {
    if (!propData.description?.trim()) return;
    setSuggesting(true);
    try {
      const response = await api.post("/ai/tag-property", {
        propertyDetails: {
          title: propData.title || "",
          description: propData.description
        }
      });
      if (response.success && response.data) {
        const rawTags = response.data;
        const mapper = {
          "wifi": "wifi", "internet": "wifi", "wi-fi": "wifi",
          "ac": "ac", "air conditioning": "ac", "air conditioning/heating": "ac", "cooling": "ac",
          "furnished": "furnished", "bed": "furnished", "furniture": "furnished",
          "kitchen": "kitchen", "cooking": "kitchen", "fridge": "kitchen", "refrigerator": "kitchen",
          "laundry": "laundry", "dryer": "laundry",
          "parking": "parking", "car": "parking", "garage": "parking",
          "washing machine": "washing_machine", "washer": "washing_machine", "washing_machine": "washing_machine",
          "tv": "tv", "television": "tv", "screen": "tv",
          "gym": "gym", "dumbbell": "gym", "workout": "gym",
          "private bathroom": "privateBathroom", "shower": "privateBathroom", "bathroom": "privateBathroom", "privatebathroom": "privateBathroom"
        };
        
        const extractedKeys = new Set();
        rawTags.forEach(t => {
          const norm = t.toLowerCase().trim();
          if (mapper[norm]) {
            extractedKeys.add(mapper[norm]);
          }
          if (["wifi", "ac", "furnished", "kitchen", "laundry", "parking", "washing_machine", "tv", "gym", "privateBathroom"].includes(norm)) {
            extractedKeys.add(norm);
          }
        });

        const mergedFeatures = Array.from(new Set([...propData.features, ...extractedKeys]));
        setPropData(p => ({
          ...p,
          features: mergedFeatures
        }));
        
        alert(
          isAr
            ? `تم استخراج المميزات ذكياً بنجاح! تم تحديد: ${mergedFeatures.map(k => t(`features.${k}`)).join("، ")}`
            : `AI Auto-Tagging Success! Features auto-selected: ${mergedFeatures.join(", ")}`
        );
      }
    } catch (err) {
      console.error("AI Suggestion failed:", err);
      alert(isAr ? "فشل استدعاء ميزة الذكاء الاصطناعي." : "Failed to trigger AI auto-tagging.");
    } finally {
      setSuggesting(false);
    }
  };

  // ستايل موحد للحقول
  const boxInput = `w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200`;
  // ستايل موحد للعناوين
  const labelCls = "block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest";
  // دوال التنقل بين الخطوات
  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(prev => Math.min(prev + 1, sections.length - 1));
  };
  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // دوال لإضافة أو إزالة المميزات والقواعد بشكل آمن
  const toggleFeature = (key) =>
    setPropData(p => {
      let currentFeatures = [];
      if (Array.isArray(p.features)) {
        currentFeatures = p.features;
      } else if (p.features && typeof p.features === 'object') {
        currentFeatures = Object.keys(p.features).filter(k => p.features[k] === true);
      }
      return {
        ...p,
        features: currentFeatures.includes(key)
          ? currentFeatures.filter(f => f !== key)
          : [...currentFeatures, key],
      };
    });

  const toggleRule = (key) =>
    setPropData(p => {
      let currentRules = [];
      if (Array.isArray(p.rules)) {
        currentRules = p.rules;
      } else if (p.rules && typeof p.rules === 'object') {
        currentRules = Object.keys(p.rules).filter(k => p.rules[k] === true);
      }
      return {
        ...p,
        rules: currentRules.includes(key)
          ? currentRules.filter(r => r !== key)
          : [...currentRules, key],
      };
    });

  // دوال لإدارة وتعديل الأماكن القريبة
  const addNearbyPlace = (category) => {
    const nearby = { ...(propData.nearby || {}) };
    if (!nearby[category]) nearby[category] = [];
    nearby[category] = [...nearby[category], { name: "", distance: "" }];
    setPropData({ ...propData, nearby });
  };

  const updateNearbyPlace = (category, idx, field, value) => {
    const nearby = { ...(propData.nearby || {}) };
    nearby[category] = nearby[category].map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setPropData({ ...propData, nearby });
  };

  const removeNearbyPlace = (category, idx) => {
    const nearby = { ...(propData.nearby || {}) };
    nearby[category] = nearby[category].filter((_, i) => i !== idx);
    setPropData({ ...propData, nearby });
  };

  // تعريف أقسام الفورم والأيقونات
  const sections = [
    { title: t("owner_dashboard.step_basic"), icon: FileText },
    { title: t("owner_dashboard.step_price"), icon: DollarSign },
    { title: t("owner_dashboard.step_location"), icon: MapPin },
    { title: t("owner_dashboard.step_features"), icon: CheckCircle2 },
    { title: t("owner_dashboard.step_rules"), icon: Ban },
    { title: t("owner_dashboard.step_nearby"), icon: ShoppingCart },
  ];

  const nearbyCategories = [
    { key: "supermarkets", label: t("owner_dashboard.cat_supermarkets"), icon: ShoppingCart, color: "text-emerald-500" },
    { key: "laundry", label: t("owner_dashboard.cat_laundry"), icon: Waves, color: "text-blue-500" },
    { key: "hospitals", label: t("owner_dashboard.cat_hospitals"), icon: HeartPulse, color: "text-rose-500" },
    { key: "gasStations", label: t("owner_dashboard.cat_gas"), icon: Fuel, color: "text-amber-500" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden max-w-5xl mx-auto">
      {/* ترويسة الفورم (العنوان وزر الإلغاء) */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h3 className="font-black text-xl tracking-tight">
            {(editingIdx !== null && editingIdx !== undefined) ? t("owner_dashboard.edit_property") : t("owner_dashboard.add_title")}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {t("owner_dashboard.add_desc")}
          </p>
        </div>
        <Button onClick={onClose} variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all font-bold">
          {t("owner_dashboard.cancel")}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* القائمة الجانبية اللي بتعرض الخطوات ومكاننا الحالي فيها */}
        <div className="hidden lg:flex w-72 bg-slate-50 dark:bg-slate-800/20 p-8 flex-col gap-6 border-e border-slate-100 dark:border-slate-800">
          {sections.map(({ title, icon: Icon }, idx) => {
            const isActive = currentStep === idx;
            const isDone = currentStep > idx;
            return (
              <div key={idx} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl grid place-items-center transition-all duration-300 ${isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110"
                  : isDone ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}>
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                    {t("owner_dashboard.step_word")} {idx + 1}
                  </p>
                  <p className={`text-sm font-bold truncate ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                    {title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 p-8">
          <form onSubmit={(e) => { e.preventDefault(); onSave(e); }} className="h-full flex flex-col">
            {/* المحتوى الرئيسي للخطوة الحالية (الفورم نفسه) */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <StepBasicInfo
                    propData={propData}
                    setPropData={setPropData}
                    boxInput={boxInput}
                    labelCls={labelCls}
                    t={t}
                    isAr={isAr}
                    suggesting={suggesting}
                    onAiSuggest={handleAiSuggestTags}
                  />
                )}
                {currentStep === 1 && <StepPriceDetails propData={propData} setPropData={setPropData} boxInput={boxInput} labelCls={labelCls} t={t} isAr={isAr} />}
                {currentStep === 2 && <StepLocationPhotos propData={propData} setPropData={setPropData} boxInput={boxInput} labelCls={labelCls} t={t} isAr={isAr} />}
                {currentStep === 3 && <StepFeatures propData={propData} toggleFeature={toggleFeature} features={activeFeatures} t={t} isAr={isAr} isLoading={aiLoading} />}
                {currentStep === 4 && <StepHouseRules propData={propData} toggleRule={toggleRule} t={t} isAr={isAr} />}
                {currentStep === 5 && <StepNearbyPlaces propData={propData} nearbyCategories={nearbyCategories} addNearbyPlace={addNearbyPlace} updateNearbyPlace={updateNearbyPlace} removeNearbyPlace={removeNearbyPlace} boxInput={boxInput} t={t} isAr={isAr} />}
              </AnimatePresence>
            </div>

            {/* أزرار التنقل (التالي، السابق، والحفظ) */}
            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button type="button" onClick={prevStep} disabled={currentStep === 0} variant="outline" className="!rounded-xl !px-8 !py-3 font-bold disabled:opacity-30 transition-opacity">
                {t("owner_dashboard.btn_back")}
              </Button>

              {currentStep < sections.length - 1 ? (
                <Button type="button" onClick={nextStep} className="!rounded-xl !px-10 !py-3 !bg-blue-600 !text-white font-black shadow-lg shadow-blue-500/20 border-none">
                  {t("owner_dashboard.btn_next")}
                </Button>
              ) : (
                <Button type="button" onClick={(e) => { e.preventDefault(); onSave(e); }} className="!rounded-xl !px-10 !py-3 !bg-emerald-600 !text-white font-black shadow-lg shadow-emerald-500/20 border-none">
                  {(editingIdx !== null && editingIdx !== undefined) ? t("owner_dashboard.save_changes") : t("owner_dashboard.list_property")}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
