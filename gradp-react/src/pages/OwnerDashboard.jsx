/*
 *  هاي هي الصفحة الرئيسية للمالك وفيها 3 أقسام أساسية
 *    dashboard (لوحة التحكم)  مشان يشوف نظرة عامة ويضيف أو يعدل عقاراته.
 *    bookings (الحجوزات)  هون بيقدر يشوف الطلبات اللي واصلته من الطلاب ويوافق أو يرفض.
 *    settings (الإعدادات) مشان يغير معلوماته الشخصية.
 */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import InnerNavbar from "../components/layout/InnerNavbar";
import {
  User, Phone, Lock, Mail, Plus, Pencil, X, MapPin,
  LayoutDashboard, Settings as SettingsIcon, LogOut, Building2,
  ChevronRight, CheckCircle2, AlertCircle, TrendingUp, Users2,
  ClipboardList, CreditCard, Banknote, Clock, ThumbsUp, ThumbsDown,
  DollarSign, Calendar, Search, Bell, Sparkles, MoreVertical, Trash2, Wrench
} from "lucide-react";
import {
  AVAILABLE_FEATURES,
  EMPTY_PROPERTY,
  fadeUp,
  stagger,
  scaleIn
} from "../data/ownerDashboardData";
import BookingForm from "../components/owner/BookingForm";
import SettingsForm from "../components/owner/SettingsForm";
import BookingRequests from "../components/owner/BookingRequests";
import OwnerSidebar from "../components/owner/OwnerSidebar";
import OwnerStats from "../components/owner/OwnerStats";
import PropertyList from "../components/owner/PropertyList";
import DashboardHeader from "../components/owner/DashboardHeader";
import MaintenanceRequests from "../components/owner/MaintenanceRequests";
import LandlordFinancialsView from "../components/owner/LandlordFinancialsView";



