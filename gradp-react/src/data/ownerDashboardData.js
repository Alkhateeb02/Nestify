/**
 * ownerDashboardData.js
 * ─────────────────────────────────────────────────────────
 * بيانات ثابتة تُستخدم في لوحة تحكم المالك (OwnerDashboard).
 * الفائدة: فصل البيانات عن منطق الواجهة لتسهيل الصيانة.
 * ─────────────────────────────────────────────────────────
 */

import {
  AirVent, Car, WashingMachineIcon, Tv, Wifi, Dumbbell,
  BedDouble, CookingPot, ShowerHead, Droplets
} from "lucide-react";

/**
 * AVAILABLE_FEATURES
 * قائمة المميزات التي يمكن للمالك إضافتها لعقاره.
 * كل عنصر يحتوي على:
 *   key     → مفتاح فريد يُحفظ في قاعدة البيانات
 *   icon    → أيقونة lucide-react
 *   labelEn → الاسم بالإنجليزية
 *   labelAr → الاسم بالعربية
 */
export const AVAILABLE_FEATURES = [
  { key: "wifi",            icon: Wifi },
  { key: "ac",              icon: AirVent },
  { key: "furnished",       icon: BedDouble },
  { key: "kitchen",         icon: CookingPot },
  { key: "laundry",         icon: Droplets },
  { key: "parking",         icon: Car },
  { key: "washing_machine", icon: WashingMachineIcon },
  { key: "tv",              icon: Tv },
  { key: "gym",             icon: Dumbbell },
  { key: "privateBathroom", icon: ShowerHead },
];

/**
 * AVAILABLE_RULES
 * قواعد السكن اللي بيقدر المالك يفعّلها أو يلغيها.
 */
export const AVAILABLE_RULES = [
  "no_smoking",
  "guests_10pm",
  "quiet_hours",
  "no_pets",
  "no_parties",
];

/**
 * EMPTY_PROPERTY
 * القيم الافتراضية عند فتح فورم إضافة عقار جديد.
 */
export const EMPTY_PROPERTY = {
  title:        "",
  type:         "Apartment",
  listingType:  "Solo",
  capacity:     "",
  description:  "",
  price:        "",
  currency:     "JOD",
  gender:       "Male",
  rentalPeriod: "monthly",     // monthly | daily | seasonal
  area:         "",
  locationText: "",
  locationLink: "",
  images:       "",
  features:     [],
  rules:        ["no_smoking", "guests_10pm", "quiet_hours", "no_pets", "no_parties"],
  nearby: {
    supermarkets: [],
    laundry:      [],
    hospitals:    [],
    gasStations:  [],
  },
};

/**
 * DASHBOARD_ANIMATION_VARIANTS
 * متغيرات الحركة المُعاد استخدامها في framer-motion.
 */
export const fadeUp  = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } };
export const stagger = { show:   { transition: { staggerChildren: 0.09 } } };
export const scaleIn = { hidden: { opacity: 0, scale: 0.93 }, show: { opacity: 1, scale: 1 } };
