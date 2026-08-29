import React from "react";
import {
    Wifi, Car, Wind, Utensils, Tv,
    Coffee, Shield, Waves, Dumbbell,
    Zap, Thermometer, Briefcase,
    CheckCircle2, Home, ShowerHead,
    WashingMachine, Receipt, GraduationCap,
    Store, MapPin, Bus, Dog, Flame, User, Users
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PropertyFeatures({ features }) {
    const { t } = useTranslation();

    // خريطة لربط كل ميزة مع الأيقونة الخاصة بها ومفتاح الترجمة (مفاتيح مصغرة بالكامل)
    const iconMap = React.useMemo(() => ({
        wifi: { icon: Wifi, label: t("property_details.features.wifi") },
        parking: { icon: Car, label: t("property_details.features.parking") },
        ac: { icon: Wind, label: t("property_details.features.ac") },
        kitchen: { icon: Utensils, label: t("property_details.features.kitchen") },
        tv: { icon: Tv, label: t("property_details.features.tv") },
        furnished: { icon: Home, label: t("property_details.features.furnished") },
        laundry: { icon: Waves, label: t("property_details.features.laundry") },
        coffee: { icon: Coffee, label: t("property_details.features.coffee") },
        security: { icon: Shield, label: t("property_details.features.security") },
        gym: { icon: Dumbbell, label: t("property_details.features.gym") },
        workspace: { icon: Briefcase, label: t("property_details.features.workspace") },
        heating: { icon: Thermometer, label: t("property_details.features.heating") },
        electricity: { icon: Zap, label: t("property_details.features.electricity") },
        
        // ميزات مدعومة بالذكاء الاصطناعي
        privatebathroom: { icon: ShowerHead, label: t("property_details.features.privateBathroom") },
        washing_machine: { icon: WashingMachine, label: t("property_details.features.washing_machine") },
        utilities_included: { icon: Receipt, label: t("property_details.features.utilities_included") },
        near_uni: { icon: GraduationCap, label: t("property_details.features.near_uni") },
        near_services: { icon: Store, label: t("property_details.features.near_services") },
        near_center: { icon: MapPin, label: t("property_details.features.near_center") },
        near_connectors: { icon: Bus, label: t("property_details.features.near_connectors") },
        pets_allowed: { icon: Dog, label: t("property_details.features.pets_allowed") },
        smoking_allowed: { icon: Flame, label: t("property_details.features.smoking_allowed") },
        private_room: { icon: User, label: t("property_details.features.private_room") },
        shared_room: { icon: Users, label: t("property_details.features.shared_room") }
    }), [t]);

    const getFallbackIcon = (key) => {
        const k = key.toLowerCase();
        if (k.includes("bath") || k.includes("shower") || k.includes("toilet")) return ShowerHead;
        if (k.includes("wash") || k.includes("laundry") || k.includes("dry")) return WashingMachine;
        if (k.includes("uni") || k.includes("college") || k.includes("school")) return GraduationCap;
        if (k.includes("shop") || k.includes("store") || k.includes("market") || k.includes("service")) return Store;
        if (k.includes("bus") || k.includes("transport") || k.includes("transit") || k.includes("train")) return Bus;
        if (k.includes("pet") || k.includes("dog") || k.includes("cat") || k.includes("animal")) return Dog;
        if (k.includes("smoke") || k.includes("flame") || k.includes("fire")) return Flame;
        if (k.includes("bill") || k.includes("receipt") || k.includes("utilities") || k.includes("price")) return Receipt;
        if (k.includes("private") || k.includes("single") || k.includes("individual")) return User;
        if (k.includes("share") || k.includes("roommate") || k.includes("group") || k.includes("double")) return Users;
        return CheckCircle2;
    };

    const formatFeatureLabel = (key) => {
        // 1. محاولة جلب الترجمة من ملفات اللغة
        const camelCaseKey = key.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
        const translationKeys = [
            `property_details.features.${key}`,
            `property_details.features.${key.toLowerCase()}`,
            `property_details.features.${camelCaseKey}`
        ];
        for (const tKey of translationKeys) {
            const val = t(tKey);
            if (val && val !== tKey) {
                return val;
            }
        }

        // 2. معالجة النص وعرضه بشكل لائق بمسافات مناسبة
        let clean = key.replace(/_/g, " ");
        clean = clean.replace(/([A-Z])/g, " $1");
        return clean
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // تحويل مدخلات الميزات (features) إلى مصفوفة يمكن عرضها
    const featuresList = React.useMemo(() => {
        if (!features) return [];
        if (Array.isArray(features)) return features;
        // إذا كان كائناً Object، نأخذ فقط الميزات المفعلة (true)
        return Object.keys(features).filter(key => features[key] === true);
    }, [features]);

    if (featuresList.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 py-1">
            {featuresList.map((featureKey, index) => {
                const config = iconMap[featureKey.toLowerCase()];
                const Icon = config ? config.icon : getFallbackIcon(featureKey);
                const label = config ? config.label : formatFeatureLabel(featureKey);

                return (
                    <div key={index} className="flex items-center gap-2 border border-slate-300 dark:border-slate-800 rounded-full px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                        <Icon size={16} strokeWidth={2.5} className="text-blue-500 shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold tracking-tight">
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}