export default function OwnerDashboard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // ── حالات التحكم في الواجهة (UI Controls) ──
  const [activeTab, setActiveTab] = useState("dashboard"); // التاب الحالي (لوحة تحكم، حجوزات، إعدادات)
  const [showForm, setShowForm] = useState(false);       // إظهار أو إخفاء نموذج إضافة/تعديل عقار
  const [editingIdx, setEditingIdx] = useState(null);    // رقم العقار الذي يتم تعديله (إذا وجد)
  const [sidebarOpen, setSidebarOpen] = useState(false); // حالة القائمة الجانبية (للجوال)

  // ── جلب بيانات المستخدم والخصائص ──
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // تخزين معلومات المالك وتحديثها
  const [ownerInfo, setOwnerInfo] = useState({
    name: currentUser?.name || (isAr ? "ساره المالك" : "Sara Owner"),
    phone: currentUser?.phone_number || "0791234567",
    gender: currentUser?.gender || "female",
    email: currentUser?.email || "[EMAIL_ADDRESS]",
    password: "password123",
    id: currentUser?.id || "1",
    bankName: currentUser?.bankName || "",
    bankAccountHolderName: currentUser?.bankAccountHolderName || ""
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      const uStr = localStorage.getItem("user");
      const u = uStr ? JSON.parse(uStr) : null;
      if (u) {
        setOwnerInfo(prev => ({
          ...prev,
          name: u.name || u.fullName || prev.name,
          phone: u.phone_number || u.phoneNumber || prev.phone,
          gender: u.gender || prev.gender,
          email: u.email || prev.email,
          bankName: u.bankName || prev.bankName,
          bankAccountHolderName: u.bankAccountHolderName || prev.bankAccountHolderName
        }));
      }
    };
    window.addEventListener("userUpdate", handleUserUpdate);
    return () => window.removeEventListener("userUpdate", handleUserUpdate);
  }, []);

  // مصفوفة لتخزين العقارات القادمة من السيرفر
  const [properties, setProperties] = useState([]);
  const [fetching, setFetching] = useState(true);

  // الحالة الخاصة بالبيانات التي يتم تعبئتها في الفورم حالياً
  const [propData, setPropData] = useState(EMPTY_PROPERTY);

  // ── جلب العقارات الخاصة بالمالك من السيرفر ──
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await api.get(`/properties?landlord_id=${currentUser?.id || ownerInfo.id}`); // طلب قائمة العقارات
        if (res.success && res.data) {
          setProperties(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProps();
  }, []);

  /* ───── شغل الفورم (إضافة وتعديل) ───── */
  // لما نكبس "إضافة عقار"، بنفضي الداتا وبنفتح الفورم
  const openAdd = () => { setPropData(EMPTY_PROPERTY); setEditingIdx(null); setShowForm(true); };
  // لما نكبس "تعديل"، بنجيب بيانات العقار اللي اخترناه وبنفتح الفورم
  const openEdit = (i) => {
    const prop = properties[i];
    let resolvedFeatures = [];
    if (prop.features) {
      if (Array.isArray(prop.features)) {
        resolvedFeatures = prop.features;
      } else if (typeof prop.features === "object") {
        resolvedFeatures = Object.keys(prop.features).filter(k => prop.features[k] === true);
      }
    }
    let resolvedRules = [];
    if (prop.rules) {
      if (Array.isArray(prop.rules)) {
        resolvedRules = prop.rules;
      } else if (typeof prop.rules === "object") {
        resolvedRules = Object.keys(prop.rules).filter(k => prop.rules[k] === true);
      }
    }
    setPropData({
      ...prop,
      features: resolvedFeatures,
      rules: resolvedRules
    });
    setEditingIdx(i);
    setShowForm(true);
  };
  // تسكير الفورم ورجوع كل شي لحالته الأصلية
  const closeForm = () => { setShowForm(false); setEditingIdx(null); };
  /* ───── منطق حفظ البيانات (Add / Edit Logic) ───── */
  const saveProp = async (e) => {
    e.preventDefault();

    // تحويل البيانات لشكل يفهمه السيرفر (Mapping)
    const payload = {
      title: propData.title,
      description: propData.description,
      price: Number(propData.price),
      address: propData.locationText || "TBD Address",
      type: propData.type || "Apartment",
      capacity: Number(propData.capacity) || 1,
      features: propData.features || [],
      properties_image: propData.properties_image || propData.propertiesImage || null,
      gender: propData.gender || "Mixed",
      images: propData.images || [],
      listingType: propData.listingType || "Solo",
      locationLink: propData.locationLink || "",
      rules: propData.rules || [],
      nearby: propData.nearby || { supermarkets: [], laundry: [], hospitals: [], gasStations: [] },
      area: propData.area !== undefined && propData.area !== null && propData.area !== "" ? Number(propData.area) : null,
      currency: propData.currency || "JOD",
      rentalPeriod: propData.rentalPeriod || "monthly"
    };

    try {
      if (editingIdx !== null && editingIdx !== undefined && properties[editingIdx]) {
        // تحديث عقار موجود فعلياً (Update)
        const propertyId = properties[editingIdx].property_id || properties[editingIdx].id;
        const res = await api.put(`/properties/${propertyId}`, payload);
        if (res.success) {
          const next = [...properties];
          next[editingIdx] = { ...propData, ...res.data };
          setProperties(next);
        }
      } else {
        // إضافة عقار جديد كلياً (Create)
        const res = await api.post("/properties", payload);
        if (res.success) {
          setProperties([{ ...propData, ...res.data }, ...properties]);
        }
      }
      closeForm(); // إغلاق النموذج بعد النجاح
    } catch (err) {
      console.error("Failed to save property:", err);
      let errMsg = isAr ? "فشل حفظ العقار. يرجى المحاولة مرة أخرى." : "Failed to save property. Please try again.";
      if (typeof err === 'object' && err.message) errMsg = err.message;
      alert(errMsg);
    }
  };

  const deleteProp = async (idx) => {
    const prop = properties[idx];
    if (!prop) return;
    const propertyId = prop.property_id || prop.id;

    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف "${prop.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to delete "${prop.title}"? This action cannot be undone.`;

    if (window.confirm(confirmMsg)) {
      try {
        const res = await api.delete(`/properties/${propertyId}`);
        if (res.success) {
          setProperties(properties.filter((_, i) => i !== idx));
        }
      } catch (err) {
        console.error("Failed to delete property:", err);
        alert(isAr ? "فشل حذف العقار." : "Failed to delete property.");
      }
    }
  };

  /*هاي عشان ما اضل اكرر كودات ستايلات جاهزه*/
  const underlineInput = `w-full ${isAr ? "pr-10 text-right" : "pl-10"} py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 outline-none text-sm transition-all duration-200 focus:border-blue-600 dark:focus:border-lime-400 text-slate-900 dark:text-white placeholder:text-slate-400`;
  const iconPos = `absolute ${isAr ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-lime-400`;
  const boxInput = `w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-lime-400/20 focus:border-blue-500 dark:focus:border-lime-400 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200`;
  // قائمة التنقل اللي بالجنب (Sidebar)
  const navItems = [
    { id: "dashboard", label: t("owner_dashboard.tab_dashboard"), icon: LayoutDashboard },
    { id: "bookings", label: t("owner_dashboard.tab_bookings"), icon: ClipboardList },
    { id: "maintenance", label: t("owner_dashboard.tab_maintenance"), icon: Wrench },
    { id: "financials", label: isAr ? "المالية والأرباح" : "Financials & Profits", icon: DollarSign },
    { id: "settings", label: t("owner_dashboard.tab_settings"), icon: SettingsIcon },
  ];

  // بنجيب طلبات الحجز من السيرفر
  const [bookingRequests, setBookingRequests] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my-bookings");
        if (res.success && res.data) {
          // Mapping backend bookings to match UI needs if necessary
          const mapped = res.data.map(b => ({
            ...b,
            id: b.booking_id || b.id,
            studentName: b.studentName || b.student?.user?.name || b.student?.user?.fullName || "Ahmad Student",
            studentPhone: b.studentPhone || b.student?.user?.phone_number || b.student?.user?.phoneNumber || "079...",
            propertyTitle: b.propertyTitle || b.unit?.property?.title || "Property",
            startDate: b.checkInDate || b.startDate,
            endDate: b.checkoutDate || b.endDate,
            payMethod: b.payment?.payment_method || b.payMethod || 'cash',
            status: (() => {
              const sLower = (b.status || "").toLowerCase();
              return (sLower === 'pending' || sLower === 'pending_approval')
                ? 'pending'
                : (sLower === 'confirmed' || sLower === 'approved')
                  ? 'approved'
                  : (sLower === 'rejected')
                    ? 'rejected'
                    : sLower;
            })()
          }));
          setBookingRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };
    fetchBookings();
  }, []);
  // دالة مشان المالك يقبل أو يرفض طلب حجز
  const handleBookingAction = async (idx, action) => {
    const req = bookingRequests[idx];
    const bookingId = req.id || req.booking_id;
    const backendStatus = action === "approve" ? "confirmed" : "rejected";

    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: backendStatus });
      if (res.success) {
        const updated = [...bookingRequests];
        updated[idx] = { ...req, status: action === "approve" ? "approved" : "rejected" };
        setBookingRequests(updated);
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
      alert(isAr ? "فشل تحديث حالة الحجز." : "Failed to update booking status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const activeTenantsCount = bookingRequests.filter(b => b.status === "approved" || b.status === "confirmed").length;

  /* ───── بطاقات الإحصائيات (الأرقام الكبيرة فوق) ───── */
  const stats = [
    { label: isAr ? "إجمالي العقارات" : "Total Properties", value: properties.length, icon: Building2, accent: "from-blue-600 to-indigo-600", trend: "+2" },
    { label: isAr ? "عقارات جديدة" : "New Listings", value: properties.length, icon: Sparkles, accent: "from-lime-500 to-emerald-500", trend: "This mo" },
    { label: isAr ? "مستأجرين حاليين" : "Current Tenants", value: activeTenantsCount, icon: Users2, accent: "from-violet-500 to-purple-600", trend: isAr ? `${activeTenantsCount} نشط` : `${activeTenantsCount} active` },
  ];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-white"
    >
      <InnerNavbar hideDashboard={true} />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto pt-20">

        {/* ══════════ القائمة الجانبية (Sidebar) ══════════ */}
        <OwnerSidebar
          ownerInfo={ownerInfo} navItems={navItems}
          activeTab={activeTab} setActiveTab={setActiveTab}
          isAr={isAr} t={t} handleLogout={handleLogout}
        />

        {/* ══════════ المحتوى الرئيسي (Main Content) ══════════ */}
        <main className="flex-1 p-6 lg:p-10 min-w-0 bg-slate-50 dark:bg-slate-950">
          <AnimatePresence mode="wait">

            {activeTab === "dashboard" && (
              <motion.div key="dashboard" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-8">

                {/* رأس الصفحة (العنوان وزر الإضافة) */}
                <DashboardHeader isAr={isAr} t={t} openAdd={openAdd} />

                {/* بطاقات الإحصائيات (نظرة سريعة) */}
                <OwnerStats stats={stats} />

                {/* نافذة منبثقة لإضافة/تعديل عقار (Overlay Form) */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                      <BookingForm
                        propData={propData} setPropData={setPropData} editingIdx={editingIdx}
                        onSave={saveProp} onClose={closeForm} isAr={isAr} t={t}
                        features={AVAILABLE_FEATURES}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* قائمة العقارات (الجدول الرئيسي) */}
                <PropertyList
                  properties={properties} isAr={isAr} t={t}
                  openEdit={openEdit} deleteProp={deleteProp}
                />

              </motion.div>
            )}

            {activeTab === "bookings" && (
              <BookingRequests
                bookingRequests={bookingRequests} handleBookingAction={handleBookingAction}
                isAr={isAr} t={t} fadeUp={fadeUp} stagger={stagger}
              />
            )}

            {activeTab === "maintenance" && (
              <MaintenanceRequests
                isAr={isAr} t={t} fadeUp={fadeUp} stagger={stagger}
              />
            )}

            {activeTab === "financials" && (
              <LandlordFinancialsView
                isAr={isAr}
                t={t}
                viewportVariants={fadeUp}
              />
            )}


            {activeTab === "settings" && (
              <SettingsForm
                ownerInfo={ownerInfo} setOwnerInfo={setOwnerInfo} underlineInput={underlineInput}
                iconPos={iconPos} t={t} isAr={isAr} fadeUp={fadeUp} stagger={stagger}
              />
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

