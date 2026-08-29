/* 
 * لوحة تحكم الطالب - النسخة المتطورة (Modular Workspace Edition)
 * تم تنظيم هذا الملف باستخدام المكونات الفرعية (Modular Components) لسهولة الصيانة.
 * المميزات الجديدة: تقييد الوصول حسب الحجز + الروم ميت + سجل الحجوزات
 */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import InnerNavbar from "../components/layout/InnerNavbar";
import { LayoutDashboard, Wrench, Users, ClipboardList, Settings, Lock, CreditCard, Heart } from "lucide-react";
import api from "../utils/api";
import Sidebar from "../components/student/dashboard/Sidebar";
import OverviewView from "../components/student/dashboard/OverviewView";
import MaintenanceView from "../components/student/dashboard/MaintenanceView";
import RoommateView from "../components/student/dashboard/RoommateView";
import HistoryView from "../components/student/dashboard/HistoryView";
import SettingsView from "../components/student/dashboard/SettingsView";
import BillingView from "../components/student/dashboard/BillingView";
import FavoritesView from "../components/student/dashboard/FavoritesView";
import { PageBackground } from "../components/ui/BackgroundDecorations";

const viewportVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

/* مكون رسالة "لم تحجز بعد" للأقسام المقيدة */
function LockedView({ isAr, viewportVariants }) {
  return (
    <motion.div key="locked" variants={viewportVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex flex-col items-center justify-center h-[450px] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
          <Lock size={42} className="text-slate-300 dark:text-slate-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "لم تحجز أي شيء بعد" : "You haven't reserved anything yet."}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
            {isAr
              ? "هذا القسم متاح فقط للطلاب الذين لديهم حجز نشط على المنصة."
              : "This section is only available to students with an active reservation on the platform."}
          </p>
        </div>
        <button
          onClick={() => window.location.href = "/student"}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
        >
          {isAr ? "تصفح الوحدات السكنية" : "Browse Properties"}
        </button>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  /* الحالة المسؤولة عن تحديد الواجهة المعروضة حالياً */
  const [activeView, setActiveView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [bookedProperty, setBookedProperty] = useState(null);

  /* جلب بيانات المستخدم من التخزين المحلي */
  const [userData, setUserData] = useState({ name: "Student", profileImage: "" });

  useEffect(() => {
    const fetchUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({ name: user.name || "Student", profileImage: user.profileImage || "" });
      }
    };
    fetchUser();
    /* بنسمع لأي تحديث بصير على بيانات المستخدم */
    window.addEventListener("userUpdate", fetchUser);
    return () => window.removeEventListener("userUpdate", fetchUser);
  }, []);

  const userName = userData.name;
  const profileImage = userData.profileImage;

  useEffect(() => {
    /* جلب بيانات الحجز والعقار المرتبط به */
    const fetchData = async () => {
      try {
        const res = await api.get("/bookings/my-bookings");
        if (res.success && res.data && res.data.length > 0) {
          const mappedList = res.data.map(b => ({
            ...b,
            status: (() => {
              const sLower = (b.status || "").toLowerCase();
              return (sLower === 'confirmed' || sLower === 'approved')
                ? 'approved'
                : sLower === 'rejected'
                  ? 'rejected'
                  : sLower === 'cancelled'
                    ? 'cancelled'
                    : 'pending';
            })(),
            propertyId: b.unit?.property?.property_id?.toString(),
            requestDate: b.bookingDate || b.checkInDate || b.checkin_date || b.booking_date,
            ownerName: b.unit?.property?.landlord?.user?.name || b.unit?.property?.landlord?.business_name || "Owner",
            ownerPhone: b.unit?.property?.landlord?.user?.phone_number || "",
            propertyTitle: b.unit?.property?.title || "",
            location: b.unit?.property?.address || "",
            payMethod: b.payment?.payment_method || b.payMethod || "cash",
          }));

          // Sort descending: latest checkInDate first
          mappedList.sort((a, b) => new Date(b.checkInDate || b.checkin_date) - new Date(a.checkInDate || a.checkin_date));
          setAllBookings(mappedList);

          // Use the latest confirmed/pending booking for the overview display
          const activeBooking = mappedList.find(b => ["approved", "pending"].includes(b.status)) || null;
          setBooking(activeBooking);

          if (activeBooking && activeBooking.unit?.property) {
            const rawImages = activeBooking.unit.property.properties_image || activeBooking.unit.property.propertiesImage;
            const imagesArray = typeof rawImages === "string" ? rawImages.split(",") : [];
            setBookedProperty({
              ...activeBooking.unit.property,
              id: activeBooking.unit.property.property_id?.toString(),
              location: activeBooking.unit.property.address,
              price: activeBooking.unit.price,
              image: imagesArray[0] || null,
              images: imagesArray,
            });
          } else {
            setBookedProperty(null);
          }
        } else {
          const stored = JSON.parse(localStorage.getItem("bookingRequests") || "[]");
          stored.sort((a, b) => new Date(b.startDate || b.checkInDate) - new Date(a.startDate || a.checkInDate));
          setAllBookings(stored);
          setBooking(stored[0] || null);
          if (stored[0] && stored[0].propertyId) {
            try {
              const propRes = await api.get(`/properties/${stored[0].propertyId}`);
              if (propRes.success && propRes.data) {
                const p = propRes.data;
                const rawImages = p.properties_image || p.propertiesImage;
                const imagesArray = p.images && p.images.length > 0 ? p.images : (typeof rawImages === "string" ? rawImages.split(",") : []);
                setBookedProperty({
                  ...p,
                  id: p.property_id?.toString() || p.id,
                  location: p.address,
                  price: p.price || (p.units && p.units.length > 0 ? p.units[0].price : 0),
                  image: imagesArray[0] || null,
                  images: imagesArray,
                });
              }
            } catch (propErr) {
              console.error("Failed to fetch fallback property:", propErr);
            }
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        const stored = JSON.parse(localStorage.getItem("bookingRequests") || "[]");
        stored.sort((a, b) => new Date(b.startDate || b.checkInDate) - new Date(a.startDate || a.checkInDate));
        setAllBookings(stored);
        setBooking(stored[0] || null);
        if (stored[0] && stored[0].propertyId) {
          try {
            const propRes = await api.get(`/properties/${stored[0].propertyId}`);
            if (propRes.success && propRes.data) {
              const p = propRes.data;
              const rawImages = p.properties_image || p.propertiesImage;
              const imagesArray = p.images && p.images.length > 0 ? p.images : (typeof rawImages === "string" ? rawImages.split(",") : []);
              setBookedProperty({
                ...p,
                id: p.property_id?.toString() || p.id,
                location: p.address,
                price: p.price || (p.units && p.units.length > 0 ? p.units[0].price : 0),
                image: imagesArray[0] || null,
                images: imagesArray,
              });
            }
          } catch (propErr) {
            console.error("Failed to fetch fallback property:", propErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(isAr ? "هل أنت متأكد من إلغاء هذا الحجز؟" : "Are you sure you want to cancel this booking?")) {
      return;
    }
    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.success) {
        alert(isAr ? "تم إلغاء الحجز بنجاح." : "Booking cancelled successfully.");
        const bookingsRes = await api.get("/bookings/my-bookings");
        if (bookingsRes.success && bookingsRes.data && bookingsRes.data.length > 0) {
          const mappedList = bookingsRes.data.map(b => ({
            ...b,
            status: b.status === "confirmed" ? "approved" : (b.status === "rejected" ? "rejected" : b.status === "cancelled" ? "cancelled" : "pending"),
            propertyId: b.unit?.property?.property_id?.toString(),
            requestDate: b.bookingDate || b.checkInDate || b.checkin_date || b.booking_date,
            ownerName: b.unit?.property?.landlord?.user?.name || b.unit?.property?.landlord?.business_name || "Owner",
            ownerPhone: b.unit?.property?.landlord?.user?.phone_number || "",
            propertyTitle: b.unit?.property?.title || "",
            location: b.unit?.property?.address || "",
            payMethod: b.payment?.payment_method || b.payMethod || "cash",
          }));
          mappedList.sort((a, b) => new Date(b.checkInDate || b.checkin_date) - new Date(a.checkInDate || a.checkin_date));
          setAllBookings(mappedList);
          const activeBooking = mappedList.find(b => ["approved", "pending"].includes(b.status)) || null;
          setBooking(activeBooking);
          if (activeBooking && activeBooking.unit?.property) {
            const rawImages = activeBooking.unit.property.properties_image || activeBooking.unit.property.propertiesImage;
            const imagesArray = typeof rawImages === "string" ? rawImages.split(",") : [];
            setBookedProperty({
              ...activeBooking.unit.property,
              id: activeBooking.unit.property.property_id?.toString(),
              location: activeBooking.unit.property.address,
              price: activeBooking.unit.price,
              image: imagesArray[0] || null,
              images: imagesArray,
            });
          } else {
            setBookedProperty(null);
          }
        } else {
          setAllBookings([]);
          setBooking(null);
          setBookedProperty(null);
        }
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      const errMsg = err.response?.data?.message || err.message;
      alert(isAr ? `فشل إلغاء الحجز: ${errMsg}` : `Failed to cancel booking: ${errMsg}`);
    }
  };

  /* حساب التواريخ للعقد */
  const startDate = booking ? new Date(booking.checkInDate || booking.startDate || booking.requestDate) : null;
  const getEndDate = () => {
    if (!startDate) return null;
    if (booking?.checkoutDate) return new Date(booking.checkoutDate);
    if (booking?.checkout_date) return new Date(booking.checkout_date);
    if (booking?.endDate) return new Date(booking.endDate);

    const period = booking?.rentalType || booking?.rentalPeriod || bookedProperty?.rentalPeriod || bookedProperty?.rental_period || "monthly";
    const end = new Date(startDate.getTime());
    if (period === "daily") {
      end.setDate(end.getDate() + 1);
    } else if (period === "seasonal" || period === "semester") {
      end.setMonth(end.getMonth() + 4);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  };
  const endDate = getEndDate();

  const formatD = (date) => date ? date.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  }) : "";

  const isApproved = booking?.status === "approved" && (booking.payment ? (!!booking.payment.payment_date || !!booking.payment.transaction_id) : false);

  /* الأقسام التي تحتاج حجز مسبق */
  const RESTRICTED_VIEWS = ["overview", "history", "maintenance", "billing"];
  const hasBooking = !!booking;

  /* تعريف عناصر القائمة الجانبية */
  const navItems = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: LayoutDashboard, color: "bg-blue-500" },
    { id: "maintenance", label: isAr ? "طلب صيانة" : "Maintenance", icon: Wrench, color: "bg-orange-500" },
    { id: "roommate", label: isAr ? "شريك السكن" : "Roommate", icon: Users, color: "bg-indigo-500" },
    { id: "billing", label: isAr ? "الفواتير والدفع" : "Billing & Payments", icon: CreditCard, color: "bg-teal-500" },
    { id: "favorites", label: isAr ? "المفضلة" : "Favorites", icon: Heart, color: "bg-rose-500" },
    { id: "history", label: isAr ? "سجل الحجز" : "History", icon: ClipboardList, color: "bg-emerald-500" },
    { id: "settings", label: isAr ? "الإعدادات" : "Settings", icon: Settings, color: "bg-slate-700" },
  ];

  /* هل القسم الحالي مقيد وما في حجز؟ */
  const isLocked = RESTRICTED_VIEWS.includes(activeView) && !hasBooking;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen w-screen bg-slate-50 dark:bg-[#0a0c10] text-slate-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative">
      <PageBackground />
      <InnerNavbar />

      {loading ? (
        /* شاشة التحميل الأولية */
        <div className="h-screen w-screen flex items-center justify-center relative z-10">
          <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* القائمة الجانبية */}
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              navItems={navItems}
              userName={userName}
              profileImage={profileImage}
              isAr={isAr}
            />

            {/* مساحة العرض الرئيسية */}
            <div className="lg:col-span-9">
              <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-white dark:border-white/10 rounded-[3rem] p-6 lg:p-8 min-h-[550px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* أقسام مقيدة بالحجز */}
                  {isLocked && (
                    <LockedView isAr={isAr} viewportVariants={viewportVariants} />
                  )}

                  {/* نظرة عامة */}
                  {activeView === "overview" && !isLocked && (
                    <OverviewView
                      booking={booking}
                      bookedProperty={bookedProperty}
                      isAr={isAr}
                      isApproved={isApproved}
                      formatD={formatD}
                      startDate={startDate}
                      endDate={endDate}
                      setActiveView={setActiveView}
                      viewportVariants={viewportVariants}
                    />
                  )}

                  {/* طلب الصيانة */}
                  {activeView === "maintenance" && !isLocked && (
                    <MaintenanceView
                      isAr={isAr}
                      setActiveView={setActiveView}
                      viewportVariants={viewportVariants}
                      booking={booking}
                    />
                  )}

                  {/* شريك السكن (متاح للجميع) */}
                  {activeView === "roommate" && (
                    <RoommateView
                      isAr={isAr}
                      viewportVariants={viewportVariants}
                    />
                  )}

                  {/* الفواتير والدفع */}
                  {activeView === "billing" && !isLocked && (
                    <BillingView
                      booking={booking}
                      isAr={isAr}
                      viewportVariants={viewportVariants}
                    />
                  )}

                  {/* سجل الحجوزات */}
                  {activeView === "history" && !isLocked && (
                    <HistoryView
                      allBookings={allBookings}
                      isAr={isAr}
                      formatD={formatD}
                      viewportVariants={viewportVariants}
                      onCancelBooking={handleCancelBooking}
                    />
                  )}

                  {/* المفضلة */}
                  {activeView === "favorites" && (
                    <FavoritesView
                      isAr={isAr}
                      viewportVariants={viewportVariants}
                    />
                  )}

                  {/* الإعدادات (متاحة للجميع) */}
                  {activeView === "settings" && (
                    <SettingsView isAr={isAr} viewportVariants={viewportVariants} />
                  )}


                </AnimatePresence>
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
}
